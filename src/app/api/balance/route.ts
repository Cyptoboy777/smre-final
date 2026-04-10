import { jsonNotImplemented } from "@/lib/server/route-response";

export const runtime = "nodejs";

export async function GET() {
  return jsonNotImplemented({
    route: "/api/balance",
    deprecated: true,
    replacement: "/api/sodex/balance",
  });
}
