'use client';

import { useState } from 'react';
import { 
    Search, 
    Cpu,
} from 'lucide-react';

// Widget Components
import IntelligenceWidget from '@/components/widgets/IntelligenceWidget';
import SodexTerminal from '@/components/widgets/SodexTerminal';
import SecurityRadar from '@/components/widgets/SecurityRadar';
import PortfolioVault from '@/components/widgets/PortfolioVault';
import NewsStream from '@/components/widgets/NewsStream';
import MarketPulse from '@/components/widgets/MarketPulse';
import { useApiMutation } from '@/hooks/useApiMutation';
import { fetchApi } from '@/lib/client/api-client';
import { type AnalyzeRouteResponse, type ApiSuccessPayload } from '@/lib/api';

export default function Dashboard() {
    const [query, setQuery] = useState('');
    const {
        data: analysisData,
        loading,
        error,
        mutate: runAnalysis,
    } = useApiMutation<ApiSuccessPayload<AnalyzeRouteResponse>, string>({
        request: async (searchTerm, signal) =>
            fetchApi<ApiSuccessPayload<AnalyzeRouteResponse>>(`/api/analyze?${new URLSearchParams({ query: searchTerm }).toString()}`, {
                signal,
            }),
    });

    const handleSearch = async (e?: React.FormEvent, overrideQuery?: string) => {
        if (e) e.preventDefault();
        const searchTerm = (overrideQuery ?? query).trim();
        if (!searchTerm) return;

        try {
            await runAnalysis(searchTerm);
        } catch {}
    };

    return (
        <div className="flex-1 flex flex-col gap-4 max-w-[1600px] mx-auto w-full">
            {/* Header / Command Bar */}
            <header className="flex flex-col md:flex-row items-center justify-between gap-4 py-4 px-2">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20 shadow-[0_0_15px_rgba(0,243,255,0.2)]">
                        <Cpu className="w-6 h-6 text-primary neon-glow-cyan" />
                    </div>
                    <div>
                        <h1 className="text-xl font-heading font-black tracking-tighter text-white">soso-smre</h1>
                        <p className="text-[10px] text-primary/50 font-mono tracking-widest uppercase">Institutional Intelligence Engine</p>
                    </div>
                </div>

                <form onSubmit={handleSearch} className="flex-1 max-w-2xl w-full relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                    <input 
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="SEARCH TOKEN SYMBOL OR WALLET ADDR..."
                        className="w-full bg-white/[0.03] border border-white/10 rounded-2xl py-3 pl-12 pr-4 font-mono text-xs text-white placeholder:text-white/20 focus:outline-none focus:border-primary/40 focus:bg-white/[0.05] transition-all"
                    />
                    <button 
                        type="submit"
                        disabled={loading}
                        className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-1.5 bg-primary/80 hover:bg-primary text-black font-bold text-[10px] rounded-lg transition-all disabled:opacity-50"
                    >
                        {loading ? 'ANALYZING...' : 'EXECUTE'}
                    </button>
                </form>

                <div className="flex items-center gap-6">
                    <div className="hidden lg:flex flex-col items-end">
                        <span className="text-[8px] text-white/40 font-mono uppercase tracking-widest">NETWORK STATUS</span>
                        <span className="text-[10px] text-accent font-bold flex items-center gap-1.5 neon-glow-green">
                            <span className="w-1.5 h-1.5 bg-accent rounded-full animate-pulse" />
                            SODEX MAINNET LIVE
                        </span>
                    </div>
                    <div className="w-10 h-10 rounded-full border border-white/10 bg-white/5 flex items-center justify-center overflow-hidden">
                        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-primary to-secondary opacity-50 blur-[2px]" />
                    </div>
                </div>
            </header>

            {/* Dashboard Grid */}
            <main className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-4 auto-rows-fr min-h-0">
                
                {/* Left Column - Feeds & Pulses */}
                <div className="lg:col-span-3 flex flex-col gap-4">
                    <div className="h-[200px]">
                        <MarketPulse />
                    </div>
                    <div className="flex-1 min-h-0">
                        <NewsStream onTickerClick={(t) => { setQuery(t); handleSearch(undefined, t); }} />
                    </div>
                </div>

                {/* Center Column - Core Analysis */}
                <div className="lg:col-span-6 flex flex-col gap-4">
                    <div className="flex-1 min-h-0">
                        <IntelligenceWidget data={analysisData} loading={loading} error={error} />
                    </div>
                    <div className="h-[250px] grid grid-cols-2 gap-4">
                        <SecurityRadar data={analysisData} loading={loading} />
                        <PortfolioVault />
                    </div>
                </div>

                {/* Right Column - Execution & Orderbook */}
                <div className="lg:col-span-3 flex flex-col gap-4">
                    <div className="flex-1">
                        <SodexTerminal target={analysisData} />
                    </div>
                </div>

            </main>

            {/* Footer / Status Bar */}
            <footer className="py-2 border-t border-white/5 flex items-center justify-between px-2 text-[8px] font-mono text-white/30 uppercase tracking-[0.2em] font-bold">
                <div className="flex gap-6">
                    <span>latency: 14ms</span>
                    <span>groq_engine: llama-3-70b-v8</span>
                    <span>sodex_gw: verified</span>
                </div>
                <div>
                   soso-smre v1.0.4 - institutional grade deployment
                </div>
            </footer>
        </div>
    );
}
