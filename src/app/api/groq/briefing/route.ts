import { jsonNotImplemented } from "@/lib/server/route-response";

export const runtime = "nodejs";

export async function POST() {
  return jsonNotImplemented({
    route: "/api/groq/briefing",
    provider: "groq",
    message: "Phase 1 scaffold complete. Groq server integration is deferred.",
  });
}
