import { jsonSuccess, handleRoute } from "@/lib/server/route-response";
import { SodexRestClient } from "@/lib/server/sodex/rest-client";
import { type SodexMarket } from "@/types/sodex";

export const runtime = "nodejs";

export async function GET(request: Request) {
  return handleRoute(async () => {
    const { searchParams } = new URL(request.url);
    const market = (searchParams.get("market") as SodexMarket) || "spot";
    
    const client = new SodexRestClient(market);
    const snapshot = await client.getPortfolioSnapshot();

    return jsonSuccess({
      ...snapshot,
    });
  });
}

