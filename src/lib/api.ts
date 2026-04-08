import type {
    AnalysisSnapshot,
    MarketPulseItem,
    NewsItem,
    PortfolioBalance,
    PortfolioSnapshot,
    SodexOrder,
} from '@/lib/crypto-dashboard';

export type ApiSuccess<T extends object> = {
    success: true;
} & T;

export type ApiFailure = {
    success: false;
    error: string;
};

export type ApiResponse<T extends object> = ApiSuccess<T> | ApiFailure;
export type ApiSuccessPayload<T extends { success: boolean }> = Extract<T, { success: true }>;

export type AnalyzeRouteResponse = ApiResponse<AnalysisSnapshot>;

export type BalanceRouteResponse = ApiResponse<{
    address: string;
    balances: PortfolioBalance[];
}>;

export type MarketRouteResponse = ApiResponse<{
    market?: 'spot' | 'perps';
    items: MarketPulseItem[];
    source: 'sodex';
}>;

export type NewsRouteResponse = ApiResponse<{
    items: NewsItem[];
    source: 'cryptopanic';
}>;

export type PortfolioRouteResponse = ApiResponse<PortfolioSnapshot>;

export type OrdersRouteResponse = ApiResponse<{
    market: 'spot' | 'perps';
    orders: SodexOrder[];
}>;

export type TradeRouteResponse = ApiResponse<{
    result: unknown;
}>;

export const isJsonContentType = (contentType: string | null) =>
    Boolean(contentType?.toLowerCase().includes('application/json'));

export const getResponseSnippet = (text: string) => text.replace(/\s+/g, ' ').trim().slice(0, 160);
