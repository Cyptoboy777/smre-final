import { APP_NAME, APP_PHASE } from "@/config/app";
import { FEATURE_FLAGS } from "@/config/feature-flags";
import { jsonSuccess } from "@/lib/server/route-response";

export const runtime = "nodejs";

export async function GET() {
  return jsonSuccess({
    name: APP_NAME,
    phase: APP_PHASE,
    status: "ok",
    features: FEATURE_FLAGS,
    serverOnlySecrets: ["SODEX_API_PRIVATE_KEY", "GROQ_API_KEY"],
  });
}
