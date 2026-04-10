import { jsonNotImplemented } from "@/lib/server/route-response";

export const runtime = "nodejs";

export async function GET() {
  return jsonNotImplemented({
    route: "/api/sodex/orders",
    provider: "sodex",
    message: "Phase 1 scaffold complete. Sodex orders query is deferred.",
  });
}
