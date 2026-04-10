/**
 * Formatting utilities for crypto display values.
 * Pure functions — no React, no server-only dependency.
 */

/** Format a number as USD currency */
export const formatUSD = (value: number) =>
    new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        maximumFractionDigits: 2,
    }).format(value);

/** Format a signed percentage: +1.23% / -4.56% */
export const formatSignedPercent = (value: number) =>
    `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;

/** Normalize an unknown numeric value to a fixed-decimal string */
export const normalizeNumericString = (value: unknown, decimals = 4): string => {
    const numeric = Number(value);
    return Number.isFinite(numeric) ? numeric.toFixed(decimals) : '0';
};

/** Truncate an Ethereum address: 0x1234...abcd */
export const truncateAddress = (value: string) =>
    value.length > 10 ? `${value.slice(0, 6)}...${value.slice(-4)}` : value;

/** Check if a string looks like an Ethereum wallet address */
export const isWalletAddress = (value: string) => /^0x[a-fA-F0-9]{40}$/.test(value);

/** Generic error message extractor */
export const getErrorMessage = (error: unknown): string =>
    typeof error === 'string'
        ? error
        : error instanceof Error
        ? error.message
        : 'Unexpected error';
