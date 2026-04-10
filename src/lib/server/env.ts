import "server-only";

export const SERVER_ENV_KEYS = {
  sodexPrivateKey: "SODEX_API_PRIVATE_KEY",
  groqApiKey: "GROQ_API_KEY",
} as const;

type ServerEnvKey = (typeof SERVER_ENV_KEYS)[keyof typeof SERVER_ENV_KEYS];

export function getRequiredServerEnv(name: ServerEnvKey) {
  const value = process.env[name];

  if (!value) {
    throw new Error(`${name} is required on the server. No client fallback is allowed.`);
  }

  return value;
}

export function hasServerEnv(name: ServerEnvKey) {
  return Boolean(process.env[name]);
}
