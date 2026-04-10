import "server-only";
import { getRequiredServerEnv, SERVER_ENV_KEYS } from "@/lib/server/env";

export class SodexRestClient {
  constructor() {
    getRequiredServerEnv(SERVER_ENV_KEYS.sodexPrivateKey);
  }

  async getMarketSnapshot() {
    throw new Error("Phase 2 will implement the Sodex REST client.");
  }

  async getPortfolioSnapshot() {
    throw new Error("Phase 2 will implement the Sodex portfolio client.");
  }

  async submitTrade() {
    throw new Error("Phase 2 will implement the Sodex trade client.");
  }
}
