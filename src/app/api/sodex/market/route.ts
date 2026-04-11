import { jsonSuccess, handleRoute } from "@/lib/server/route-response";
import { SodexRestClient } from "@/lib/server/sodex/rest-client";
import { type SodexMarket } from "@/types/sodex";

export const runtime = "nodejs";

export async function GET(request: Request) {
  return handleRoute(async () => {
    const { searchParams } = new URL(request.url);
    const market = (searchParams.get("market") as SodexMarket) || "spot";
    const symbol = searchParams.get("symbol");

    const client = new SodexRestClient(market);
    const items = await client.getMarketSnapshot();
    
    // Filter by symbol if requested
    const filtered = symbol 
      ? items.filter(i => i.symbol === symbol)
      : items;

    return jsonSuccess({
      market,
      items: filtered,
      source: "sodex",
    });
  });
}

