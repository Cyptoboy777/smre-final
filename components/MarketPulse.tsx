'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { TrendingUp, Newspaper } from 'lucide-react';
import axios from 'axios';

interface MarketPulseProps {
    onTokenClick: (token: string) => void;
}

export default function MarketPulse({ onTokenClick }: MarketPulseProps) {
    const [news, setNews] = useState<any[]>([]);
    const [trending, setTrending] = useState<any[]>([]);

    // Mock Data for Demo (Stability)
    useEffect(() => {
        // Simulated News
        setNews([
            "Bitcoin breaks $60k resistance level as ETFs see record inflow.",
            "Vitalik Buterin proposes new gas fee structure for Ethereum L2s.",
            "Solana network congestion eases after patch deployment.",
            "BlackRock CEO says crypto is 'digital gold' in recent interview.",
            "Regulatory clarity coming to US stablecoin market soon."
        ]);

        // Simulated Trending (Major Movers + Meme Coins)
        setTrending([
            { symbol: "BTC", price: "52,430.00", change: 2.1 },
            { symbol: "ETH", price: "2,840.50", change: 1.8 },
            { symbol: "SOL", price: "112.45", change: 5.2 },
            { symbol: "PEPE", price: "0.0000012", change: 12.5 },
            { symbol: "WIF", price: "0.35", change: -5.2 },
            { symbol: "BONK", price: "0.000021", change: 8.4 },
        ]);
    }, []);

    return (
        <div className="w-full max-w-6xl mx-auto mt-12 grid grid-cols-1 lg:grid-cols-4 gap-6">

            {/* 1. News Ticker (Full Width) */}
            <div className="col-span-1 lg:col-span-4 bg-zinc-900/50 border-y border-yellow-500/20 py-2 overflow-hidden flex items-center">
                <div className="bg-yellow-500 text-black text-xs font-bold px-3 py-1 ml-2 rounded uppercase font-heading">
                    BREAKING
                </div>
                <div className="flex-1 overflow-hidden relative">
                    <motion.div
                        className="flex whitespace-nowrap"
                        animate={{ x: ["100%", "-100%"] }} // Scroll from right to left
                        transition={{ repeat: Infinity, duration: 20, ease: "linear" }}
                    >
                        {news.map((item, i) => (
                            <span key={i} className="mx-8 text-zinc-300 font-mono text-sm flex items-center">
                                <Newspaper className="w-3 h-3 mr-2 text-yellow-500/50" />
                                {item}
                            </span>
                        ))}
                    </motion.div>
                </div>
            </div>

            {/* 2. Trending Grid */}
            <div className="col-span-1 lg:col-span-4">
                <h3 className="text-lg font-heading font-bold text-zinc-400 mb-4 flex items-center">
                    <TrendingUp className="w-5 h-5 mr-2 text-green-500" /> SYSTEM DETECTED // HIGH VOLATILITY
                </h3>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                    {trending.map((token, i) => (
                        <motion.div
                            key={i}
                            whileHover={{ scale: 1.05 }}
                            onClick={() => onTokenClick(token.symbol)}
                            className={`bg-zinc-900/80 p-4 rounded-lg border flex flex-col items-center justify-center cursor-pointer transition-colors ${token.change >= 0 ? 'border-green-500/30 hover:border-green-500' : 'border-red-500/30 hover:border-red-500'}`}
                        >
                            <span className="font-bold text-xl tracking-tighter">{token.symbol}</span>
                            <span className="text-xs text-zinc-500 font-mono">${token.price}</span>
                            <span className={`text-sm font-bold mt-2 ${token.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                {token.change > 0 ? '+' : ''}{token.change}%
                            </span>
                        </motion.div>
                    ))}
                </div>
            </div>

        </div>
    );
}
