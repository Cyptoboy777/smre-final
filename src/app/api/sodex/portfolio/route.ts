import { jsonNotImplemented } from "@/lib/server/route-response";

export const runtime = "nodejs";

export async function GET() {
  return jsonNotImplemented({
    route: "/api/sodex/portfolio",
    provider: "sodex",
    message: "Phase 1 scaffold complete. Sodex portfolio query is deferred.",
  });
}
