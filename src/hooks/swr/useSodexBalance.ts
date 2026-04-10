'use client';

import useSWR from 'swr';
import { swrFetcher } from '@/lib/swr-fetcher';
import type { BalanceRouteResponse } from '@/types/sodex';
import type { ApiSuccessPayload } from '@/types/api';

type BalanceData = ApiSuccessPayload<BalanceRouteResponse>;

/**
 * useSodexBalance — SWR hook for /api/sodex/balance
 *
 * - Polls every 15 seconds (balance is security-sensitive, needs freshness)
 * - Only fetches when `enabled` is true (prevents requests before user is ready)
 * - revalidateOnFocus: false — prevents burst requests when user alt-tabs
 */
export function useSodexBalance(
    market: 'spot' | 'perps' = 'spot',
    options: { enabled?: boolean } = {}
) {
    const { enabled = true } = options;
    const key = enabled ? `/api/sodex/balance?market=${market}` : null;

    const { data, error, isLoading, isValidating, mutate } =
        useSWR<BalanceData>(key, swrFetcher, {
            refreshInterval: 15_000,
            revalidateOnFocus: false,
            revalidateOnReconnect: true,
            dedupingInterval: 3_000,
            errorRetryCount: 2,
        });

    return {
        address: data?.address,
        balances: data?.balances ?? [],
        isLoading,
        isValidating,
        error: error instanceof Error ? error.message : error ? String(error) : null,
        refresh: () => mutate(),
    };
}
