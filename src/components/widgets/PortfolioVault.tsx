'use client';

import { useState } from 'react';
import { Wallet, Eye, EyeOff, Lock, Database } from 'lucide-react';
import { ethers } from 'ethers';
import WidgetWrapper from '../WidgetWrapper';

type PortfolioBalance = {
    asset: string;
    amount: string;
    value: string;
};

type PortfolioSnapshot = {
    address: string;
    balances: PortfolioBalance[];
    totalValue: string;
    source: 'demo' | 'live';
};

const formatUSD = (value: number) =>
    new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        maximumFractionDigits: 2,
    }).format(value);

const DEMO_PORTFOLIO: PortfolioSnapshot = {
    address: '0x8f3cA9D4bEefA7D28c4c9D7F12c2A6d1B8F0c0De',
    balances: [
        { asset: 'ETH', amount: '3.7421', value: formatUSD(10679.88) },
        { asset: 'USDC', amount: '8,120.00', value: formatUSD(8120.0) },
        { asset: 'LINK', amount: '245.0000', value: formatUSD(4459.00) },
    ],
    totalValue: formatUSD(23258.88),
    source: 'demo',
};

const safeAmount = (amount: unknown) => {
    const numericAmount = Number(amount);
    if (Number.isFinite(numericAmount)) {
        return numericAmount.toFixed(4);
    }
    if (typeof amount === 'string' && amount.trim().length > 0) {
        return amount;
    }
    return '0.0000';
};

const normalizePortfolio = (data: any, address: string): PortfolioSnapshot | null => {
    if (!data || data.success !== true || !Array.isArray(data.balances)) {
        return null;
    }

    const balances = data.balances
        .filter((balance: any) => balance && typeof balance.asset === 'string')
        .map((balance: any) => ({
            asset: balance.asset,
            amount: safeAmount(balance.amount),
            value: typeof balance.value === 'string' ? balance.value : formatUSD(Number(balance.value) || 0),
        }));

    if (balances.length === 0 || typeof data.totalValue !== 'string') {
        return null;
    }

    return {
        address: typeof data.address === 'string' ? data.address : address,
        balances,
        totalValue: data.totalValue,
        source: 'live',
    };
};

