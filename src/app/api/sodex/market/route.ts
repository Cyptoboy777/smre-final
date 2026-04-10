import { jsonNotImplemented } from "@/lib/server/route-response";

export const runtime = "nodejs";

export async function GET() {
  return jsonNotImplemented({
    route: "/api/sodex/market",
    provider: "sodex",
    message: "Phase 1 scaffold complete. Sodex market REST wiring is deferred.",
  });
}
