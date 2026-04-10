import "server-only";
import type { SodexWsChannel, SodexWsMessage } from "@/types/websocket";

type SodexListener = (message: SodexWsMessage) => void;

export class SodexWebSocketManager {
  private static instance: SodexWebSocketManager | null = null;
  private readonly listeners = new Map<SodexWsChannel, Set<SodexListener>>();

  static getInstance() {
    if (!SodexWebSocketManager.instance) {
      SodexWebSocketManager.instance = new SodexWebSocketManager();
    }

    return SodexWebSocketManager.instance;
  }

  subscribe(channel: SodexWsChannel, listener: SodexListener) {
    const listeners = this.listeners.get(channel) ?? new Set<SodexListener>();
    listeners.add(listener);
    this.listeners.set(channel, listeners);

    return () => {
      listeners.delete(listener);
      if (listeners.size === 0) {
        this.listeners.delete(channel);
      }
    };
  }

  connect() {
    throw new Error("Phase 2 will implement the singleton Sodex websocket manager.");
  }
}

export const sodexWebSocketManager = SodexWebSocketManager.getInstance();
