import "server-only";

import { ethers, type TypedDataField } from "ethers";

export type SodexMarket = "spot" | "perps";
export type SodexDomainName = "spot" | "futures";

export type JsonPrimitive = string | number | boolean | null;
export type JsonValue =
  | JsonPrimitive
  | Date
  | bigint
  | JsonValue[]
  | { [key: string]: JsonValue | undefined };

export type SodexPayload = Record<string, JsonValue | undefined>;

export type SodexSignedHeaders = Readonly<{
  "X-API-Key": string;
  "X-API-Sign": `0x${string}`;
  "X-API-Nonce": string;
}>;

type ExchangeActionValue = {
  payloadHash: `0x${string}`;
  nonce: bigint;
};

const SODEX_CHAIN_ID = 286623;
const SODEX_VERIFYING_CONTRACT = "0x0000000000000000000000000000000000000000" as const;

const EXCHANGE_ACTION_TYPES = {
  ExchangeAction: [
    { name: "payloadHash", type: "bytes32" },
    { name: "nonce", type: "uint64" },
  ] satisfies TypedDataField[],
} as const;

function getPrivateKey() {
  const privateKey = process.env.SODEX_API_PRIVATE_KEY?.trim();

  if (!privateKey) {
    throw new Error("SODEX_API_PRIVATE_KEY is required on the server.");
  }

  return privateKey;
}

function getWallet() {
  return new ethers.Wallet(getPrivateKey());
}

function getDomainName(market: SodexMarket): SodexDomainName {
  return market === "spot" ? "spot" : "futures";
}

function getTypedDataDomain(market: SodexMarket) {
  return {
    name: getDomainName(market),
    version: "1",
    chainId: SODEX_CHAIN_ID,
    verifyingContract: SODEX_VERIFYING_CONTRACT,
  } as const;
}

function trimTrailingZeros(value: string) {
  if (!value.includes(".")) {
    return value;
  }

  return value.replace(/(\.\d*?[1-9])0+$/, "$1").replace(/\.0+$/, "");
}

function normalizeNumberString(value: number) {
  if (!Number.isFinite(value)) {
    throw new Error("SoDEX signing payload contains a non-finite number.");
  }

  if (Object.is(value, -0)) {
    return "0";
  }

  const direct = value.toString();
  if (!/[eE]/.test(direct)) {
    return trimTrailingZeros(direct);
  }

  const [coefficient, exponentPart] = direct.toLowerCase().split("e");
  const exponent = Number(exponentPart);
  const sign = coefficient.startsWith("-") ? "-" : "";
  const unsignedCoefficient = sign ? coefficient.slice(1) : coefficient;
  const [integerPart, fractionalPart = ""] = unsignedCoefficient.split(".");
  const digits = `${integerPart}${fractionalPart}`;
  const decimalIndex = integerPart.length + exponent;

  if (decimalIndex <= 0) {
    return trimTrailingZeros(`${sign}0.${"0".repeat(Math.abs(decimalIndex))}${digits}`);
  }

  if (decimalIndex >= digits.length) {
    return trimTrailingZeros(`${sign}${digits}${"0".repeat(decimalIndex - digits.length)}`);
  }

  return trimTrailingZeros(
    `${sign}${digits.slice(0, decimalIndex)}.${digits.slice(decimalIndex)}`,
  );
}

function canonicalizeJsonValue(value: JsonValue): unknown {
  if (value === null) {
    return null;
  }

  if (value instanceof Date) {
    return value.toISOString();
  }

  if (Array.isArray(value)) {
    return value.map((entry) => canonicalizeJsonValue(entry));
  }

  switch (typeof value) {
    case "string":
      return value;
    case "number":
      return normalizeNumberString(value);
    case "bigint":
      return value.toString(10);
    case "boolean":
      return value;
    case "object": {
      const entries = Object.entries(value)
        .filter(([, child]) => child !== undefined)
        .sort(([leftKey], [rightKey]) => leftKey.localeCompare(rightKey));

      const normalized: Record<string, unknown> = {};
      for (const [key, child] of entries) {
        normalized[key] = canonicalizeJsonValue(child as JsonValue);
      }

      return normalized;
    }
    default:
      throw new Error("SoDEX signing payload contains an unsupported value type.");
  }
}

export function canonicalizeSodexPayload(payload: SodexPayload) {
  return JSON.stringify(canonicalizeJsonValue(payload));
}

export function toSodexPayload(input: Record<string, unknown>): SodexPayload {
  for (const value of Object.values(input)) {
    if (value === undefined) {
      continue;
    }

    canonicalizeJsonValue(value as JsonValue);
  }

  return input as SodexPayload;
}

export function hashSodexPayload(payload: SodexPayload): `0x${string}` {
  return ethers.keccak256(
    ethers.toUtf8Bytes(canonicalizeSodexPayload(payload)),
  ) as `0x${string}`;
}

export function getSodexSignerAddress() {
  return getWallet().address;
}

export async function signSodexRequest(
  market: SodexMarket,
  payload: SodexPayload,
  nonce = Date.now(),
): Promise<SodexSignedHeaders> {
  if (!Number.isSafeInteger(nonce) || nonce < 0) {
    throw new Error("SoDEX nonce must be a positive safe integer.");
  }

  const wallet = getWallet();
  const payloadHash = hashSodexPayload(payload);

  const signature = await wallet.signTypedData(
    getTypedDataDomain(market),
    EXCHANGE_ACTION_TYPES,
    {
      payloadHash,
      nonce: BigInt(nonce),
    } satisfies ExchangeActionValue,
  );

  return {
    "X-API-Key": wallet.address,
    "X-API-Sign": `0x01${signature.slice(2)}` as `0x${string}`,
    "X-API-Nonce": String(nonce),
  };
}
