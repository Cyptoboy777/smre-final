import { useEffect, useState } from 'react';
import { Terminal, ArrowRight, Zap, Target, Activity } from 'lucide-react';
import WidgetWrapper from './WidgetWrapper';

interface SodexTerminalWidgetProps {
    targetAsset: any | null;
}

export default function SodexTerminalWidget({ targetAsset }: SodexTerminalWidgetProps) {
    const [amount, setAmount] = useState('100');
    const [leverage, setLeverage] = useState('10x');
    const [executing, setExecuting] = useState(false);
    const [lastTrade, setLastTrade] = useState<string | null>(null);
    const [trades, setTrades] = useState<any[]>([]);
    const [livePrice, setLivePrice] = useState<string | null>(null);
    const [syncing, setSyncing] = useState(false);

    // Live Price Polling for active target
    useEffect(() => {
        if (!targetAsset || targetAsset.type !== 'token') {
            setLivePrice(null);
            return;
        }

        const pollPrice = async () => {
            setSyncing(true);
            try {
                const res = await fetch(`/api/analyze?query=${targetAsset.symbol}`);
                const data = await res.json();
                if (data.price) {
                    setLivePrice(data.price);
                }
            } catch (e) {
                console.warn("Terminal sync failed.");
            } finally {
                setSyncing(false);
            }
        };

        pollPrice();
        const interval = setInterval(pollPrice, 10000); // Sync every 10s
        return () => clearInterval(interval);
    }, [targetAsset]);

    const handleExecute = async (direction: 'LONG' | 'SHORT') => {
        if (!targetAsset) return;
        setExecuting(true);
        setLastTrade(null);

        try {
            const response = await fetch('/api/sodex/trade', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    symbol: targetAsset.symbol || 'ASSET',
                    amount: parseFloat(amount),
                    leverage: leverage,
                    direction: direction,
                    isPerps: true
                })
            });

            const data = await response.json();
            
            if (data.success) {
                const log = `${direction} ${amount} ${targetAsset.symbol} @ ${leverage}`;
                setLastTrade(`SUCCESS: ${log} via SoDEX`);
                setTrades(prev => [{
                    id: Date.now(),
                    symbol: targetAsset.symbol,
                    side: direction,
                    amount,
                    leverage,
                    status: 'FILLED',
                    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
                }, ...prev].slice(0, 3));
            } else {
                setLastTrade(`ERROR: ${data.error || 'Execution failed'}`);
            }
        } catch (err: any) {
            setLastTrade(`ERROR: Network failed - ${err.message}`);
        } finally {
            setExecuting(false);
        }
    };

    const isReady = targetAsset && targetAsset.type === 'token';

    return (
        <WidgetWrapper
            title="SODEX TERMINAL (DEMO)"
            icon={<Terminal className="w-4 h-4 text-cyan-400" />}
            className="flex-1 min-h-[400px]"
        >
            <div className="flex flex-col h-full justify-between">
                {/* Context/Target info */}
                <div className="bg-black/40 border border-white/5 p-3 rounded-lg mb-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Activity className={`w-4 h-4 ${isReady ? 'text-green-400 animate-pulse' : 'text-zinc-500'}`} />
                        <div>
                            <p className="text-[10px] text-zinc-500 font-mono tracking-widest flex items-center gap-1">
                                SODEX MAINNET {syncing && <span className="text-[8px] text-cyan-400 animate-bounce tracking-tighter">● SYNCING</span>}
                            </p>
                            <p className={`font-bold font-mono text-sm ${isReady ? 'text-white' : 'text-zinc-600'}`}>
                                {isReady ? `${targetAsset.symbol}/USDT` : 'AWAITING SELECTION'}
                            </p>
                        </div>
                    </div>
                    {isReady && (livePrice || targetAsset.price) && (
                        <div className="text-right">
                            <p className="text-sm font-mono text-cyan-400 drop-shadow-[0_0_5px_rgba(0,243,255,0.4)]">
                                ${livePrice || targetAsset.price}
                            </p>
                            <span className="text-[8px] text-zinc-500 uppercase font-bold tracking-widest">LIVE DATA FEED</span>
                        </div>
                    )}
                </div>

                {/* Demo Balance Display */}
                <div className="flex justify-between items-center mb-4 px-2">
                    <div className="flex flex-col">
                        <span className="text-[10px] text-zinc-500 font-mono tracking-widest uppercase">DEMO LIQUIDITY</span>
                        <span className="text-[8px] text-cyan-500/50 uppercase font-bold">SO-DEX MAINNET POOL #286623</span>
                    </div>
                    <span className="text-sm font-mono text-magenta-400 drop-shadow-[0_0_5px_rgba(255,0,236,0.3)]">10.0000 ETH</span>
                </div>

                {/* Inputs */}
                <div className="space-y-4 mb-6">
                    <div>
                        <label className="text-[10px] text-cyan-500/80 font-mono tracking-widest mb-1 block">TRADE AMOUNT (USDT)</label>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 font-mono text-sm">$</span>
                            <input
                                type="number"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                disabled={!isReady || executing}
                                className="w-full bg-white/5 border border-white/10 rounded p-2 pl-7 font-mono text-white focus:outline-none focus:border-cyan-500/50 transition-colors disabled:opacity-50"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="text-[10px] text-magenta-500/80 font-mono tracking-widest mb-1 block">LEVERAGE MULLTIPLIER</label>
                        <div className="flex gap-2">
                            {['1x', '5x', '10x', '20x', '50x'].map(lev => (
                                <button
                                    key={lev}
                                    onClick={() => setLeverage(lev)}
                                    disabled={!isReady || executing}
                                    className={`flex-1 py-1 text-xs font-mono rounded border transition-all ${leverage === lev ? 'bg-magenta-500/20 text-magenta-300 border-magenta-500/50 shadow-[0_0_8px_rgba(255,0,236,0.2)]' : 'bg-transparent text-zinc-500 border-white/5 hover:bg-white/5 hover:text-zinc-300'} disabled:opacity-50`}
                                >
                                    {lev}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 mb-4">
                    <button
                        onClick={() => handleExecute('LONG')}
                        disabled={!isReady || executing}
                        className="flex-1 bg-green-500/10 hover:bg-green-500/20 border border-green-500/30 text-green-400 font-bold py-3 rounded-lg flex items-center justify-center gap-2 transition-all hover:shadow-[0_0_15px_rgba(74,222,128,0.2)] disabled:opacity-50 active:scale-95 group"
                    >
                        <ArrowRight className="w-4 h-4 -rotate-45 group-hover:-translate-y-1 group-hover:translate-x-1 transition-transform" />
                        EXECUTE LONG
                    </button>
                    <button
                        onClick={() => handleExecute('SHORT')}
                        disabled={!isReady || executing}
                        className="flex-1 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 font-bold py-3 rounded-lg flex items-center justify-center gap-2 transition-all hover:shadow-[0_0_15px_rgba(239,68,68,0.2)] disabled:opacity-50 active:scale-95 group"
                    >
                        <ArrowRight className="w-4 h-4 rotate-45 group-hover:translate-y-1 group-hover:translate-x-1 transition-transform" />
                        EXECUTE SHORT
                    </button>
                </div>

                {/* Terminal Log */}
                <div className="bg-black/60 border border-white/5 h-24 rounded p-2 overflow-y-auto font-mono text-[10px] custom-scrollbar">
                    <p className="text-zinc-500 mb-1">&gt; INITIALIZING SODEX TERMINAL...</p>
                    <p className="text-cyan-500/50 mb-1">&gt; STANDING BY FOR COMMANDS.</p>
                    {executing && (
                        <p className="text-yellow-500 animate-pulse flex items-center">
                            <Zap className="w-3 h-3 mr-1" />
                            &gt; ROUTING ORDER VIA SODEX MAINNET API...
                        </p>
                    )}
                    {lastTrade && (
                        <p className="text-green-400 drop-shadow-[0_0_2px_rgba(74,222,128,0.8)] mt-1">
                            &gt; {lastTrade}
                        </p>
                    )}
                </div>

                {/* Recent Activity Mini-Table */}
                {trades.length > 0 && (
                    <div className="mt-4 border-t border-white/5 pt-3">
                        <p className="text-[10px] text-zinc-500 font-mono tracking-widest mb-2">RECENT SODEX ACTIVITY</p>
                        <div className="space-y-1.5">
                            {trades.map(t => (
                                <div key={t.id} className="flex justify-between items-center text-[10px] font-mono bg-white/5 p-1.5 rounded border border-white/5">
                                    <div className="flex gap-2 items-center">
                                        <span className={t.side === 'LONG' ? 'text-green-400' : 'text-red-400'}>{t.side}</span>
                                        <span className="text-zinc-300">{t.symbol}</span>
                                        <span className="text-zinc-500">{t.leverage}</span>
                                    </div>
                                    <div className="flex gap-3 items-center">
                                        <span className="text-cyan-400">${t.amount}</span>
                                        <span className="text-[8px] text-zinc-600">{t.time}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </WidgetWrapper>
    );
}
