import "server-only";
import { getRequiredServerEnv, SERVER_ENV_KEYS } from "@/lib/server/env";

export async function signSodexTypedData() {
  getRequiredServerEnv(SERVER_ENV_KEYS.sodexPrivateKey);
  throw new Error("Phase 2 will implement the Sodex EIP-712 signer.");
}
