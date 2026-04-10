import { jsonNotImplemented } from "@/lib/server/route-response";

export const runtime = "nodejs";

export async function GET() {
  return jsonNotImplemented({
    route: "/api/market",
    deprecated: true,
    replacement: "/api/sodex/market",
  });
}
