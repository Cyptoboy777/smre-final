'use client';

import { Activity, TrendingUp, TrendingDown } from 'lucide-react';
import WidgetWrapper from '../WidgetWrapper';
import { type MarketPulseItem } from '@/lib/crypto-dashboard';
import { useSodexWebSocket } from '@/hooks/useSodexWebSocket';
import { fetchApi } from '@/lib/client/api-client';
import { type ApiSuccessPayload, type MarketRouteResponse } from '@/lib/api';
import { useApiQuery } from '@/hooks/useApiQuery';

const TRACKED_SYMBOLS = ['BTC-USD', 'ETH-USD', 'SOL-USD'];

type AllBookTickerMessage = {
    channel?: string;
    type?: 'snapshot' | 'update';
    data?: Array<{
        s: string;
        a: string;
        b: string;
    }>;
};

const getDisplayPrice = (askPrice?: string, bidPrice?: string) => {
    const ask = Number(askPrice);
    const bid = Number(bidPrice);
    const validAsk = Number.isFinite(ask) && ask > 0 ? ask : null;
    const validBid = Number.isFinite(bid) && bid > 0 ? bid : null;

    if (validAsk !== null && validBid !== null) {
        return ((validAsk + validBid) / 2).toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        });
    }

    if (validAsk !== null) {
        return validAsk.toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        });
    }

    if (validBid !== null) {
        return validBid.toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        });
    }

    return null;
};

export default function MarketPulse() {
    const { data, loading, error, setData } = useApiQuery<MarketPulseItem[]>({
        request: async (signal) => {
            const response = await fetchApi<ApiSuccessPayload<MarketRouteResponse>>('/api/sodex/market?market=perps', {
                signal,
            });

            return Array.isArray(response.items)
                ? response.items.filter((item) => TRACKED_SYMBOLS.includes(item.symbol)).slice(0, 3)
                : [];
        },
    });

    const prices = data || [];

    const stream = useSodexWebSocket<AllBookTickerMessage>({
        url: 'wss://mainnet-gw.sodex.dev/ws/perps',
        subscribeMessages: [
            {
                op: 'subscribe',
                params: {
                    channel: 'allBookTicker',
                },
            },
        ],
        onMessage: (message) => {
            if (message.channel !== 'allBookTicker' || !Array.isArray(message.data)) {
                return;
            }

            const updates = message.data;

            setData((current) => {
                const nextCurrent = current || [];

                if (nextCurrent.length === 0) {
                    const seededItems: MarketPulseItem[] = [];

                    for (const entry of updates) {
                        if (!TRACKED_SYMBOLS.includes(entry.s) || seededItems.length >= 3) {
                            continue;
                        }

                            const price = getDisplayPrice(entry.a, entry.b);

                            if (!price) {
                                continue;
                            }

                            seededItems.push({
                                symbol: entry.s,
                                price,
                                change: '+0.00%',
                                isUp: true,
                                market: 'perps' as const,
                                bidPrice: entry.b,
                                askPrice: entry.a,
                            });
                    }

                    return seededItems;
                }

                return nextCurrent.map((item) => {
                    const update = updates.find((entry) => entry.s === item.symbol);

                    if (!update) {
                        return item;
                    }

                    const price = getDisplayPrice(update.a, update.b);

                    if (!price) {
                        return item;
                    }

                    return {
                        ...item,
                        price,
                        bidPrice: update.b,
                        askPrice: update.a,
                    };
                });
            });
        },
    });

    const streamLabel =
        stream.status === 'open'
            ? 'LIVE'
            : stream.status === 'reconnecting'
              ? 'RECONNECTING'
              : stream.status === 'error'
                ? 'DEGRADED'
                : 'BOOTING';

    return (
        <WidgetWrapper title="MARKET PULSE" icon={<Activity className="w-3 h-3" />} loading={loading} error={error}>
            <div className="grid grid-cols-1 gap-2 h-full">
                <div className="flex items-center justify-end text-[8px] font-mono uppercase tracking-widest text-white/40">
                    {streamLabel}
                </div>
                {prices.length === 0 ? (
                    <div className="flex-1 flex items-center justify-center rounded-xl border border-white/5 bg-white/[0.02] text-[9px] font-mono text-white/30 uppercase tracking-widest text-center px-4">
                        Awaiting live SoDEX market data
                    </div>
                ) : (
                    prices.map((asset) => (
                        <div key={asset.symbol} className="flex items-center justify-between p-2 rounded-xl bg-white/[0.02] border border-white/5 hover:bg-white/5 transition-all">
                            <div className="flex items-center gap-3">
                                <div className={`w-1 h-8 rounded-full ${asset.isUp ? 'bg-accent' : 'bg-destructive'}`} />
                                <div>
                                    <span className="text-[10px] font-bold text-white/40 font-mono tracking-widest">{asset.symbol}</span>
                                    <p className="text-sm font-bold text-white font-mono">${asset.price}</p>
                                </div>
                            </div>
                            <div className={`flex items-center gap-1 text-[10px] font-bold font-mono ${asset.isUp ? 'text-accent neon-glow-green' : 'text-destructive'}`}>
                                {asset.isUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                                {asset.change}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </WidgetWrapper>
    );
}
