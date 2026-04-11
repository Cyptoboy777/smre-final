import { jsonSuccess, handleRoute } from "@/lib/server/route-response";
import { SodexRestClient } from "@/lib/server/sodex/rest-client";
import { type SodexMarket } from "@/types/sodex";

export const runtime = "nodejs";

export async function POST(request: Request) {
  return handleRoute(async () => {
    const body = await request.json();
    const { symbol, amount, direction, orderType = "MARKET", market = "perps" } = body;

    if (!symbol || !amount || !direction) {
      throw new Error("Missing required trade parameters: symbol, amount, direction");
    }

    const client = new SodexRestClient(market as SodexMarket);
    const result = await client.submitTrade({
      symbol,
      quantity: String(amount),
      side: direction === "LONG" ? "BUY" : "SELL",
      orderType: orderType,
    });

    return jsonSuccess({
      result,
    });
  });
}

