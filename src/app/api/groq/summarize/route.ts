import { jsonNotImplemented } from "@/lib/server/route-response";

export const runtime = "nodejs";

export async function POST() {
  return jsonNotImplemented({
    route: "/api/groq/summarize",
    provider: "groq",
    message: "Phase 1 scaffold complete. Summary generation is deferred.",
  });
}
