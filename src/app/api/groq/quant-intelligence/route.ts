import { jsonSuccess, jsonError, handleRoute } from "@/lib/server/route-response";
import { GroqServerClient } from "@/lib/server/groq/client";
import { SodexRestClient } from "@/lib/server/sodex/rest-client";

export const runtime = "nodejs";

export async function GET() {
  return handleRoute(async () => {
    try {
      const sodex = new SodexRestClient("perps");
      const groq = new GroqServerClient();

      // Fetch snapshot to provide context for AI
      // The client now returns the mapped MarketPulseItem array
      const marketSnapshot = await sodex.getMarketSnapshot();

      const analysis = await groq.createQuantBriefing({
        timestamp: new Date().toISOString(),
        marketSnapshot,
        scope: "institutional-microstructure",
      });

      return jsonSuccess({
        ...analysis,
      });
    } catch (error: any) {
      console.error("[API/Groq] Quant analysis failed:", error.message);
      return jsonError(
        error.message || "Failed to generate quant intelligence.",
        500
      );
    }
  });
}

