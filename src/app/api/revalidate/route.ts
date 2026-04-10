import { jsonNotImplemented } from "@/lib/server/route-response";

export const runtime = "nodejs";

export async function POST() {
  return jsonNotImplemented({
    route: "/api/revalidate",
    nextStep: "Wire targeted cache invalidation once live data flows are enabled.",
  });
}
