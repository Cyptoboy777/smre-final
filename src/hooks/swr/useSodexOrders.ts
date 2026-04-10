'use client';

import useSWR from 'swr';
import { swrFetcher } from '@/lib/swr-fetcher';
import type { OrdersRouteResponse } from '@/types/sodex';
import type { ApiSuccessPayload } from '@/types/api';

type OrdersData = ApiSuccessPayload<OrdersRouteResponse>;

/**
 * useSodexOrders — SWR hook for /api/sodex/orders
 *
 * - Polls every 20 seconds
 * - Conditional fetch via null key pattern
 */
export function useSodexOrders(
    market: 'spot' | 'perps' = 'perps',
    options: { enabled?: boolean; symbol?: string } = {}
) {
    const { enabled = true, symbol } = options;

    const params = new URLSearchParams({ market });
    if (symbol) params.set('symbol', symbol);

    const key = enabled ? `/api/sodex/orders?${params.toString()}` : null;

    const { data, error, isLoading, isValidating, mutate } =
        useSWR<OrdersData>(key, swrFetcher, {
            refreshInterval: 20_000,
            revalidateOnFocus: false,
            revalidateOnReconnect: true,
            dedupingInterval: 5_000,
            errorRetryCount: 2,
        });

    return {
        orders: data?.orders ?? [],
        market: data?.market,
        isLoading,
        isValidating,
        error: error instanceof Error ? error.message : error ? String(error) : null,
        refresh: () => mutate(),
    };
}
