import 'server-only';

import { ethers } from 'ethers';
import { signSodexRequest, toSodexPayload } from '@/lib/eip712-signer';
import type {
    MarketPulseItem,
    PortfolioBalance,
    PortfolioSnapshot,
    SodexOrder,
} from '@/types/sodex';
import {
    formatSignedPercent,
    getErrorMessage,
    normalizeNumericString,
} from '@/lib/crypto/formatters';

export const SODEX_SPOT_REST_BASE = 'https://mainnet-gw.sodex.dev/api/v1/spot';
export const SODEX_PERPS_REST_BASE = 'https://mainnet-gw.sodex.dev/api/v1/perps';
export const SODEX_SPOT_WS_URL = 'wss://mainnet-gw.sodex.dev/ws/spot';
export const SODEX_PERPS_WS_URL = 'wss://mainnet-gw.sodex.dev/ws/perps';

type SodexMarket = 'spot' | 'perps';

type RawSodexEnvelope<T> = {
    code?: number;
    msg?: string;
    message?: string;
    error?: string;
    data?: T;
    result?: T;
};

type RawTicker = {
    symbol?: string;
    s?: string;
    lastPrice?: string;
    price?: string;
    priceChangePercent?: string;
    changePercent?: string;
    volume?: string;
    quoteVolume?: string;
    bidPrice?: string;
    askPrice?: string;
    b?: string;
    a?: string;
};

type RawBalance = {
    asset?: string;
    symbol?: string;
    currency?: string;
    coin?: string;
    a?: string;
    total?: string | number;
    balance?: string | number;
    amount?: string | number;
    t?: string | number;
    free?: string | number;
    available?: string | number;
    availableBalance?: string | number;
    locked?: string | number;
    hold?: string | number;
    frozen?: string | number;
    l?: string | number;
};

type RawStateOrder = {
    id?: number | string;
    orderID?: number | string;
    symbol?: string;
    side?: string;
    type?: string;
    status?: string;
    price?: string;
    quantity?: string;
    executedQty?: string;
    cumQuote?: string;
    createdTime?: number;
    updatedTime?: number;
    i?: number | string;
    s?: string;
    S?: string;
    o?: string;
    X?: string;
    p?: string;
    q?: string;
    z?: string;
    v?: string;
    ct?: number;
    ut?: number;
};

type RawHistoryOrder = RawStateOrder & {
    orders?: RawHistoryOrder[];
};

type RawAccountState = {
    aid?: number;
    B?: RawBalance[];
    O?: RawStateOrder[];
};

type PlacePerpsOrderInput = {
    symbol: string;
    quantity: string;
    direction: 'LONG' | 'SHORT';
};

const requiredEnv = (name: string) => {
    const value = process.env[name];

    if (!value) {
        throw new Error(`${name} is not configured`);
    }

    return value;
};

const hasEnv = (name: string) => Boolean(process.env[name]?.trim());

export const hasSodexServerAuth = () => hasEnv('SODEX_API_PRIVATE_KEY');

export const getSodexServerAuthMessage = () => {
    if (!hasEnv('SODEX_API_PRIVATE_KEY')) {
        return 'SERVER_SIDE_SODEX_PRIVATE_KEY_NOT_CONFIGURED';
    }

    return null;
};

const getWallet = () => new ethers.Wallet(requiredEnv('SODEX_API_PRIVATE_KEY'));

const getBaseUrl = (market: SodexMarket) =>
    market === 'spot' ? SODEX_SPOT_REST_BASE : SODEX_PERPS_REST_BASE;

const prunePayload = (value: unknown): unknown => {
    if (Array.isArray(value)) {
        return value.map(prunePayload);
    }

    if (value && typeof value === 'object') {
        const next: Record<string, unknown> = {};

        for (const [key, child] of Object.entries(value)) {
            if (child === undefined || child === null || child === '') {
                continue;
            }

            next[key] = prunePayload(child);
        }

        return next;
    }

    return value;
};

const compactJson = (value: unknown) => JSON.stringify(prunePayload(value));

const getResponseSnippet = (text: string) => text.replace(/\s+/g, ' ').trim().slice(0, 140);

const parseResponseJson = (response: Response, text: string) => {
    if (!text) {
        return {};
    }

    const contentType = response.headers.get('content-type')?.toLowerCase() || '';

    if (!contentType.includes('application/json')) {
        const snippet = getResponseSnippet(text);
        throw new Error(
            `SoDEX returned non-JSON response (${response.status}). ${snippet || 'Empty response body'}`
        );
    }

    try {
        return JSON.parse(text) as unknown;
    } catch {
        throw new Error(`SoDEX returned invalid JSON (${response.status})`);
    }
};

const parseSodexEnvelope = <T>(json: RawSodexEnvelope<T> | T): T => {
    if (json && typeof json === 'object' && 'code' in (json as RawSodexEnvelope<T>)) {
        const envelope = json as RawSodexEnvelope<T>;

        if (typeof envelope.code === 'number' && envelope.code !== 0) {
            throw new Error(envelope.error || envelope.message || envelope.msg || `SoDEX error ${envelope.code}`);
        }

        if (envelope.data !== undefined) {
            return envelope.data;
        }

        if (envelope.result !== undefined) {
            return envelope.result;
        }
    }

    return json as T;
};

