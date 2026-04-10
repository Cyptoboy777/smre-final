/**
 * Groq AI analysis types — used by IntelligenceWidget and the /api/analyze route.
 */

import type { ApiResponse } from '@/types/api';
import type { MarketPulseItem } from '@/types/sodex';
import type { NewsItem } from '@/types/market';

export type SecuritySnapshot = {
    isSafe: boolean;
    status_text: string;
    buy_tax?: string;
    sell_tax?: string;
    flags: string[];
    address?: string;
};

export type AnalysisSnapshot = {
    type: 'token' | 'wallet';
    symbol?: string;
    name?: string;
    address?: string;
    price?: string;
    change?: string;
    isSodexVerified: boolean;
    sosoRating: string;
    analysis: string;
    security: SecuritySnapshot;
    news: NewsItem[];
    market: MarketPulseItem[];
    source: 'groq';
    updatedAt: string;
};

export type AnalyzeRouteResponse = ApiResponse<AnalysisSnapshot>;

export type GroqChatMessage = {
    role: 'system' | 'user' | 'assistant';
    content: string;
};
