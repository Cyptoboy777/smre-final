/**
 * Sodex WebSocket Singleton Manager
 *
 * Module-level singleton — ONE WebSocket connection for the entire app lifetime.
 * Components never create their own WS connections; they subscribe to this manager
 * via the useSodexLive() hook.
 *
 * Design:
 * - Module-level state (not component state) → survives re-renders
 * - Subscribers register callbacks; manager fans messages out to all of them
 * - Exponential back-off reconnect (1s → 30s cap)
 * - Heartbeat/ping-pong every 50s with 15s pong timeout
 * - Intentional-close flag prevents reconnect on deliberate teardown
 */

import type { SodexWsMessage } from '@/types/sodex';

export const SODEX_SPOT_WS_URL = 'wss://mainnet-gw.sodex.dev/ws/spot';
export const SODEX_PERPS_WS_URL = 'wss://mainnet-gw.sodex.dev/ws/perps';

const HEARTBEAT_MS = 50_000;
const PONG_TIMEOUT_MS = 15_000;
const HEARTBEAT_CHECK_INTERVAL_MS = 5_000;
const MAX_RECONNECT_DELAY_MS = 30_000;

export type WsConnectionStatus =
    | 'idle'
    | 'connecting'
    | 'open'
    | 'reconnecting'
    | 'closed'
    | 'error';

export type WsSubscriber = {
    onMessage: (msg: SodexWsMessage) => void;
    onStatusChange?: (status: WsConnectionStatus) => void;
};

// ─── Module-level singleton state ─────────────────────────────────────────────

class SodexWsManager {
    private socket: WebSocket | null = null;
    private status: WsConnectionStatus = 'idle';
    private subscribers = new Set<WsSubscriber>();
    private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
    private heartbeatTimer: ReturnType<typeof setInterval> | null = null;
    private reconnectAttempts = 0;
    private lastActivityAt = Date.now();
    private awaitingPongAt: number | null = null;
    private intentionalClose = false;
    private readonly url: string;
    private readonly subscribePayloads: unknown[];

    constructor(url: string, subscribePayloads: unknown[] = []) {
        this.url = url;
        this.subscribePayloads = subscribePayloads;
    }

    // ── Subscriber management ─────────────────────────────────────────────────

    subscribe(sub: WsSubscriber): () => void {
        this.subscribers.add(sub);

        // Notify the new subscriber of current status immediately
        sub.onStatusChange?.(this.status);

        // Auto-connect when first subscriber arrives
        if (this.subscribers.size === 1 && this.status === 'idle') {
            this.connect();
        }

        // Return unsubscribe function
        return () => {
            this.subscribers.delete(sub);
            // Auto-disconnect when last subscriber leaves
            if (this.subscribers.size === 0) {
                this.teardown();
            }
        };
    }

    get currentStatus(): WsConnectionStatus {
        return this.status;
    }

    // ── Internal ──────────────────────────────────────────────────────────────

    private setStatus(next: WsConnectionStatus) {
        if (this.status === next) return;
        this.status = next;
        for (const sub of this.subscribers) {
            sub.onStatusChange?.(next);
        }
    }

    private emit(msg: SodexWsMessage) {
        for (const sub of this.subscribers) {
            sub.onMessage(msg);
        }
    }

    private clearTimers() {
        if (this.reconnectTimer !== null) {
            clearTimeout(this.reconnectTimer);
            this.reconnectTimer = null;
        }
        if (this.heartbeatTimer !== null) {
            clearInterval(this.heartbeatTimer);
            this.heartbeatTimer = null;
        }
    }

    private scheduleReconnect() {
        this.clearTimers();
        this.setStatus('reconnecting');
        this.reconnectAttempts += 1;
        const delay = Math.min(
            MAX_RECONNECT_DELAY_MS,
            1000 * 2 ** Math.min(this.reconnectAttempts, 5)
        );
        this.reconnectTimer = setTimeout(() => this.connect(), delay);
    }

    private connect() {
        this.clearTimers();
        this.intentionalClose = true;
        this.socket?.close();
        this.intentionalClose = false;

        this.setStatus('connecting');

        const socket = new WebSocket(this.url);
        this.socket = socket;

        socket.onopen = () => {
            this.reconnectAttempts = 0;
            this.lastActivityAt = Date.now();
            this.awaitingPongAt = null;
            this.setStatus('open');

            // Send subscription payloads
            for (const payload of this.subscribePayloads) {
                socket.send(JSON.stringify(payload));
            }

            // Start heartbeat
            this.heartbeatTimer = setInterval(() => {
                if (socket.readyState !== WebSocket.OPEN) return;

                const now = Date.now();

                // Pong timeout — close the dead socket
                if (
                    this.awaitingPongAt !== null &&
                    now - this.awaitingPongAt >= PONG_TIMEOUT_MS &&
                    now - this.lastActivityAt >= PONG_TIMEOUT_MS
                ) {
                    socket.close();
                    return;
                }

                // Send ping if idle long enough
                if (
                    this.awaitingPongAt === null &&
                    now - this.lastActivityAt >= HEARTBEAT_MS
                ) {
                    socket.send(JSON.stringify({ op: 'ping' }));
                    this.awaitingPongAt = now;
                }
            }, HEARTBEAT_CHECK_INTERVAL_MS);
        };

        socket.onmessage = (event: MessageEvent<string>) => {
            this.lastActivityAt = Date.now();
            this.awaitingPongAt = null;

            try {
                const parsed = JSON.parse(event.data) as SodexWsMessage;

                // Absorb server pings — reply with pong
                if ((parsed as { op?: string }).op === 'ping') {
                    socket.send(JSON.stringify({ op: 'pong' }));
                    return;
                }

                // Absorb our own pong confirmations
                if ((parsed as { op?: string }).op === 'pong') {
                    return;
                }

                this.emit(parsed);
            } catch {
                // Swallow parse errors — malformed frames are not fatal
            }
        };

        socket.onerror = () => {
            this.setStatus('error');
        };

        socket.onclose = () => {
            this.clearTimers();
            this.awaitingPongAt = null;
            this.setStatus('closed');

            if (!this.intentionalClose) {
                this.scheduleReconnect();
            }
        };
    }

    private teardown() {
        this.clearTimers();
        this.intentionalClose = true;
        this.socket?.close();
        this.socket = null;
        this.setStatus('idle');
        this.intentionalClose = false;
    }
}

// ─── Singleton instances (one per market) ─────────────────────────────────────

let _spotManager: SodexWsManager | null = null;
let _perpsManager: SodexWsManager | null = null;

/**
 * Returns the singleton manager for a given market.
 * Safe to call from any React component — only one socket is ever opened.
 */
export const getSodexWsManager = (market: 'spot' | 'perps'): SodexWsManager => {
    if (market === 'spot') {
        if (!_spotManager) {
            _spotManager = new SodexWsManager(SODEX_SPOT_WS_URL);
        }
        return _spotManager;
    }

    if (!_perpsManager) {
        _perpsManager = new SodexWsManager(SODEX_PERPS_WS_URL);
    }
    return _perpsManager;
};