const buildAuthenticatedHeaders = async (market: SodexMarket, params: Record<string, unknown>) => {
    return {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        ...(await signSodexRequest(market, toSodexPayload(params))),
    };
};

const sodexRequest = async <T>({
    market,
    path,
    query,
    method = 'GET',
    body,
    authenticated = false,
}: {
    market: SodexMarket;
    path: string;
    query?: Record<string, string | number | undefined>;
    method?: 'GET' | 'POST';
    body?: Record<string, unknown>;
    authenticated?: boolean;
}): Promise<T> => {
    const url = new URL(`${getBaseUrl(market)}${path}`);
    const queryPayload: Record<string, string | number> = {};

    if (query) {
        for (const [key, value] of Object.entries(query)) {
            if (value !== undefined) {
                url.searchParams.set(key, String(value));
                queryPayload[key] = value;
            }
        }
    }

    const init: RequestInit = {
        method,
        headers: {
            Accept: 'application/json',
        },
        cache: 'no-store',
    };

    if (authenticated) {
        const signaturePayload =
            method === 'GET'
                ? queryPayload
                : ((prunePayload(body || {}) as Record<string, unknown>) || {});

        init.headers = await buildAuthenticatedHeaders(market, signaturePayload);
    }

    if (body) {
        init.body = compactJson(body);
        init.headers = {
            ...(init.headers as Record<string, string>),
            'Content-Type': 'application/json',
        };
    }

    const response = await fetch(url.toString(), init);
    const text = await response.text();
    const json = parseResponseJson(response, text);

    if (!response.ok) {
        const envelope = json as RawSodexEnvelope<unknown>;
        throw new Error(envelope.error || envelope.message || envelope.msg || `${response.status} ${response.statusText}`);
    }

    return parseSodexEnvelope<T>(json as RawSodexEnvelope<T> | T);
};

const extractRows = <T>(payload: unknown, candidateKeys: string[]): T[] => {
    if (Array.isArray(payload)) {
        return payload as T[];
    }

    if (!payload || typeof payload !== 'object') {
        return [];
    }

    const record = payload as Record<string, unknown>;

    for (const key of candidateKeys) {
        if (Array.isArray(record[key])) {
            return record[key] as T[];
        }
    }

    return [];
};

const extractTickerRows = (payload: unknown): RawTicker[] => {
    const rows = extractRows<RawTicker>(payload, ['tickers', 'items', 'list', 'rows']);

    if (rows.length > 0) {
        return rows;
    }

    if (payload && typeof payload === 'object') {
        const single = payload as RawTicker;
        if (single.symbol || single.s) {
            return [single];
        }
    }

    return [];
};

const extractBalanceRows = (payload: unknown): RawBalance[] => {
    const rows = extractRows<RawBalance>(payload, ['balances', 'assets', 'items', 'list', 'rows', 'B']);
    return rows;
};

const extractOrderRows = (payload: unknown): RawHistoryOrder[] => {
    const rows = extractRows<RawHistoryOrder>(payload, ['orders', 'items', 'list', 'rows', 'history', 'O']);
    return rows;
};

const normalizeTicker = (market: SodexMarket, raw: RawTicker): MarketPulseItem => {
    const symbol = raw.symbol || raw.s || 'UNKNOWN';
    const lastPrice = Number(raw.lastPrice ?? raw.price ?? raw.bidPrice ?? raw.b ?? 0);
    const changePercent = Number(raw.priceChangePercent ?? raw.changePercent ?? 0);

    return {
        symbol,
        price: Number.isFinite(lastPrice)
            ? lastPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
            : '0.00',
        change: formatSignedPercent(Number.isFinite(changePercent) ? changePercent : 0),
        isUp: changePercent >= 0,
        market,
        bidPrice: raw.bidPrice || raw.b,
        askPrice: raw.askPrice || raw.a,
        volume24h: raw.quoteVolume || raw.volume,
    };
};

const normalizeBalance = (market: SodexMarket, raw: RawBalance): PortfolioBalance => {
    const locked = Number(raw.locked ?? raw.hold ?? raw.frozen ?? raw.l ?? 0);
    const freeCandidate = raw.free ?? raw.available ?? raw.availableBalance;
    const totalCandidate = raw.total ?? raw.balance ?? raw.amount ?? raw.t;
    const free = freeCandidate !== undefined ? Number(freeCandidate) : undefined;
    const total = totalCandidate !== undefined ? Number(totalCandidate) : Number((free ?? 0) + locked);

    return {
        asset: raw.asset || raw.symbol || raw.currency || raw.coin || raw.a || 'UNKNOWN',
        free: normalizeNumericString(free ?? total - locked),
        locked: normalizeNumericString(locked),
        total: normalizeNumericString(total),
        market,
    };
};

