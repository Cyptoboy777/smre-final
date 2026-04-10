/**
 * @deprecated Shim for backward compatibility.
 * New code should import directly from @/types/api, @/types/sodex, @/types/market, @/types/groq
 */

export type {
    ApiSuccess,
    ApiFailure,
    ApiResponse,
    ApiSuccessPayload,
} from '@/types/api';

export { isJsonContentType, getResponseSnippet } from '@/types/api';

export type {
    BalanceRouteResponse,
    MarketRouteResponse,
    OrdersRouteResponse,
    PortfolioRouteResponse,
    TradeRouteResponse,
} from '@/types/sodex';

export type { NewsRouteResponse } from '@/types/market';
export type { AnalyzeRouteResponse } from '@/types/groq';
