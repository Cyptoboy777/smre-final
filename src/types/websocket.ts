export type SodexWsChannel = "ticker" | "orderbook" | "portfolio";

export type SodexWsMessage = {
  channel: SodexWsChannel;
  payload: unknown;
  receivedAt: number;
};
