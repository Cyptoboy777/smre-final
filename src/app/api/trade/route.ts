import { jsonNotImplemented } from "@/lib/server/route-response";

export const runtime = "nodejs";

export async function POST() {
  return jsonNotImplemented({
    route: "/api/trade",
    deprecated: true,
    replacement: "/api/sodex/trade",
  });
}
