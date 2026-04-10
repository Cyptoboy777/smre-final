import { jsonNotImplemented } from "@/lib/server/route-response";

export const runtime = "nodejs";

export async function GET() {
  return jsonNotImplemented({
    route: "/api/groq/quant-intelligence",
    provider: "groq",
    message: "Phase 1 scaffold complete. Quant intelligence generation is deferred.",
  });
}
