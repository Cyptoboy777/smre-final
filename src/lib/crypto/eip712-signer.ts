/**
 * EIP-712 Signer — SERVER-ONLY
 *
 * Signs Sodex API requests using the wallet derived from SODEX_API_PRIVATE_KEY.
 * This module uses 'server-only' to guarantee it is never bundled into
 * the client. Import it exclusively from src/app/api/** route handlers.
 *
 * The private key format expected: a 0x-prefixed 32-byte hex private key.
 * Example: SODEX_API_PRIVATE_KEY=0xabc123...
 */
import 'server-only';

import { ethers } from 'ethers';

// ─── EIP-712 Domain & Types ────────────────────────────────────────────────────

const EXCHANGE_ACTION_TYPES = {
    ExchangeAction: [
        { name: 'payloadHash', type: 'bytes32' },
        { name: 'nonce', type: 'uint64' },
    ],
} as const;

const getActionDomain = (market: 'spot' | 'perps') => ({
    name: market === 'spot' ? 'spot' : 'futures',
    version: '1',
    chainId: 286623,
    verifyingContract: '0x0000000000000000000000000000000000000000' as `0x${string}`,
});

// ─── Internal helpers ──────────────────────────────────────────────────────────

const getPrivateKey = (): string => {
    const key = process.env.SODEX_API_PRIVATE_KEY;
    if (!key?.trim()) {
        throw new Error('SODEX_API_PRIVATE_KEY is not configured');
    }
    return key;
};

const getWallet = () => new ethers.Wallet(getPrivateKey());

const prunePayload = (value: unknown): unknown => {
    if (Array.isArray(value)) return value.map(prunePayload);
    if (value && typeof value === 'object') {
        const next: Record<string, unknown> = {};
        for (const [k, v] of Object.entries(value)) {
            if (v !== undefined && v !== null && v !== '') {
                next[k] = prunePayload(v);
            }
        }
        return next;
    }
    return value;
};

const compactJson = (value: unknown) => JSON.stringify(prunePayload(value));

// ─── Public API ────────────────────────────────────────────────────────────────

/**
 * Returns the wallet address (used as X-API-Key).
 * Safe to call without performing any signing.
 */
export const getSodexSignerAddress = (): string => getWallet().address;

/** Whether SODEX_API_PRIVATE_KEY is set in the environment */
export const hasSodexSignerKey = (): boolean =>
    Boolean(process.env.SODEX_API_PRIVATE_KEY?.trim());

/**
 * Sign a Sodex API payload using EIP-712 typed data.
 *
 * @param market  'spot' | 'perps'
 * @param payload The request body or query params to sign
 * @returns       Headers object ready to merge into fetch() init
 */
export const signSodexRequest = async (
    market: 'spot' | 'perps',
    payload: Record<string, unknown>
): Promise<Record<string, string>> => {
    const wallet = getWallet();
    const nonce = Date.now();
    const payloadHash = ethers.keccak256(ethers.toUtf8Bytes(compactJson(payload)));

    const rawSignature = await wallet.signTypedData(
        getActionDomain(market),
        // ethers v6 requires a mutable copy
        { ExchangeAction: [...EXCHANGE_ACTION_TYPES.ExchangeAction] },
        { payloadHash, nonce }
    );

    return {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'X-API-Key': wallet.address,
        'X-API-Sign': `0x01${rawSignature.slice(2)}`,
        'X-API-Nonce': String(nonce),
    };
};