const normalizeOrder = (market: SodexMarket, raw: RawStateOrder | RawHistoryOrder): SodexOrder => ({
    id: String(raw.id ?? raw.orderID ?? raw.i ?? `${raw.s}-${raw.ct ?? raw.createdTime ?? Date.now()}`),
    symbol: String(raw.symbol ?? raw.s ?? 'UNKNOWN'),
    side: String(raw.side ?? raw.S ?? 'UNKNOWN'),
    orderType: String(raw.type ?? raw.o ?? 'UNKNOWN'),
    status: String(raw.status ?? raw.X ?? 'UNKNOWN'),
    price: raw.price ?? raw.p,
    quantity: raw.quantity ?? raw.q,
    filled: raw.executedQty ?? raw.z,
    notional: raw.cumQuote ?? raw.v,
    createdAt: raw.createdTime ?? raw.ct,
    updatedAt: raw.updatedTime ?? raw.ut,
    market,
});

export const getSodexAccountContext = () => {
    const wallet = getWallet();

    return {
        address: wallet.address,
    };
};

export const fetchSodexTickers = async (market: SodexMarket, symbol?: string) => {
    const payload = await sodexRequest<unknown>({
        market,
        path: '/markets/tickers',
        query: {
            symbol,
        },
    });

    return extractTickerRows(payload).map((item) => normalizeTicker(market, item));
};

export const fetchSodexAccountBalances = async (market: SodexMarket) => {
    const { address } = getSodexAccountContext();
    const payload = await sodexRequest<unknown>({
        market,
        path: `/accounts/${address}/balances`,
        authenticated: true,
    });

    return {
        address,
        balances: extractBalanceRows(payload).map((balance) => normalizeBalance(market, balance)),
    };
};

export const fetchSodexAccountState = async (market: SodexMarket) => {
    const [{ address, balances }, openOrders] = await Promise.all([
        fetchSodexAccountBalances(market),
        fetchSodexOrderHistory(market, { limit: 10 }),
    ]);

    return {
        address,
        balances,
        openOrders,
    };
};

export const fetchSodexOrderHistory = async (
    market: SodexMarket,
    options: {
        symbol?: string;
        limit?: number;
        startTime?: number;
        endTime?: number;
    } = {}
) => {
    const { address } = getSodexAccountContext();
    const payload = await sodexRequest<unknown>({
        market,
        path: `/accounts/${address}/orders/history`,
        query: {
            symbol: options.symbol,
            limit: options.limit ?? 25,
            startTime: options.startTime,
            endTime: options.endTime,
        },
        authenticated: true,
    });

    return extractOrderRows(payload).map((order) => normalizeOrder(market, order));
};

export const fetchSodexPortfolio = async (): Promise<PortfolioSnapshot> => {
    const { address } = getSodexAccountContext();
    const [spotBalances, perpsBalances, spotHistory, perpsHistory] = await Promise.all([
        fetchSodexAccountBalances('spot'),
        fetchSodexAccountBalances('perps'),
        fetchSodexOrderHistory('spot', { limit: 10 }),
        fetchSodexOrderHistory('perps', { limit: 10 }),
    ]);

    const recentOrders = [...spotHistory, ...perpsHistory]
        .sort((left, right) => (right.updatedAt ?? right.createdAt ?? 0) - (left.updatedAt ?? left.createdAt ?? 0))
        .slice(0, 12);

    return {
        address,
        balances: [...spotBalances.balances, ...perpsBalances.balances],
        recentOrders,
        fetchedAt: new Date().toISOString(),
    };
};

export const placeSodexPerpsOrder = async ({ symbol, quantity, direction }: PlacePerpsOrderInput) => {
    const params = {
        orders: [
            {
                clOrdID: `soso-${Date.now()}`,
                modifier: 1,
                side: direction === 'LONG' ? 1 : 2,
                type: 2,
                timeInForce: 3,
                quantity,
                reduceOnly: false,
                positionSide: direction === 'LONG' ? 1 : 2,
                symbol,
            },
        ],
    };

    return sodexRequest<unknown>({
        market: 'perps',
        path: '/trade/orders',
        method: 'POST',
        body: params,
        authenticated: true,
    });
};

export const mergeAccountStateSnapshot = (
    current: PortfolioSnapshot,
    incoming: {
        aid?: number;
        B?: RawBalance[];
        O?: RawStateOrder[];
        user?: string;
    },
    market: SodexMarket
): PortfolioSnapshot => {
    const nextBalances = (incoming.B || []).map((balance) => normalizeBalance(market, balance));
    const nextOrders = (incoming.O || []).map((order) => normalizeOrder(market, order));
    const hasBalances = Array.isArray(incoming.B);
    const hasOrders = Array.isArray(incoming.O);

    return {
        ...current,
        balances: hasBalances
            ? [...current.balances.filter((balance) => balance.market !== market), ...nextBalances]
            : current.balances,
        recentOrders: hasOrders
            ? [...nextOrders, ...current.recentOrders.filter((order) => order.market !== market)]
            .sort((left, right) => (right.updatedAt ?? right.createdAt ?? 0) - (left.updatedAt ?? left.createdAt ?? 0))
            .slice(0, 12)
            : current.recentOrders,
        fetchedAt: new Date().toISOString(),
    };
};

export const parseSodexWebSocketError = (error: unknown) => getErrorMessage(error);
