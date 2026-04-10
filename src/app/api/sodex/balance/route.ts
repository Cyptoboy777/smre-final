import { NextResponse } from "next/server";
import { SodexRestClient } from "@/lib/server/sodex/rest-client";
import { SodexMarket } from "@/lib/eip712-signer";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const market = (searchParams.get("market") as SodexMarket) || "spot";

  try {
    const client = new SodexRestClient(market);
    const snapshot = await client.getPortfolioSnapshot();

    return NextResponse.json({
      success: true,
      ...snapshot,
    });
  } catch (error: any) {
    console.error(`[API/Balance] Failed to fetch ${market} balance:`, error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to fetch balance from Sodex.",
      },
      { status: error.response?.status || 500 }
    );
  }
}
