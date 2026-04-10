export const SODEX_SPOT_WS_URL = "wss://mainnet-gw.sodex.dev/ws/spot";
export const SODEX_PERPS_WS_URL = "wss://mainnet-gw.sodex.dev/ws/perps";

const KEEP_ALIVE_INTERVAL_MS = 50_000;
const BASE_RECONNECT_DELAY_MS = 1_000;
const MAX_RECONNECT_DELAY_MS = 30_000;
const RECONNECT_JITTER_MS = 250;

export type SodexMarket = "spot" | "perps";

export type WsConnectionStatus =
  | "idle"
  | "connecting"
  | "open"
  | "reconnecting"
  | "closed"
  | "error";

export type SodexWireMessage = Record<string, unknown> & {
  channel?: string;
  ch?: string;
  op?: string;
  type?: string;
  data?: unknown;
};

export type SodexSubscriptionMessage = Readonly<{
  op: "subscribe" | "unsubscribe";
  params: Record<string, unknown>;
}>;

export type WsSubscriber<TMessage extends SodexWireMessage = SodexWireMessage> = {
  onMessage: (message: TMessage) => void;
  onStatusChange?: (status: WsConnectionStatus) => void;
  channel?: string;
  subscribeMessage?: SodexSubscriptionMessage;
  matches?: (message: TMessage) => boolean;
};

type InternalSubscriber = {
  id: number;
  channel?: string;
  subscriptionKey?: string;
  onMessage: (message: SodexWireMessage) => void;
  onStatusChange?: (status: WsConnectionStatus) => void;
  matches?: (message: SodexWireMessage) => boolean;
};

type RegisteredSubscription = {
  count: number;
  subscribeMessage: SodexSubscriptionMessage;
};

type RegisterSubscriptionResult = {
  key: string;
  created: boolean;
};

const singletonRegistry = new Map<string, SodexWebSocketManager>();

function stableStringify(value: unknown): string {
  if (value === null || typeof value !== "object") {
    return JSON.stringify(value);
  }

  if (Array.isArray(value)) {
    return `[${value.map((entry) => stableStringify(entry)).join(",")}]`;
  }

  const entries = Object.entries(value as Record<string, unknown>)
    .filter(([, entry]) => entry !== undefined)
    .sort(([leftKey], [rightKey]) => leftKey.localeCompare(rightKey));

  return `{${entries
    .map(([key, entry]) => `${JSON.stringify(key)}:${stableStringify(entry)}`)
    .join(",")}}`;
}

function getSubscriptionKey(message: SodexSubscriptionMessage) {
  return stableStringify(message);
}

function getUnsubscribeMessage(
  subscribeMessage: SodexSubscriptionMessage,
): SodexSubscriptionMessage {
  return {
    op: "unsubscribe",
    params: subscribeMessage.params,
  };
}

function getMessageChannel(message: SodexWireMessage) {
  if (typeof message.channel === "string" && message.channel.length > 0) {
    return message.channel;
  }

  if (typeof message.ch === "string" && message.ch.length > 0) {
    return message.ch;
  }

  return undefined;
}

export function createSodexSubscribeMessage(
  channel: string,
  params: Record<string, unknown> = {},
): SodexSubscriptionMessage {
  return {
    op: "subscribe",
    params: {
      channel,
      ...params,
    },
  };
}

export class SodexWebSocketManager {
  private socket: WebSocket | null = null;
  private status: WsConnectionStatus = "idle";
  private readonly url: string;
  private keepAliveTimer: ReturnType<typeof setInterval> | null = null;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private reconnectAttempts = 0;
  private nextSubscriberId = 1;
  private readonly subscribers = new Map<number, InternalSubscriber>();
  private readonly registeredSubscriptions = new Map<string, RegisteredSubscription>();
  private shouldReconnect = false;

  constructor(url = SODEX_SPOT_WS_URL) {
    this.url = url;
  }

  get currentStatus() {
    return this.status;
  }

  connect() {
    if (typeof WebSocket === "undefined") {
      this.setStatus("error");
      return;
    }

    if (
      this.socket &&
      (this.socket.readyState === WebSocket.OPEN ||
        this.socket.readyState === WebSocket.CONNECTING)
    ) {
      return;
    }

    this.clearReconnectTimer();
    this.shouldReconnect = this.subscribers.size > 0;
    this.setStatus(this.reconnectAttempts > 0 ? "reconnecting" : "connecting");

    const socket = new WebSocket(this.url);
    this.socket = socket;

    socket.onopen = () => {
      this.reconnectAttempts = 0;
      this.setStatus("open");
      this.startKeepAlive();
      this.resubscribeAll();
    };

    socket.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data) as SodexWireMessage;

        if (message.op === "ping") {
          this.send({ op: "pong" });
          return;
        }

        if (message.op === "pong") {
          return;
        }

