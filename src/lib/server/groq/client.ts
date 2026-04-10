import "server-only";
import { getRequiredServerEnv, SERVER_ENV_KEYS } from "@/lib/server/env";

export class GroqServerClient {
  constructor() {
    getRequiredServerEnv(SERVER_ENV_KEYS.groqApiKey);
  }

  async createQuantBriefing() {
    throw new Error("Phase 2 will implement Groq server completions.");
  }
}
