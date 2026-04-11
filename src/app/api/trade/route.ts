import { handleRoute } from "@/lib/server/route-response";
import { POST as sodexPOST } from "../sodex/trade/route";

export const runtime = "nodejs";

export async function POST(request: Request) {
  return handleRoute(async () => {
    return sodexPOST(request);
  });
}

