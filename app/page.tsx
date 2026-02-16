'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import SmartSearch from '@/components/SmartSearch';
import AIInsight from '@/components/AIInsight';
import MarketPulse from '@/components/MarketPulse';
import SecurityRadar from '@/components/SecurityRadar';
import { Activity, Wallet, ShieldCheck, DollarSign } from 'lucide-react';

export default function Home() {
  const [data, setData] = useState<any>(null);

  return (
    <main className="min-h-screen bg-black text-white p-4 md:p-8 relative overflow-hidden">
      {/* Background Ambience */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-yellow-900/20 via-black to-black pointer-events-none" />

      {/* Header */}
      <header className="relative z-10 flex justify-between items-center mb-8 border-b border-white/10 pb-4">
        <h1 className="text-3xl font-heading font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-600">
          SMRE <span className="text-sm font-mono text-zinc-500 ml-2">v2.0 // SMART MONEY RESEARCH ENGINE</span>
        </h1>
        <div className="flex gap-4 text-xs font-mono text-zinc-500">
          <span className="flex items-center"><div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse" /> SYSTEM ONLINE</span>
          <span>ETH MAINNET</span>
        </div>
      </header>

      {/* Core Search */}
      <SmartSearch onResult={setData} />

      {/* Main Content Area */}
      <div className="relative z-10 max-w-7xl mx-auto">

        {/* If no data, show Market Pulse */}
        {!data && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <MarketPulse />
          </motion.div>
        )}

        {/* Analysis Results */}
        {data && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8"
          >
            {/* Left Column: AI & Info */}
            <div className="lg:col-span-2 space-y-6">

              {/* Asset Header */}
              <div className="bg-zinc-900/50 border border-zinc-800 p-6 rounded-xl flex items-center justify-between">
                <div>
                  <h2 className="text-4xl font-heading font-bold text-white mb-1">
                    {data.type === 'token' ? `$${data.symbol}` : 'WALLET'}
                  </h2>
                  <p className="text-zinc-500 font-mono text-sm">
                    {data.type === 'token' ? data.name : data.address}
                  </p>
                </div>
                {data.type === 'token' && (
                  <div className="text-right">
                    <p className="text-2xl font-mono font-bold text-yellow-400">{data.price}</p>
                    <p className={`text-sm font-bold ${data.change?.includes('-') ? 'text-red-500' : 'text-green-500'}`}>
                      {data.change} (24h)
                    </p>
                  </div>
                )}
              </div>

              {/* God Mode AI Insight */}
              <AIInsight data={data} />

              {/* Extra Data Details */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-zinc-900/30 p-4 rounded-lg border border-zinc-800">
                  <h4 className="text-zinc-500 text-xs font-bold mb-1 flex items-center"><Activity className="w-3 h-3 mr-1" /> LIQUIDITY / VALUE</h4>
                  <p className="font-mono text-xl">{data.liquidity || (data.holdings ? data.holdings[0].value : 'N/A')}</p>
                </div>
                <div className="bg-zinc-900/30 p-4 rounded-lg border border-zinc-800">
                  <h4 className="text-zinc-500 text-xs font-bold mb-1 flex items-center"><ShieldCheck className="w-3 h-3 mr-1" /> {data.type === 'token' ? 'SMRE RATING' : 'IDENTITY'}</h4>
                  <p className="font-mono text-xl text-green-400">
                    {data.type === 'token' ? `${data.smreRating}/5.0` : data.identity}
                  </p>
                </div>
              </div>

            </div>

            {/* Right Column: Security Radar & Risk */}
            <div className="space-y-6">
              <SecurityRadar data={data} />

              {data.type === 'wallet' && data.holdings && (
                <div className="bg-zinc-900/50 border border-zinc-800 p-4 rounded-xl">
                  <h3 className="text-yellow-500 font-heading tracking-widest mb-4 flex items-center">
                    <Wallet className="w-5 h-5 mr-2" /> PORTFOLIO
                  </h3>
                  <div className="space-y-2">
                    {data.holdings.map((h: any, i: number) => (
                      <div key={i} className="flex justify-between text-xs font-mono border-b border-zinc-800 pb-1">
                        <span className="text-zinc-400">{h.symbol} ({h.balance})</span>
                        <span className="text-zinc-200">{h.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

          </motion.div>
        )}

      </div>
    </main>
  );
}
