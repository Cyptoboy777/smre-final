'use client';

import { Wallet, Activity } from 'lucide-react';
import WidgetWrapper from '../WidgetWrapper';
import {
    type PortfolioBalance,
    type PortfolioSnapshot,
    type SodexOrder,
    truncateAddress,
} from '@/lib/crypto-dashboard';
import { useSodexWebSocket } from '@/hooks/useSodexWebSocket';
import { fetchApi } from '@/lib/client/api-client';
import { type ApiSuccessPayload, type PortfolioRouteResponse } from '@/lib/api';
import { useApiQuery } from '@/hooks/useApiQuery';

type AccountStateMessage = {
    channel?: string;
    type?: 'snapshot' | 'update';
    data?: {
        aid?: number;
        B?: Array<{ a?: string; t?: string; l?: string }>;
        O?: Array<{
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
        }>;
    };
};

const normalizeBalance = (market: 'spot' | 'perps', item: { a?: string; t?: string; l?: string }): PortfolioBalance => {
    const total = Number(item.t ?? 0);
    const locked = Number(item.l ?? 0);
    const free = total - locked;

    return {
        asset: item.a || 'UNKNOWN',
        free: free.toFixed(4),
        locked: locked.toFixed(4),
        total: total.toFixed(4),
        market,
    };
};

const normalizeOrder = (
    market: 'spot' | 'perps',
    item: {
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
    }
): SodexOrder => ({
    id: String(item.i ?? `${item.s}-${item.ct ?? Date.now()}`),
    symbol: item.s || 'UNKNOWN',
    side: item.S || 'UNKNOWN',
    orderType: item.o || 'UNKNOWN',
    status: item.X || 'UNKNOWN',
    price: item.p,
    quantity: item.q,
    filled: item.z,
    notional: item.v,
    createdAt: item.ct,
    updatedAt: item.ut,
    market,
});

const mergeRealtimeState = (
    current: PortfolioSnapshot,
    market: 'spot' | 'perps',
    message: AccountStateMessage['data']
): PortfolioSnapshot => {
    const nextBalances = (message?.B || []).map((item) => normalizeBalance(market, item));
    const nextOrders = (message?.O || []).map((item) => normalizeOrder(market, item));
    const hasBalances = Array.isArray(message?.B);
    const hasOrders = Array.isArray(message?.O);

    return {
        ...current,
        balances: hasBalances
            ? [...current.balances.filter((entry) => entry.market !== market), ...nextBalances]
            : current.balances,
        recentOrders: hasOrders
            ? [...nextOrders, ...current.recentOrders.filter((entry) => entry.market !== market)]
                  .sort(
                      (left, right) => (right.updatedAt ?? right.createdAt ?? 0) - (left.updatedAt ?? left.createdAt ?? 0)
                  )
                  .slice(0, 12)
            : current.recentOrders,
        fetchedAt: new Date().toISOString(),
    };
};

