'use client';

import useSWR from 'swr';
import { swrFetcher } from '@/lib/swr-fetcher';
import type { NewsRouteResponse } from '@/types/market';
import type { ApiSuccessPayload } from '@/types/api';

type NewsData = ApiSuccessPayload<NewsRouteResponse>;

/**
 * useNews — SWR hook for /api/news
 *
 * - Polls every 60 seconds (news is lower-frequency than market data)
 * - revalidateOnFocus: false
 */
export function useNews() {
    const { data, error, isLoading, isValidating, mutate } =
        useSWR<NewsData>('/api/news', swrFetcher, {
            refreshInterval: 60_000,
            revalidateOnFocus: false,
            revalidateOnReconnect: true,
            dedupingInterval: 10_000,
            errorRetryCount: 3,
        });

    return {
        items: data?.items ?? [],
        source: data?.source,
        isLoading,
        isValidating,
        error: error instanceof Error ? error.message : error ? String(error) : null,
        refresh: () => mutate(),
    };
}
