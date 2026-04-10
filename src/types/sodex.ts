/**
 * Sodex domain types — shared between server libs and client hooks.
 * Never import from @/lib/crypto-dashboard for these shapes.
 */

export type SodexMarket = 'spot' | 'perps';

export type MarketPulseItem = {
    symbol: string;
    price: string;
    change: string;
    isUp: boolean;
    market: SodexMarket;
    bidPrice?: string;
    askPrice?: string;
    volume24h?: string;
};

export type PortfolioBalance = {
    asset: string;
    free: string;
    locked: string;
    total: string;
    market: SodexMarket;
};

export type SodexOrder = {
    id: string;
    symbol: string;
    side: string;
    orderType: string;
    status: string;
    price?: string;
    quantity?: string;
    filled?: string;
    notional?: string;
    createdAt?: number;
    updatedAt?: number;
    market: SodexMarket;
};

export type PortfolioSnapshot = {
    address: string;
    balances: PortfolioBalance[];
    recentOrders: SodexOrder[];
    fetchedAt: string;
};

/** Raw WebSocket account-state push from Sodex */
export type SodexWsAccountState = {
    aid?: number;
    B?: Array<{
        asset?: string;
        a?: string;
        free?: string | number;
        locked?: string | number;
        total?: string | number;
    }>;
    O?: Array<{
        i?: number | string;
        s?: string;
        S?: string;
        p?: string;
        q?: string;
        z?: string;
        X?: string;
        ct?: number;
        ut?: number;
    }>;
    user?: string;
};

/** Any Sodex WS message (discriminated via the `e` or `op` field) */
export type SodexWsMessage =
    | { op: 'pong' }
    | { op: 'ping' }
    | { e: 'accountUpdate'; data: SodexWsAccountState }
    | { e: 'orderUpdate'; data: SodexOrder }
    | { e: 'trade'; symbol: string; price: string; qty: string; ts: number }
    | Record<string, unknown>;

// ─── Route response shapes ────────────────────────────────────────────────────

import type { ApiResponse } from '@/types/api';

export type BalanceRouteResponse = ApiResponse<{
    address: string;
    balances: PortfolioBalance[];
}>;

export type MarketRouteResponse = ApiResponse<{
    market?: SodexMarket;
    items: MarketPulseItem[];
    source: 'sodex';
}>;

export type OrdersRouteResponse = ApiResponse<{
    market: SodexMarket;
    orders: SodexOrder[];
}>;

export type PortfolioRouteResponse = ApiResponse<PortfolioSnapshot>;

export type TradeRouteResponse = ApiResponse<{ result: unknown }>;
