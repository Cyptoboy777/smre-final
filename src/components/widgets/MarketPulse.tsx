'use client';

import { useEffect, useState } from 'react';
import { Activity, TrendingUp, TrendingDown } from 'lucide-react';
import WidgetWrapper from '../WidgetWrapper';

const ASSETS = ['BTC', 'ETH', 'SOL'];

export default function MarketPulse() {
    const [prices, setPrices] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchPulse = async () => {
        try {
            // Fetching real-time tickers from SoDEX Spot API
            const base = process.env.NEXT_PUBLIC_SODEX_API_BASE_URL;
            const requests = ASSETS.map(asset => 
                fetch(`${base}/spot/ticker/24hr?symbol=${asset}-USDT`).then(r => r.json())
            );
            
            const results = await Promise.all(requests);
            setPrices(results.filter(r => r && r.lastPrice).map((r, i) => ({
                symbol: ASSETS[i],
                price: parseFloat(r.lastPrice).toLocaleString(undefined, { minimumFractionDigits: 2 }),
                change: parseFloat(r.priceChangePercent).toFixed(2),
                isUp: parseFloat(r.priceChangePercent) >= 0
            })));
            setLoading(false);
        } catch (e) {
            // Mock data for UI stability if API is unreachable
            setPrices([
                { symbol: 'BTC', price: '64,231.50', change: '1.24', isUp: true },
                { symbol: 'ETH', price: '2,854.12', change: '-2.45', isUp: false },
                { symbol: 'SOL', price: '142.05', change: '5.10', isUp: true }
            ]);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPulse();
        const interval = setInterval(fetchPulse, 20000); // Pulse every 20s
        return () => clearInterval(interval);
    }, []);

    return (
        <WidgetWrapper title="MARKET PULSE" icon={<Activity className="w-3 h-3" />} loading={loading}>
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
                            {asset.change}%
                        </div>
                    </div>
                ))}
            </div>
        </WidgetWrapper>
    );
}
