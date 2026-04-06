'use client';

import { useState, useEffect } from 'react';
import { Wallet, Shield, RefreshCw, Eye, EyeOff, Lock, AlertCircle } from 'lucide-react';
import { ethers } from 'ethers';
import WidgetWrapper from '../WidgetWrapper';
import { motion, AnimatePresence } from 'framer-motion';

export default function PortfolioVault() {
    const [privateKey, setPrivateKey] = useState('');
    const [showKey, setShowKey] = useState(false);
    const [address, setAddress] = useState<string | null>(null);
    const [portfolio, setPortfolio] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const deriveAndFetch = async () => {
        if (!privateKey) return;
        
        setLoading(true);
        setError(null);

        try {
            // Derive address locally (client side)
            let derivedAddr = '';
            if (ethers.isAddress(privateKey)) {
                derivedAddr = privateKey;
            } else {
                const wallet = new ethers.Wallet(privateKey.startsWith('0x') ? privateKey : `0x${privateKey}`);
                derivedAddr = wallet.address;
            }
            
            setAddress(derivedAddr);

            // Fetch balances from our server-side RPC proxy
            const res = await fetch(`/api/balance?address=${derivedAddr}`);
            const data = await res.json();

            if (data.success) {
                setPortfolio(data);
            } else {
                throw new Error(data.error);
            }
        } catch (err: any) {
            setError(err.message === 'invalid hex string' ? 'INVALID PRIVATE KEY' : err.message);
            setPortfolio(null);
            setAddress(null);
        } finally {
            setLoading(false);
        }
    };

    return (
        <WidgetWrapper title="PORTFOLIO VAULT" icon={<Wallet className="w-3 h-3" />} loading={loading}>
            <div className="flex flex-col gap-4 h-full">
                {!address ? (
                    <div className="flex-1 flex flex-col gap-3 items-center justify-center">
                        <div className="w-10 h-10 rounded-full bg-white/[0.02] border border-white/5 flex items-center justify-center mb-2">
                            <Lock className="w-5 h-5 text-white/20" />
                        </div>
                        <div className="w-full relative group">
                            <input 
                                type={showKey ? "text" : "password"}
                                value={privateKey}
                                onChange={(e) => setPrivateKey(e.target.value)}
                                placeholder="ENTER PRIVATE KEY OR ADDR..."
                                className="w-full bg-white/[0.03] border border-white/10 rounded-xl py-2.5 pl-4 pr-10 font-mono text-[10px] text-white focus:outline-none focus:border-secondary/40 transition-all"
                            />
                            <button 
                                onClick={() => setShowKey(!showKey)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/20 hover:text-white transition-colors"
                            >
                                {showKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                            </button>
                        </div>
                        <button 
                            onClick={deriveAndFetch}
                            className="w-full py-2 bg-secondary/80 hover:bg-secondary text-white font-bold text-[10px] rounded-lg transition-all shadow-[0_0_15px_rgba(255,0,236,0.2)] uppercase tracking-widest"
                        >
                            CONNECT_VAULT
                        </button>
                        {error && <span className="text-[8px] font-mono text-destructive uppercase tracking-widest">{error}</span>}
                    </div>
                ) : (
                    <div className="flex-1 flex flex-col gap-4">
                        {/* Address Header */}
                        <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/5">
                            <div className="flex flex-col">
                                <span className="text-[8px] font-mono text-white/30 uppercase tracking-widest leading-none mb-1">CONNECTED_ADDR</span>
                                <span className="text-[10px] font-mono text-white/80">{address.slice(0, 6)}...{address.slice(-4)}</span>
                            </div>
                            <button onClick={() => { setAddress(null); setPortfolio(null); }} className="text-[8px] text-white/20 hover:text-white/50 underline font-mono">DISCONNECT</button>
                        </div>

                        {/* Portfolio Stats */}
                        <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 flex flex-col gap-2">
                            {portfolio?.balances.map((coin: any, i: number) => (
                                <div key={i} className="flex justify-between items-center p-2 rounded-lg bg-white/[0.01] border border-white/5 hover:bg-white/[0.03] transition-all">
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-bold text-white tracking-widest uppercase">{coin.asset}</span>
                                        <span className="text-[9px] font-mono text-white/40">{parseFloat(coin.amount).toFixed(4)}</span>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-[10px] font-bold text-white tracking-widest uppercase">{coin.value}</span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Total Net Worth */}
                        <div className="pt-2 border-t border-white/5 flex items-center justify-between">
                            <span className="text-[8px] font-mono text-white/30 uppercase tracking-widest">TOTAL_NET_WORTH</span>
                            <span className="text-sm font-black font-heading text-secondary neon-glow-purple tracking-widest uppercase">{portfolio?.totalValue}</span>
                        </div>
                    </div>
                )}
            </div>
        </WidgetWrapper>
    );
}