        this.dispatch(message);
      } catch (error) {
        console.warn("[SoDEX WS] Failed to parse websocket message.", error);
      }
    };

    socket.onerror = () => {
      this.setStatus("error");
    };

    socket.onclose = () => {
      this.socket = null;
      this.stopKeepAlive();

      if (!this.shouldReconnect || this.subscribers.size === 0) {
        this.setStatus("idle");
        return;
      }

      this.setStatus("closed");
      this.scheduleReconnect();
    };
  }

  disconnect() {
    this.shouldReconnect = false;
    this.clearReconnectTimer();
    this.stopKeepAlive();

    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }

    this.setStatus("idle");
  }

  send(payload: unknown) {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
      return false;
    }

    this.socket.send(JSON.stringify(payload));
    return true;
  }

  subscribe<TMessage extends SodexWireMessage = SodexWireMessage>(
    subscriber: WsSubscriber<TMessage>,
  ) {
    const id = this.nextSubscriberId++;
    const registeredSubscription = subscriber.subscribeMessage
      ? this.registerSubscription(subscriber.subscribeMessage)
      : null;
    const internalSubscriber: InternalSubscriber = {
      id,
      channel: subscriber.channel,
      subscriptionKey: registeredSubscription?.key,
      onMessage: subscriber.onMessage as (message: SodexWireMessage) => void,
      onStatusChange: subscriber.onStatusChange,
      matches: subscriber.matches as ((message: SodexWireMessage) => boolean) | undefined,
    };

    this.subscribers.set(id, internalSubscriber);
    subscriber.onStatusChange?.(this.status);

    if (this.subscribers.size === 1) {
      this.shouldReconnect = true;
      this.connect();
    } else if (this.status === "open" && subscriber.subscribeMessage && registeredSubscription?.created) {
      this.send(subscriber.subscribeMessage);
    }

    return () => {
      const current = this.subscribers.get(id);
      if (!current) {
        return;
      }

      this.subscribers.delete(id);

      if (current.subscriptionKey) {
        this.unregisterSubscription(current.subscriptionKey);
      }

      if (this.subscribers.size === 0) {
        this.disconnect();
      }
    };
  }

  subscribeToChannel<TMessage extends SodexWireMessage = SodexWireMessage>(options: {
    channel: string;
    params?: Record<string, unknown>;
    onMessage: (message: TMessage) => void;
    onStatusChange?: (status: WsConnectionStatus) => void;
    matches?: (message: TMessage) => boolean;
  }) {
    return this.subscribe<TMessage>({
      channel: options.channel,
      subscribeMessage: createSodexSubscribeMessage(options.channel, options.params),
      onMessage: options.onMessage,
      onStatusChange: options.onStatusChange,
      matches: options.matches,
    });
  }

  private setStatus(nextStatus: WsConnectionStatus) {
    if (this.status === nextStatus) {
      return;
    }

    this.status = nextStatus;
    for (const subscriber of this.subscribers.values()) {
      subscriber.onStatusChange?.(nextStatus);
    }
  }

  private dispatch(message: SodexWireMessage) {
    const messageChannel = getMessageChannel(message);

    for (const subscriber of this.subscribers.values()) {
      try {
        const matches = subscriber.matches
          ? subscriber.matches(message)
          : subscriber.channel
            ? subscriber.channel === messageChannel
            : true;

        if (matches) {
          subscriber.onMessage(message);
        }
      } catch (error) {
        console.warn("[SoDEX WS] Subscriber callback failed.", error);
      }
    }
  }

  private startKeepAlive() {
    this.stopKeepAlive();
    this.keepAliveTimer = setInterval(() => {
      this.send({ op: "ping" });
    }, KEEP_ALIVE_INTERVAL_MS);
  }

  private stopKeepAlive() {
    if (this.keepAliveTimer) {
      clearInterval(this.keepAliveTimer);
      this.keepAliveTimer = null;
    }
  }

  private clearReconnectTimer() {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
  }

  private scheduleReconnect() {
    this.clearReconnectTimer();

    const baseDelay = Math.min(
      MAX_RECONNECT_DELAY_MS,
      BASE_RECONNECT_DELAY_MS * 2 ** Math.min(this.reconnectAttempts, 5),
    );
    const jitter = Math.floor(Math.random() * RECONNECT_JITTER_MS);
    this.reconnectAttempts += 1;

    this.setStatus("reconnecting");
    this.reconnectTimer = setTimeout(() => {
      this.connect();
    }, baseDelay + jitter);
  }

  private registerSubscription(subscribeMessage: SodexSubscriptionMessage): RegisterSubscriptionResult {
    const subscriptionKey = getSubscriptionKey(subscribeMessage);
    const current = this.registeredSubscriptions.get(subscriptionKey);

    if (current) {
      current.count += 1;
      return {
        key: subscriptionKey,
        created: false,
      };
    }

    this.registeredSubscriptions.set(subscriptionKey, {
      count: 1,
      subscribeMessage,
    });

    return {
      key: subscriptionKey,
      created: true,
    };
  }

  private unregisterSubscription(subscriptionKey: string) {
    const current = this.registeredSubscriptions.get(subscriptionKey);
    if (!current) {
      return;
    }

    current.count -= 1;
    if (current.count > 0) {
      return;
    }

    this.registeredSubscriptions.delete(subscriptionKey);

    if (this.status === "open") {
      this.send(getUnsubscribeMessage(current.subscribeMessage));
    }
  }

  private resubscribeAll() {
    for (const { subscribeMessage } of this.registeredSubscriptions.values()) {
      this.send(subscribeMessage);
    }
  }
}

export function getSodexWsManager(market: SodexMarket) {
  const url = market === "spot" ? SODEX_SPOT_WS_URL : SODEX_PERPS_WS_URL;
  const existing = singletonRegistry.get(url);

  if (existing) {
    return existing;
  }

  const manager = new SodexWebSocketManager(url);
  singletonRegistry.set(url, manager);
  return manager;
}
