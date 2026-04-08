'use client';

import { useEffect, useState } from 'react';
import { Activity, TrendingUp, TrendingDown } from 'lucide-react';
import WidgetWrapper from '../WidgetWrapper';
import { type MarketPulseItem } from '@/lib/crypto-dashboard';
import { useSodexWebSocket } from '@/hooks/useSodexWebSocket';

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

export default function MarketPulse() {
    const [prices, setPrices] = useState<MarketPulseItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchPulse = async () => {
        try {
            const res = await fetch('/api/sodex/market?market=perps');
            const data = await res.json();

            if (data?.success && Array.isArray(data.items) && data.items.length > 0) {
                setPrices(
                    data.items
                        .filter((item: MarketPulseItem) => TRACKED_SYMBOLS.includes(item.symbol))
                        .slice(0, 3)
                );
                setError(null);
            } else {
                throw new Error(data?.error || 'Unable to load SoDEX market pulse');
            }
        } catch (fetchError: any) {
            setError(fetchError?.message || 'Unable to load SoDEX market pulse');
        } finally {
            setLoading(false);
        }
    };

    useSodexWebSocket<AllBookTickerMessage>({
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

            setPrices((current) =>
                current.map((item) => {
                    const update = message.data?.find((entry) => entry.s === item.symbol);

                    if (!update) {
                        return item;
                    }

                    const ask = Number(update.a);
                    const bid = Number(update.b);
                    const price = ((ask + bid) / 2).toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                    });

                    return {
                        ...item,
                        price,
                        bidPrice: update.b,
                        askPrice: update.a,
                    };
                })
            );
        },
    });

    useEffect(() => {
        fetchPulse();
        const interval = setInterval(fetchPulse, 20000); // Pulse every 20s
        return () => clearInterval(interval);
    }, []);

    return (
        <WidgetWrapper title="MARKET PULSE" icon={<Activity className="w-3 h-3" />} loading={loading} error={error}>
            <div className="grid grid-cols-1 gap-2 h-full">
                {prices.map((asset, i) => (
                    <div key={i} className="flex items-center justify-between p-2 rounded-xl bg-white/[0.02] border border-white/5 hover:bg-white/5 transition-all">
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
                ))}
            </div>
        </WidgetWrapper>
    );
}