export default function PortfolioVault() {
    const [privateKey, setPrivateKey] = useState('');
    const [showKey, setShowKey] = useState(false);
    const [address, setAddress] = useState<string | null>(null);
    const [portfolio, setPortfolio] = useState<PortfolioSnapshot | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const activePortfolio = address ? portfolio ?? DEMO_PORTFOLIO : DEMO_PORTFOLIO;

    const deriveAndFetch = async () => {
        const input = privateKey.trim();
        if (!input) {
            setError('ENTER_A_PRIVATE_KEY_OR_WALLET_ADDRESS');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            let derivedAddr = '';

            if (/^0x[0-9a-fA-F]{40}$/.test(input)) {
                derivedAddr = ethers.getAddress(input);
            } else {
                const key = input.startsWith('0x') ? input : `0x${input}`;
                const wallet = new ethers.Wallet(key);
                derivedAddr = wallet.address;
            }

            setAddress(derivedAddr);

            const searchParams = new URLSearchParams({ address: derivedAddr });
            const res = await fetch(`/api/balance?${searchParams.toString()}`);
            const data = await res.json();
            const normalized = normalizePortfolio(data, derivedAddr);

            if (!normalized) {
                throw new Error(data?.error || 'UNABLE_TO_LOAD_LIVE_PORTFOLIO');
            }

            setPortfolio(normalized);
        } catch (err: any) {
            const message = typeof err?.message === 'string' ? err.message : 'PORTFOLIO_SYNC_FAILED';
            setError(
                message.toLowerCase().includes('invalid') || message.toLowerCase().includes('hex')
                    ? 'INVALID PRIVATE KEY OR ADDRESS'
                    : message
            );
            setPortfolio(null);
            setAddress(null);
        } finally {
            setLoading(false);
        }
    };

    const disconnect = () => {
        setAddress(null);
        setPortfolio(null);
        setPrivateKey('');
        setShowKey(false);
        setError(null);
    };

    return (
        <WidgetWrapper title="PORTFOLIO VAULT" icon={<Wallet className="w-3 h-3" />} loading={loading}>
            <div className="flex flex-col gap-4 h-full">
                {!address ? (
                    <div className="flex-1 flex flex-col gap-4 min-h-0">
                        <div className="flex flex-col gap-3 items-center justify-center">
                            <div className="w-10 h-10 rounded-full bg-white/[0.02] border border-white/5 flex items-center justify-center mb-1">
                                <Lock className="w-5 h-5 text-white/20" />
                            </div>
                            <div className="w-full relative group">
                                <input
                                    type={showKey ? 'text' : 'password'}
                                    value={privateKey}
                                    onChange={(e) => {
                                        setPrivateKey(e.target.value);
                                        if (error) setError(null);
                                    }}
                                    placeholder="ENTER PRIVATE KEY OR WALLET ADDRESS"
                                    autoComplete="off"
                                    spellCheck={false}
                                    className="w-full bg-white/[0.03] border border-white/10 rounded-xl py-2.5 pl-4 pr-10 font-mono text-[10px] text-white focus:outline-none focus:border-secondary/40 transition-all"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowKey((current) => !current)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/20 hover:text-white transition-colors"
                                    aria-label={showKey ? 'Hide private key' : 'Show private key'}
                                >
                                    {showKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                                </button>
                            </div>
                            <button
                                type="button"
                                onClick={deriveAndFetch}
                                className="w-full py-2 bg-secondary/80 hover:bg-secondary text-white font-bold text-[10px] rounded-lg transition-all shadow-[0_0_15px_rgba(255,0,236,0.2)] uppercase tracking-widest"
                            >
                                CONNECT_VAULT
                            </button>
                            {error && (
                                <span className="text-[8px] font-mono text-destructive uppercase tracking-widest text-center">
                                    {error}
                                </span>
                            )}
                        </div>

                        <div className="flex-1 rounded-xl border border-white/5 bg-white/[0.015] p-3 flex flex-col gap-3 min-h-0">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Database className="w-3 h-3 text-secondary" />
                                    <span className="text-[8px] font-mono text-white/30 uppercase tracking-widest">
                                        DEMO_PORTFOLIO_PREVIEW
                                    </span>
                                </div>
                                <span className="text-[8px] font-mono text-white/30 uppercase tracking-widest">
                                    {DEMO_PORTFOLIO.source}
                                </span>
                            </div>

                            <div className="flex items-baseline justify-between">
                                <span className="text-[8px] font-mono text-white/30 uppercase tracking-widest">
                                    SAMPLE_NET_WORTH
                                </span>
                                <span className="text-sm font-black font-heading text-secondary neon-glow-purple tracking-widest uppercase">
                                    {DEMO_PORTFOLIO.totalValue}
                                </span>
                            </div>

                            <div className="flex-1 overflow-y-auto custom-scrollbar pr-1 flex flex-col gap-2">
                                {DEMO_PORTFOLIO.balances.map((coin) => (
                                    <div
                                        key={`${coin.asset}-${coin.amount}`}
                                        className="flex justify-between items-center p-2 rounded-lg bg-white/[0.01] border border-white/5"
                                    >
                                        <div className="flex flex-col">
                                            <span className="text-[10px] font-bold text-white tracking-widest uppercase">
                                                {coin.asset}
                                            </span>
                                            <span className="text-[9px] font-mono text-white/40">{coin.amount}</span>
                                        </div>
                                        <div className="text-right">
                                            <span className="text-[10px] font-bold text-white tracking-widest uppercase">
                                                {coin.value}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="flex-1 flex flex-col gap-4 min-h-0">
                        <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/5">
                            <div className="flex flex-col">
                                <span className="text-[8px] font-mono text-white/30 uppercase tracking-widest leading-none mb-1">
                                    {portfolio?.source === 'live' ? 'CONNECTED_ADDR' : 'DEMO_FALLBACK'}
                                </span>
                                <span className="text-[10px] font-mono text-white/80">
                                    {address.slice(0, 6)}...{address.slice(-4)}
                                </span>
                            </div>
                            <button
                                type="button"
                                onClick={disconnect}
                                className="text-[8px] text-white/20 hover:text-white/50 underline font-mono"
                            >
                                DISCONNECT
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 flex flex-col gap-2 min-h-0">
                            {(portfolio?.balances?.length ? portfolio.balances : DEMO_PORTFOLIO.balances).map((coin, index) => (
                                <div
                                    key={`${coin.asset}-${index}`}
                                    className="flex justify-between items-center p-2 rounded-lg bg-white/[0.01] border border-white/5 hover:bg-white/[0.03] transition-all"
                                >
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-bold text-white tracking-widest uppercase">
                                            {coin.asset}
                                        </span>
                                        <span className="text-[9px] font-mono text-white/40">
                                            {safeAmount(coin.amount)}
                                        </span>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-[10px] font-bold text-white tracking-widest uppercase">
                                            {coin.value}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="pt-2 border-t border-white/5 flex items-center justify-between gap-3">
                            <span className="text-[8px] font-mono text-white/30 uppercase tracking-widest">
                                TOTAL_NET_WORTH
                            </span>
                            <span className="text-sm font-black font-heading text-secondary neon-glow-purple tracking-widest uppercase">
                                {activePortfolio.totalValue}
                            </span>
                        </div>
                    </div>
                )}
            </div>
        </WidgetWrapper>
    );
}
