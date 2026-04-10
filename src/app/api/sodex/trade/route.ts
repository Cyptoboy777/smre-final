import { jsonNotImplemented } from "@/lib/server/route-response";

export const runtime = "nodejs";

export async function POST() {
  return jsonNotImplemented({
    route: "/api/sodex/trade",
    provider: "sodex",
    message: "Phase 1 scaffold complete. Trade execution is deferred.",
  });
}
