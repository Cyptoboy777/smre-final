import { jsonNotImplemented } from "@/lib/server/route-response";

export const runtime = "nodejs";

export async function GET() {
  return jsonNotImplemented({
    route: "/api/news",
    deprecated: true,
    replacement: "/api/groq/briefing",
  });
}
