"use pure";

import axios from "axios";
import { getRequiredServerEnv, SERVER_ENV_KEYS } from "@/lib/server/env";
import { signSodexRequest, SodexMarket } from "@/lib/eip712-signer";
import { PortfolioSnapshot, SodexOrder, MarketPulseItem } from "@/types/sodex";

const SPOT_BASE_URL = "https://mainnet-gw.sodex.dev/api/v1/spot";
const PERPS_BASE_URL = "https://mainnet-gw.sodex.dev/api/v1/perps";

export class SodexRestClient {
  private readonly market: SodexMarket;
  private readonly baseUrl: string;

  constructor(market: SodexMarket = "spot") {
    this.market = market;
    this.baseUrl = market === "spot" ? SPOT_BASE_URL : PERPS_BASE_URL;
  }

  private async request<T>(path: string, method: "GET" | "POST", payload: any = {}): Promise<T> {
    const nonce = Date.now();
    const headers = await signSodexRequest(this.market, payload, nonce);

    const config = {
      url: `${this.baseUrl}${path}`,
      method,
      headers: {
        ...headers,
        "Accept": "application/json",
        "Content-Type": "application/json",
      },
      params: method === "GET" ? payload : undefined,
      data: method === "POST" ? payload : undefined,
      timeout: 10000,
    };

    try {
      const response = await axios(config);
      return response.data;
    } catch (error: any) {
      const msg = error.response?.data?.message || error.message;
      throw new Error(`Sodex API Error [${method} ${path}]: ${msg}`);
    }
  }

  /**
   * Public: Fetch market snapshot
   */
  async getMarketSnapshot(): Promise<MarketPulseItem[]> {
    const data: any = await this.request("/public/snapshot", "GET");
    
    // Mapping raw ticker data to MarketPulseItem
    const items = Array.isArray(data) ? data : (data.items || []);
    return items.map((item: any) => ({
      symbol: item.s,
      price: String(item.p || item.last_price || "0"),
      change: String(item.c || item.price_change_percent || "0"),
      isUp: parseFloat(item.c || item.price_change_percent || "0") >= 0,
      market: this.market,
      bidPrice: item.b,
      askPrice: item.a,
      volume24h: item.v,
    }));
  }

  /**
   * Private: Fetch account balance and trades
   */
  async getPortfolioSnapshot(): Promise<PortfolioSnapshot> {
    const data: any = await this.request("/private/account/snapshot", "POST");
    
    return {
      address: data.address || "",
      balances: (data.balances || []).map((b: any) => ({
        asset: b.asset,
        free: String(b.free || "0"),
        locked: String(b.locked || "0"),
        total: String(b.total || "0"),
        market: this.market,
      })),
      recentOrders: (data.orders || []).map((o: any) => this.mapOrder(o)),
      fetchedAt: new Date().toISOString(),
    };
  }

  /**
   * Private: Fetch orders for a specific symbol
   */
  async getOrders(symbol?: string, limit: number = 20): Promise<SodexOrder[]> {
    const payload: any = { limit };
    if (symbol) payload.symbol = symbol;
    
    const data: any = await this.request("/private/order/history", "POST", payload);
    const orders = Array.isArray(data) ? data : (data.orders || []);
    return orders.map((o: any) => this.mapOrder(o));
  }

  /**
   * Private: Submit new order
   */
  async submitTrade(order: Partial<SodexOrder>) {
    return this.request("/private/order/submit", "POST", order);
  }

  private mapOrder(o: any): SodexOrder {
    return {
      id: String(o.id || o.i || ""),
      symbol: o.symbol || o.s || "",
      side: o.side || o.S || "BUY",
      orderType: o.type || o.o || "LIMIT",
      status: o.status || o.X || "FILLED",
      price: String(o.price || o.p || "0"),
      quantity: String(o.quantity || o.q || "0"),
      filled: String(o.filled || o.z || "0"),
      market: this.market,
    };
  }
}

