import "server-only";
import axios from "axios";
import { getRequiredServerEnv, SERVER_ENV_KEYS } from "@/lib/server/env";
import { signSodexRequest, SodexMarket } from "@/lib/eip712-signer";
import { PortfolioSnapshot, SodexOrder } from "@/types/sodex";

const SPOT_BASE_URL = "https://mainnet-gw.sodex.dev/api/v1/spot";
const PERPS_BASE_URL = "https://mainnet-gw.sodex.dev/api/v1/perps";

export class SodexRestClient {
  private readonly market: SodexMarket;
  private readonly baseUrl: string;

  constructor(market: SodexMarket = "spot") {
    this.market = market;
    this.baseUrl = market === "spot" ? SPOT_BASE_URL : PERPS_BASE_URL;
    getRequiredServerEnv(SERVER_ENV_KEYS.sodexPrivateKey);
  }

  private async request<T>(path: string, method: "GET" | "POST", payload: any = {}): Promise<T> {
    const nonce = Date.now();
    const headers = await signSodexRequest(this.market, payload, nonce);

    const response = await axios({
      url: `${this.baseUrl}${path}`,
      method,
      headers: {
        ...headers,
        "Content-Type": "application/json",
      },
      data: method === "POST" ? payload : undefined,
      params: method === "GET" ? payload : undefined,
    });

    return response.data;
  }

  async getMarketSnapshot() {
    return this.request("/public/snapshot", "GET");
  }

  async getPortfolioSnapshot(): Promise<PortfolioSnapshot> {
    const data: any = await this.request("/private/account/snapshot", "POST");
    
    // Mapping raw data to UI types
    return {
      address: data.address || "",
      balances: (data.balances || []).map((b: any) => ({
        asset: b.asset,
        free: String(b.free || "0"),
        locked: String(b.locked || "0"),
        total: String(b.total || "0"),
        market: this.market,
      })),
      recentOrders: (data.orders || []).map((o: any) => ({
        id: String(o.id),
        symbol: o.symbol,
        side: o.side,
        orderType: o.type,
        status: o.status,
        price: String(o.price || "0"),
        quantity: String(o.quantity || "0"),
        filled: String(o.filled || "0"),
        market: this.market,
      })),
      fetchedAt: new Date().toISOString(),
    };
  }

  async submitTrade(order: Partial<SodexOrder>) {
    return this.request("/private/order/submit", "POST", order);
  }
}