export default function PortfolioVault() {
    const { data: portfolio, loading, error, setData: setPortfolio } = useApiQuery<PortfolioSnapshot>({
        request: async (signal) => {
            const response = await fetchApi<ApiSuccessPayload<PortfolioRouteResponse>>('/api/sodex/portfolio', {
                signal,
            });

            return {
                address: response.address,
                balances: response.balances,
                recentOrders: response.recentOrders,
                fetchedAt: response.fetchedAt,
            };
        },
    });

    const spotStream = useSodexWebSocket<AccountStateMessage>({
        url: 'wss://mainnet-gw.sodex.dev/ws/spot',
        enabled: Boolean(portfolio?.address),
        subscribeMessages: portfolio?.address
            ? [
                  {
                      op: 'subscribe',
                      params: {
                          channel: 'accountState',
                          user: portfolio.address,
                      },
                  },
              ]
            : [],
        onMessage: (message) => {
            if (message.channel !== 'accountState' || !message.data) {
                return;
            }

            setPortfolio((current) => (current ? mergeRealtimeState(current, 'spot', message.data) : current));
        },
    });

    const perpsStream = useSodexWebSocket<AccountStateMessage>({
        url: 'wss://mainnet-gw.sodex.dev/ws/perps',
        enabled: Boolean(portfolio?.address),
        subscribeMessages: portfolio?.address
            ? [
                  {
                      op: 'subscribe',
                      params: {
                          channel: 'accountState',
                          user: portfolio.address,
                      },
                  },
              ]
            : [],
        onMessage: (message) => {
            if (message.channel !== 'accountState' || !message.data) {
                return;
            }

            setPortfolio((current) => (current ? mergeRealtimeState(current, 'perps', message.data) : current));
        },
    });

    const streamStatusLabel =
        spotStream.status === 'open' && perpsStream.status === 'open'
            ? 'STREAM_SYNCED'
            : spotStream.status === 'reconnecting' || perpsStream.status === 'reconnecting'
              ? 'RECONNECTING'
              : spotStream.status === 'error' || perpsStream.status === 'error'
                ? 'STREAM_DEGRADED'
                : 'CONNECTING';

    return (
        <WidgetWrapper title="PORTFOLIO VAULT" icon={<Wallet className="w-3 h-3" />} loading={loading} error={error}>
            <div className="flex flex-col gap-4 h-full">
                {!portfolio ? (
                    <div className="flex-1 flex items-center justify-center text-[10px] font-mono text-white/30 uppercase tracking-widest">
                        Loading portfolio state...
                    </div>
                ) : (
                    <div className="flex-1 flex flex-col gap-4 min-h-0">
                        <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/5">
                            <div className="flex flex-col">
                                <span className="text-[8px] font-mono text-white/30 uppercase tracking-widest leading-none mb-1">
                                    AUTHENTICATED_ADDR
                                </span>
                                <span className="text-[10px] font-mono text-white/80">{truncateAddress(portfolio.address)}</span>
                            </div>
                            <div className="text-right">
                                <span className="text-[8px] font-mono text-white/30 uppercase tracking-widest leading-none mb-1">
                                    NETWORK
                                </span>
                                <div className="text-[10px] font-mono text-white/70">
                                    SPOT + PERPS
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center justify-between p-2 rounded-xl border border-white/5 bg-white/[0.015]">
                            <span className="text-[8px] font-mono text-white/30 uppercase tracking-widest flex items-center gap-2">
                                <Activity className="w-3 h-3 text-primary" />
                                LIVE_ACCOUNT_STATE
                            </span>
                            <span
                                className={`text-[8px] font-mono uppercase tracking-widest ${
                                    streamStatusLabel === 'STREAM_SYNCED'
                                        ? 'text-accent'
                                        : streamStatusLabel === 'STREAM_DEGRADED'
                                          ? 'text-destructive'
                                          : 'text-white/60'
                                }`}
                            >
                                {streamStatusLabel}
                            </span>
                        </div>

                        <div className="flex-1 grid grid-cols-[1.3fr,0.9fr] gap-3 min-h-0">
                            <div className="overflow-y-auto custom-scrollbar pr-1 flex flex-col gap-2 min-h-0">
                                {[...portfolio.balances]
                                    .sort((left, right) => Number(right.total) - Number(left.total))
                                    .map((coin) => (
                                        <div
                                            key={`${coin.market}-${coin.asset}`}
                                            className="flex justify-between items-center p-2 rounded-lg bg-white/[0.01] border border-white/5 hover:bg-white/[0.03] transition-all"
                                        >
                                            <div className="flex flex-col">
                                                <span className="text-[10px] font-bold text-white tracking-widest uppercase">
                                                    {coin.asset}
                                                </span>
                                                <span className="text-[8px] font-mono text-white/35 uppercase tracking-widest">
                                                    {coin.market}
                                                </span>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-[10px] font-bold text-white tracking-widest uppercase">
                                                    {coin.total}
                                                </div>
                                                <div className="text-[8px] font-mono text-white/35">
                                                    F:{coin.free} L:{coin.locked}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                            </div>

                            <div className="overflow-y-auto custom-scrollbar pr-1 flex flex-col gap-2 min-h-0">
                                {portfolio.recentOrders.slice(0, 6).map((order) => (
                                    <div
                                        key={`${order.market}-${order.id}`}
                                        className="p-2 rounded-lg bg-white/[0.01] border border-white/5"
                                    >
                                        <div className="flex items-center justify-between gap-2">
                                            <span className={`text-[9px] font-bold tracking-widest uppercase ${order.side === 'BUY' ? 'text-accent' : 'text-destructive'}`}>
                                                {order.side}
                                            </span>
                                            <span className="text-[8px] font-mono text-white/35 uppercase">{order.market}</span>
                                        </div>
                                        <div className="mt-1 text-[9px] font-mono text-white/70">{order.symbol}</div>
                                        <div className="mt-1 flex items-center justify-between text-[8px] font-mono text-white/35">
                                            <span>{order.quantity || '--'} @ {order.price || 'MKT'}</span>
                                            <span>{order.status}</span>
                                        </div>
                                    </div>
                                ))}

                                {portfolio.recentOrders.length === 0 && (
                                    <div className="flex-1 flex items-center justify-center text-[8px] font-mono text-white/20 uppercase tracking-widest">
                                        No historical orders returned
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </WidgetWrapper>
    );
}
