import { NextResponse } from "next/server";
import { GroqServerClient } from "@/lib/server/groq/client";
import { SodexRestClient } from "@/lib/server/sodex/rest-client";

export const runtime = "nodejs";

export async function GET() {
  try {
    const sodex = new SodexRestClient("perps");
    const groq = new GroqServerClient();

    // Fetch snapshot to provide context for AI
    const marketSnapshot = await sodex.getMarketSnapshot();

    const analysis = await groq.createQuantBriefing({
      timestamp: new Date().toISOString(),
      marketSnapshot,
      scope: "institutional-microstructure",
    });

    return NextResponse.json({
      success: true,
      ...analysis,
    });
  } catch (error: any) {
    console.error("[API/Groq] Quant analysis failed:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to generate quant intelligence.",
      },
      { status: 500 }
    );
  }
}
