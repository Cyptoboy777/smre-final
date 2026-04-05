'use client';

import { useEffect, useState } from 'react';
import { Wallet, RefreshCw, AlertCircle } from 'lucide-react';
import WidgetWrapper from './WidgetWrapper';

interface BinancePortfolioWidgetProps { }

export default function BinancePortfolioWidget({ }: BinancePortfolioWidgetProps) {
    const [balances, setBalances] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchBalance = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch('/api/binance/balance');
            const data = await res.json();

            if (res.ok && data.success) {
                setBalances(data.balances);
            } else {
                setError(data.error || "Failed to sync Binance Testnet");
            }
        } catch (err) {
            console.error("Binance sync error:", err);
            setError("Network error syncing Binance");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBalance();
    }, []);

    // Calculate generic total value for demo (assuming 1 USDT = $1 for simple display if no other prices available)
    const totalValue = balances.reduce((acc, b) => {
        // Just a mock calculation for the UI to look active
        let val = parseFloat(b.free) + parseFloat(b.locked);
        if (b.asset === 'BTC') val *= 52000;
        if (b.asset === 'ETH') val *= 2800;
        if (b.asset === 'BNB') val *= 350;
        return acc + (b.asset === 'USDT' ? val : val); // Rough estimation
    }, 0);

    return (
        <WidgetWrapper
            title="BINANCE PORTFOLIO"
            icon={<Wallet className="w-4 h-4 text-cyan-400" />}
            loading={loading}
            className="max-h-[300px]"
        >
            <div className="flex flex-col h-full">
                {/* Total Balance Overview */}
                <div className="flex justify-between items-center mb-4 pb-4 border-b border-white/10">
                    <div>
                        <p className="text-[10px] text-zinc-500 font-mono tracking-widest mb-1">TESTNET EST. VALUE</p>
                        <h3 className="text-2xl font-bold font-mono text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]">
                            ${totalValue > 0 ? totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00'}
                        </h3>
                    </div>

                    <button
                        onClick={fetchBalance}
                        disabled={loading}
                        className="p-2 rounded-lg bg-white/5 hover:bg-cyan-500/20 border border-transparent hover:border-cyan-500/50 transition-all text-cyan-400 disabled:opacity-50 group"
                        title="Sync Balance"
                    >
                        <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-500'}`} />
                    </button>
                </div>

                {/* Asset List */}
                {error ? (
                    <div className="flex flex-col items-center justify-center flex-1 text-red-400/80 text-center">
                        <AlertCircle className="w-8 h-8 mb-2 opacity-50" />
                        <p className="text-xs max-w-[200px]">{error}</p>
                    </div>
                ) : balances.length === 0 && !loading ? (
                    <div className="flex flex-col items-center justify-center flex-1 text-zinc-500 text-sm font-mono text-center">
                        <p>NO ASSETS FOUND</p>
                        <p className="text-[10px] mt-1">Add funds to Binance Testnet.</p>
                    </div>
                ) : (
                    <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-2">
                        {balances.map((coin, i) => {
                            const total = parseFloat(coin.free) + parseFloat(coin.locked);
                            // Filter dusty dust
                            if (total <= 0.000001 && coin.asset !== 'USDT') return null;

                            return (
                                <div key={i} className="flex justify-between items-center p-2 rounded bg-black/20 hover:bg-white/5 transition-colors border border-white/5">
                                    <div className="flex items-center gap-2">
                                        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-cyan-600 to-blue-800 flex items-center justify-center text-[10px] font-bold shadow-[0_0_5px_rgba(0,102,255,0.4)]">
                                            {coin.asset.slice(0, 1)}
                                        </div>
                                        <div>
                                            <p className="font-bold text-sm text-cyan-50">{coin.asset}</p>
                                            <p className="text-[10px] text-cyan-500/50">FREE: {parseFloat(coin.free).toFixed(4)}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-mono text-sm tracking-wider text-white">{total.toFixed(4)}</p>
                                        {parseFloat(coin.locked) > 0 && <p className="text-[10px] text-magenta-400">IN ORDERS: {parseFloat(coin.locked).toFixed(4)}</p>}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </WidgetWrapper>
    );
}
