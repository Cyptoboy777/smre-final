'use client';

import { SWRConfig } from 'swr';
import { swrFetcher } from '@/lib/swr-fetcher';
import type { ReactNode } from 'react';

type SWRProviderProps = {
    children: ReactNode;
};

/**
 * SWRProvider — mounted once in layout.tsx.
 *
 * Global SWR config:
 * - fetcher: our typed error-unwrapping swrFetcher
 * - revalidateOnFocus: false — dashboard doesn't need focus-trigger refreshes
 * - dedupingInterval: 2000ms — prevents 429s from components mounting in bursts
 * - errorRetryCount: 3 — silent retries before surfacing errors
 * - shouldRetryOnError: true
 */
export function SWRProvider({ children }: SWRProviderProps) {
    return (
        <SWRConfig
            value={{
                fetcher: swrFetcher,
                revalidateOnFocus: false,
                revalidateOnReconnect: true,
                shouldRetryOnError: true,
                errorRetryCount: 3,
                dedupingInterval: 2_000,
                onError: (error, key) => {
                    // Silent in production — errors surfaced per-hook
                    if (process.env.NODE_ENV === 'development') {
                        console.warn(`[SWR] Error for key "${key}":`, error);
                    }
                },
            }}
        >
            {children}
        </SWRConfig>
    );
}
