import { jsonNotImplemented } from "@/lib/server/route-response";

export const runtime = "nodejs";

export async function GET() {
  return jsonNotImplemented({
    route: "/api/sodex/session",
    provider: "sodex",
    message: "Phase 1 scaffold complete. Server-side session bootstrapping is deferred.",
  });
}
