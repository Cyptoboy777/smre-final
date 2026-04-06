'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RadioTower, Cpu, Search, Loader2 } from 'lucide-react';
import LivePulseWidget from '@/components/widgets/LivePulseWidget';
import NewsFeedWidget from '@/components/widgets/NewsFeedWidget';
import AIAnalysisWidget from '@/components/widgets/AIAnalysisWidget';
import SecurityWidget from '@/components/widgets/SecurityWidget';
import SodexPortfolioWidget from '@/components/widgets/SodexPortfolioWidget';
import SodexTerminalWidget from '@/components/widgets/SodexTerminalWidget';
import SmartSearch from '@/components/SmartSearch';

export default function Home() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleAnalysis = async (query: string) => {
    if (!query?.trim()) return;

    setLoading(true);
    // Don't entirely wipe data immediately so skeleton can overlay cleanly
    try {
      const res = await fetch(`/api/analyze?query=${query}`);
      const result = await res.json();
      setData(result);
    } catch (err) {
      console.error("Search failed", err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogoClick = () => {
    window.location.reload();
  };

  return (
    <main className="min-h-screen bg-black text-white p-2 md:p-4 lg:p-6 relative font-mono flex flex-col overflow-y-auto custom-scrollbar">
      {/* Background Ambience */}
      <div className="fixed inset-0 pointer-events-none select-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 blur-[130px] rounded-full mix-blend-screen" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-magenta-600/5 blur-[130px] rounded-full mix-blend-screen" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60%] h-[60%] bg-cyan-600/5 blur-[150px] rounded-full mix-blend-screen" />
      </div>

      {/* Header (Slim) */}
      <header className="relative z-10 flex justify-between items-center mb-4 pb-2 border-b border-white/5 shrink-0">
        <div className="flex items-center gap-4">
          <h1
            className="text-2xl font-heading font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-magenta-500 cursor-pointer hover:opacity-80 transition-opacity drop-shadow-[0_0_8px_rgba(0,243,255,0.4)]"
            onClick={handleLogoClick}
            title="Reset System"
          >
            soso-smre
          </h1>
          <div className="hidden md:flex gap-4 text-[10px] font-mono text-cyan-500/50">
            <span className="flex items-center"><div className="w-1.5 h-1.5 bg-cyan-400 rounded-full mr-1.5 animate-pulse shadow-[0_0_8px_rgba(0,243,255,0.8)]" /> ETH MAINNET</span>
            <span className="flex items-center"><div className="w-1.5 h-1.5 bg-magenta-400 rounded-full mr-1.5 animate-pulse shadow-[0_0_5px_rgba(255,0,236,0.6)]" /> SODEX MAINNET</span>
          </div>
        </div>

        <div className="bg-black/40 border border-white/10 rounded-full px-4 py-1.5 flex items-center gap-3 backdrop-blur-md">
          <RadioTower className="w-3 h-3 text-cyan-400 animate-pulse" />
          <span className="text-xs text-zinc-300 font-bold tracking-wider">GLOBAL CAP: <span className="text-cyan-400">$2.41T</span></span>
          <span className="text-[10px] text-green-400 ml-1">+1.2%</span>
        </div>
      </header>

      {/* Main Grid Workspace - Fill remaining vertical space */}
      <div className="relative z-10 flex-1 grid grid-cols-1 lg:grid-cols-12 gap-4 h-full min-h-0">

        {/* ================= LEFT COLUMN: THE RADAR ================= */}
        <div className="col-span-1 lg:col-span-3 flex flex-col gap-4 min-h-0 h-full">
          <div className="flex-1 min-h-0">
            <LivePulseWidget
              onTokenSelect={(token) => {
                setSearchQuery(token);
                handleAnalysis(token);
              }}
            />
          </div>
          <div className="flex-[1.5] min-h-0">
            <NewsFeedWidget
              onKeywordSelect={(keyword) => {
                setSearchQuery(keyword);
                handleAnalysis(keyword);
              }}
            />
          </div>
        </div>

        {/* ================= MIDDLE COLUMN: THE BRAIN ================= */}
        <div className="col-span-1 lg:col-span-6 flex flex-col gap-4 min-h-0 h-full">
          {/* SMART COMMAND BAR */}
          <div className="shrink-0 relative glass-panel rounded-full border-cyan-500/30 overflow-hidden shadow-[0_5px_20px_rgba(0,102,255,0.15)] bg-black/50">
            <div className="absolute inset-y-0 left-0 flex items-center pl-4">
              <Cpu className="w-5 h-5 text-magenta-500 animate-pulse drop-shadow-[0_0_8px_rgba(255,0,236,0.5)]" />
            </div>
            <form onSubmit={(e) => { e.preventDefault(); handleAnalysis(searchQuery); }} className="w-full">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ENTER CONTRACT OR TICKER (e.g., PEPE, 0x...)"
                className="w-full bg-transparent py-4 pl-12 pr-16 text-cyan-50 focus:outline-none font-mono tracking-widest text-sm placeholder:text-zinc-600"
              />
              <button
                type="submit"
                disabled={loading}
                className="absolute inset-y-1 right-1 px-6 bg-gradient-to-r from-cyan-600 to-blue-700 hover:from-cyan-500 hover:to-blue-600 text-white rounded-full font-bold text-xs transition-all disabled:opacity-50"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'EXECUTE'}
              </button>
            </form>
          </div>

          {/* DYNAMIC MIDDLE CONTENT */}
          <div className="flex-1 flex flex-col gap-4 min-h-0">
            <div className="flex-[1.5] min-h-0">
              <AIAnalysisWidget data={data} loading={loading} />
            </div>
            <div className="flex-1 min-h-0">
              <SecurityWidget data={data} loading={loading} />
            </div>
          </div>
        </div>

        {/* ================= RIGHT COLUMN: THE EXECUTION ================= */}
        <div className="col-span-1 lg:col-span-3 flex flex-col gap-4 min-h-0 h-full">
          <div className="flex-[1] min-h-0">
            <SodexPortfolioWidget />
          </div>
          <div className="flex-[1.5] min-h-0">
            <SodexTerminalWidget targetAsset={data} />
          </div>
        </div>

      </div>
    </main>
  );
}
