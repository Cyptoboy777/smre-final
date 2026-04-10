/**
 * General market and news types — used by MarketPulse, NewsStream, and their hooks.
 */

export type NewsItem = {
    title: string;
    source: { title: string };
    currencies: Array<{ code: string }>;
    url?: string;
    publishedAt?: string;
};

import type { ApiResponse } from '@/types/api';

export type NewsRouteResponse = ApiResponse<{
    items: NewsItem[];
    source: 'cryptopanic';
}>;
