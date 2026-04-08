'use client';

import { useState, useEffect } from 'react';
import { Zap, ArrowUpRight, ArrowDownRight, Activity, Terminal, Shield, RefreshCw } from 'lucide-react';
import WidgetWrapper from '../WidgetWrapper';
import { motion } from 'framer-motion';
import { type SodexOrder } from '@/lib/crypto-dashboard';
import { useSodexWebSocket } from '@/hooks/useSodexWebSocket';

interface SodexTerminalProps {
    target: any | null;
}

type AllBookTickerMessage = {
    channel?: string;
    type?: 'snapshot' | 'update';
    data?: Array<{
        s: string;
        a: string;
        b: string;
    }>;
};

type OrdersRouteResponse = {
    success?: boolean;
    authenticated?: boolean;
    reason?: string;
    orders?: SodexOrder[];
    error?: string;
};

export default function SodexTerminal({ target }: SodexTerminalProps) {
    const [amount, setAmount] = useState('0.010000');
    const [price, setPrice] = useState<string | null>(null);
    const [executing, setExecuting] = useState(false);
    const [orders, setOrders] = useState<SodexOrder[]>([]);
    const [serverAuthenticated, setServerAuthenticated] = useState(true);
    const [statusNote, setStatusNote] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loadingOrders, setLoadingOrders] = useState(true);

    const asset = target?.symbol
        ? String(target.symbol).includes('-')
            ? String(target.symbol)
            : `${String(target.symbol).toUpperCase()}-USD`
        : 'BTC-USD';

    const loadOrders = async () => {
        setLoadingOrders(true);
        try {
            const params = new URLSearchParams({
                market: 'perps',
                symbol: asset,
                limit: '8',
            });
            const res = await fetch(`/api/sodex/orders?${params.toString()}`);
            const data = (await res.json()) as OrdersRouteResponse;

            if (!data?.success) {
                throw new Error(data?.error || 'Unable to load order history');
            }

            if (data.authenticated === false) {
                setServerAuthenticated(false);
                setStatusNote(data.reason || 'READ_ONLY_MARKET_MODE');
                setOrders([]);
                setError(null);
                return;
            }

            setServerAuthenticated(true);
            setStatusNote(null);
            setOrders(data.orders || []);
            setError(null);
        } catch (fetchError: any) {
            setError(fetchError?.message || 'Unable to load order history');
        } finally {
            setLoadingOrders(false);
        }
    };

    // Live Price Polling (10s)
    const fetchLivePrice = async () => {
        try {
            const params = new URLSearchParams({
                market: 'perps',
                symbol: asset,
            });
            const res = await fetch(`/api/sodex/market?${params.toString()}`);
            const data = await res.json();

            if (!data?.success) {
                throw new Error(data?.error || 'Unable to load perps ticker');
            }

            const marketEntry = Array.isArray(data?.items) ? data.items[0] : null;

            if (marketEntry?.price) {
                setPrice(String(marketEntry.price).replace(/,/g, ''));
                setError(null);
            }
        } catch (fetchError: any) {
            setError(fetchError?.message || 'Unable to load perps ticker');
        }
    };

    const { status: wsStatus } = useSodexWebSocket<AllBookTickerMessage>({
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

            const update = message.data.find((entry) => entry.s === asset);
            if (!update) {
                return;
            }

            const ask = Number(update.a);
            const bid = Number(update.b);
            setPrice(
                ((ask + bid) / 2).toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                })
            );
        },
    });

    useEffect(() => {
        fetchLivePrice();
        loadOrders();
        const interval = setInterval(fetchLivePrice, 15000);
        return () => clearInterval(interval);
    }, [asset]);

    const handleTrade = async (direction: 'LONG' | 'SHORT') => {
        if (!serverAuthenticated) {
            setError(statusNote || 'SERVER_SIDE_SODEX_PRIVATE_KEY_NOT_CONFIGURED');
            return;
        }

        if (!amount || Number(amount) <= 0) {
            setError('POSITION_SIZE_REQUIRED');
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
                    direction: direction
                })
            });

            const data = await res.json();

            if (data.success) {
                await loadOrders();
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
                        <span className="text-[8px] font-mono text-white/30 uppercase tracking-widest leading-none mb-1">ACTIVE_PERPS_SYMBOL</span>
                        <div className="text-xl font-black text-white font-heading tracking-widest uppercase">{asset}</div>
                    </div>
                    <div className="text-right">
                        <span className="text-[8px] font-mono text-primary/50 uppercase tracking-widest leading-none mb-1 flex items-center gap-1 justify-end">
                            <Activity className="w-2 h-2 animate-pulse" /> {wsStatus.toUpperCase()}
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
                            <span className="text-[8px] font-mono text-white/30 uppercase tracking-widest">POSITION_SIZE</span>
                            <span className="text-[10px] font-mono text-white/60">DECIMALSTRING_FORMAT</span>
                        </div>
                        <input 
                            type="number"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            step="0.000001"
                            className="bg-white/[0.03] border border-white/10 rounded-xl py-2 px-4 font-mono text-xs text-white focus:outline-none focus:border-primary/40 transition-all"
                        />
                    </div>
                </div>

                {/* Execution Buttons */}
                <div className="grid grid-cols-2 gap-3 shrink-0">
                    <button 
                        onClick={() => handleTrade('LONG')}
                        disabled={executing || !serverAuthenticated}
                        className="flex items-center justify-center gap-2 py-3 bg-accent/20 hover:bg-accent/40 border border-accent/40 rounded-xl text-accent font-black text-[10px] uppercase tracking-widest transition-all hover:shadow-[0_0_15px_rgba(0,255,163,0.2)] disabled:opacity-50"
                    >
                        <ArrowUpRight className="w-3.5 h-3.5" />
                        OP_LONG
                    </button>
                    <button 
                        onClick={() => handleTrade('SHORT')}
                        disabled={executing || !serverAuthenticated}
                        className="flex items-center justify-center gap-2 py-3 bg-destructive/20 hover:bg-destructive/40 border border-destructive/40 rounded-xl text-destructive font-black text-[10px] uppercase tracking-widest transition-all hover:shadow-[0_0_15px_rgba(255,0,0,0.2)] disabled:opacity-50"
                    >
                        <ArrowDownRight className="w-3.5 h-3.5" />
                        OP_SHORT
                    </button>
                </div>

                {error && <div className="text-[8px] font-mono text-destructive uppercase tracking-widest text-center">{error}</div>}
                {!error && statusNote && <div className="text-[8px] font-mono text-white/35 uppercase tracking-widest text-center">{statusNote}</div>}

                {/* Order History Log */}
                <div className="flex-1 flex flex-col min-h-0">
                    <span className="text-[8px] font-mono text-white/20 uppercase tracking-widest mb-2 flex items-center gap-2">
                        <Terminal className="w-2.5 h-2.5" /> EXECUTION_HISTORY
                    </span>
                    <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 flex flex-col gap-2">
                        {loadingOrders ? (
                            <div className="flex-1 flex items-center justify-center text-[8px] font-mono text-white/10 uppercase tracking-widest">
                                LOADING_ORDER_HISTORY
                            </div>
                        ) : !serverAuthenticated ? (
                            <div className="flex-1 flex items-center justify-center text-[8px] font-mono text-white/20 uppercase tracking-widest text-center">
                                READ_ONLY_MARKET_MODE
                            </div>
                        ) : orders.length === 0 ? (
                            <div className="flex-1 flex items-center justify-center text-[8px] font-mono text-white/10 uppercase tracking-widest">
                                EMPTY_BUFFER
                            </div>
                        ) : (
                            orders.map((o, i) => (
                                <div key={i} className="p-2 rounded-lg bg-white/[0.01] border border-white/5 flex gap-3 text-[9px] font-mono text-white/60">
                                    <span className={o.side === 'BUY' ? 'text-accent' : 'text-destructive'}>{o.side}</span>
                                    <span>{o.symbol}</span>
                                    <span>{o.price || 'MKT'}</span>
                                    <span className="ml-auto text-primary/40 uppercase tracking-widest leading-none flex items-center gap-1">
                                        <Shield className="w-2.5 h-2.5" /> {o.status}
                                    </span>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Signing Badge */}
                <div className="flex items-center gap-1.5 pt-2 border-t border-white/5 opacity-40">
                    <RefreshCw className="w-2 h-2 animate-spin text-primary" />
                    <span className="text-[7px] font-mono text-white/50 uppercase tracking-widest">
                        {serverAuthenticated ? 'EIP712_SIGNED_REST_ORDER_ROUTING_ENABLED' : 'READ_ONLY_MARKET_ROUTING_ACTIVE'}
                    </span>
                </div>
            </div>
        </WidgetWrapper>
    );
}
