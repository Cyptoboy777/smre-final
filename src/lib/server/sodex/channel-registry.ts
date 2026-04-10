import type { SodexWsChannel } from "@/types/websocket";

export const SODEX_CHANNEL_REGISTRY: Record<SodexWsChannel, string> = {
  ticker: "ticker",
  orderbook: "orderbook",
  portfolio: "portfolio",
};
