'use client';

import { useState, useEffect } from 'react';
import { Zap, ArrowUpRight, ArrowDownRight, Activity, Terminal, Shield, RefreshCw } from 'lucide-react';
import WidgetWrapper from '../WidgetWrapper';
import { motion, AnimatePresence } from 'framer-motion';

interface SodexTerminalProps {
    target: any | null;
}

export default function SodexTerminal({ target }: SodexTerminalProps) {
    const [balance, setBalance] = useState(10.0); // 10 ETH Demo Balance
    const [amount, setAmount] = useState('1.0');
    const [leverage, setLeverage] = useState(10);
    const [price, setPrice] = useState<string | null>(null);
    const [executing, setExecuting] = useState(false);
    const [orders, setOrders] = useState<any[]>([]);
    const [error, setError] = useState<string | null>(null);

    const asset = target?.symbol || 'BTC';
    const isSodex = target?.isSodexVerified;

    // Live Price Polling (10s)
    const fetchLivePrice = async () => {
        try {
            const base = process.env.NEXT_PUBLIC_SODEX_API_BASE_URL;
            const res = await fetch(`${base}/spot/ticker/24hr?symbol=${asset}-USDT`);
            const data = await res.json();
            if (data.lastPrice) setPrice(parseFloat(data.lastPrice).toFixed(2));
        } catch (e) {
            setPrice(target?.price?.replace('$', '').replace(',', '') || '64231.50');
        }
    };

    useEffect(() => {
        fetchLivePrice();
        const interval = setInterval(fetchLivePrice, 10000);
        return () => clearInterval(interval);
    }, [asset]);

    const handleTrade = async (direction: 'LONG' | 'SHORT') => {
        if (!target) {
            setError('NO_TARGET_SELECTED');
            return;
        }
        
        setExecuting(true);
        setError(null);

        try {
            const res = await fetch('/api/trade', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    symbol: asset,
                    amount: parseFloat(amount),
                    leverage: `${leverage}x`,
                    direction: direction
                })
            });

            const data = await res.json();

            if (data.success) {
                const newOrder = {
                    id: data.orderID,
                    symbol: asset,
                    side: direction,
                    amount: amount,
                    leverage: `${leverage}x`,
                    entry: price,
                    status: 'OPEN',
                    time: new Date().toLocaleTimeString()
                };
                setOrders([newOrder, ...orders].slice(0, 5));
                // Simulated deduction (not final P&L logic)
                setBalance(prev => prev - (parseFloat(amount) / leverage));
            } else {
                throw new Error(data.error);
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setExecuting(false);
        }
    };

    return (
        <WidgetWrapper title="SODEX TERMINAL" icon={<Zap className="w-3 h-3 text-accent" />} loading={executing}>
            <div className="flex flex-col h-full gap-4">
                {/* Balance & Price Header */}
                <div className="flex justify-between items-center p-3 rounded-xl bg-white/[0.02] border border-white/10 shrink-0 relative overflow-hidden">
                    <div>
                        <span className="text-[8px] font-mono text-white/30 uppercase tracking-widest leading-none mb-1">DEMO_EQUITY_BASE</span>
                        <div className="text-xl font-black text-white font-heading tracking-widest uppercase">{balance.toFixed(4)} ETH</div>
                    </div>
                    <div className="text-right">
                        <span className="text-[8px] font-mono text-primary/50 uppercase tracking-widest leading-none mb-1 flex items-center gap-1 justify-end">
                            <Activity className="w-2 h-2 animate-pulse" /> LIVE_SYNC
                        </span>
                        <div className="text-xl font-black text-primary font-heading tracking-widest uppercase neon-glow-cyan">${price || '---'}</div>
                    </div>
                    {/* Progress Bar for Poll */}
                    <motion.div 
                        initial={{ width: '0%' }}
                        animate={{ width: '100%' }}
                        transition={{ repeat: Infinity, duration: 10, ease: 'linear' }}
                        className="absolute bottom-0 left-0 h-[1px] bg-primary/40"
                    />
                </div>

                {/* Trade Inputs */}
                <div className="flex flex-col gap-4">
                    <div className="flex flex-col gap-1.5">
                        <div className="flex justify-between items-end">
                            <span className="text-[8px] font-mono text-white/30 uppercase tracking-widest">POSITION_SIZE_ETH</span>
                            <span className="text-[10px] font-mono text-white/60">MAX_AVAIL: {balance.toFixed(2)}</span>
                        </div>
                        <input 
                            type="number"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            max={balance}
                            className="bg-white/[0.03] border border-white/10 rounded-xl py-2 px-4 font-mono text-xs text-white focus:outline-none focus:border-primary/40 transition-all"
                        />
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <div className="flex justify-between items-end">
                            <span className="text-[8px] font-mono text-white/30 uppercase tracking-widest">LEVERAGE_MULTIPLIER</span>
                            <span className="text-[10px] font-mono text-secondary font-bold tracking-widest">{leverage}x</span>
                        </div>
                        <input 
                            type="range"
                            min="1"
                            max="50"
                            value={leverage}
                            onChange={(e) => setLeverage(parseInt(e.target.value))}
                            className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-secondary"
                        />
                    </div>
                </div>

                {/* Execution Buttons */}
                <div className="grid grid-cols-2 gap-3 shrink-0">
                    <button 
                        onClick={() => handleTrade('LONG')}
                        disabled={executing}
                        className="flex items-center justify-center gap-2 py-3 bg-accent/20 hover:bg-accent/40 border border-accent/40 rounded-xl text-accent font-black text-[10px] uppercase tracking-widest transition-all hover:shadow-[0_0_15px_rgba(0,255,163,0.2)] disabled:opacity-50"
                    >
                        <ArrowUpRight className="w-3.5 h-3.5" />
                        OP_LONG
                    </button>
                    <button 
                        onClick={() => handleTrade('SHORT')}
                        disabled={executing}
                        className="flex items-center justify-center gap-2 py-3 bg-destructive/20 hover:bg-destructive/40 border border-destructive/40 rounded-xl text-destructive font-black text-[10px] uppercase tracking-widest transition-all hover:shadow-[0_0_15px_rgba(255,0,0,0.2)] disabled:opacity-50"
                    >
                        <ArrowDownRight className="w-3.5 h-3.5" />
                        OP_SHORT
                    </button>
                </div>

                {error && <div className="text-[8px] font-mono text-destructive uppercase tracking-widest text-center">{error}</div>}

                {/* Order History Log */}
                <div className="flex-1 flex flex-col min-h-0">
                    <span className="text-[8px] font-mono text-white/20 uppercase tracking-widest mb-2 flex items-center gap-2">
                        <Terminal className="w-2.5 h-2.5" /> EXECUTION_HISTORY
                    </span>
                    <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 flex flex-col gap-2">
                        {orders.length === 0 ? (
                            <div className="flex-1 flex items-center justify-center text-[8px] font-mono text-white/10 uppercase tracking-widest">
                                EMPTY_BUFFER
                            </div>
                        ) : (
                            orders.map((o, i) => (
                                <div key={i} className="p-2 rounded-lg bg-white/[0.01] border border-white/5 flex gap-3 text-[9px] font-mono text-white/60">
                                    <span className={o.side === 'LONG' ? 'text-accent' : 'text-destructive'}>{o.side}</span>
                                    <span>{o.symbol}</span>
                                    <span>{o.entry}$</span>
                                    <span className="ml-auto text-primary/40 uppercase tracking-widest leading-none flex items-center gap-1">
                                        <Shield className="w-2.5 h-2.5" /> SIGNED
                                    </span>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Signing Badge */}
                <div className="flex items-center gap-1.5 pt-2 border-t border-white/5 opacity-40">
                    <RefreshCw className="w-2 h-2 animate-spin text-primary" />
                    <span className="text-[7px] font-mono text-white/50 uppercase tracking-widest">EIP-712_SIGNATURE_AUTO_PERSIST_ON_CHAIN</span>
                </div>
            </div>
        </WidgetWrapper>
    );
}
