"use client";

import { useEffect, useRef, useState } from "react";
import WidgetWrapper from "../WidgetWrapper";
import { type MarketPulseItem } from "@/lib/crypto-dashboard";
import { useSodexWebSocket } from "@/hooks/useSodexWebSocket";
import { fetchApi } from "@/lib/client/api-client";
import { type ApiSuccessPayload, type MarketRouteResponse } from "@/lib/api";
import { useApiQuery } from "@/hooks/useApiQuery";

const TRACKED_SYMBOLS = ["BTC-USD", "ETH-USD", "SOL-USD"];
const PRICE_FLASH_MS = 700;

const getDisplayPrice = (closePrice?: string) => {
  const price = Number(closePrice);
  return Number.isFinite(price) && price > 0
    ? price.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })
    : null;
};

export default function MarketPulse() {
  const [priceFlashMap, setPriceFlashMap] = useState<Record<string, "up" | "down" | undefined>>({});
  const flashTimeoutRef = useRef<Record<string, number>>({});

  const { data, loading, error, setData } = useApiQuery<MarketPulseItem[]>({
    request: async (signal) => {
      const response = await fetchApi<ApiSuccessPayload<MarketRouteResponse>>(
        "/api/sodex/market?market=perps",
        { signal }
      );
      return Array.isArray(response.items)
        ? response.items.filter((item) => TRACKED_SYMBOLS.includes(item.symbol)).slice(0, 3)
        : [];
    },
  });

  const stream = useSodexWebSocket<any>({
    url: "wss://mainnet-gw.sodex.dev/ws/perps",
    subscribeMessages: [{ op: "subscribe", params: { channel: "allMiniTicker" } }],
    onMessage: (message) => {
      if (message.channel === "allMiniTicker" && Array.isArray(message.data)) {
        setData((current) => {
          const nextCurrent = current || [];
          return nextCurrent.map((item) => {
            const update = message.data!.find((entry: any) => entry.s === item.symbol);
            if (!update) return item;
            return { ...item, price: getDisplayPrice(update.c) || item.price };
          });
        });
      }
    },
  });

  const prices = data || [];

  return (
    <WidgetWrapper
      title="ON-CHAIN RADAR"
      icon={<span className="material-symbols-outlined text-[#ccff00] text-base animate-pulse">radar</span>}
      loading={loading && prices.length === 0}
    >
      <div className="flex flex-col gap-4 h-full relative overflow-hidden">
        {/* Background Scanline decorative overlay */}
        <div className="absolute inset-0 scanline opacity-30 pointer-events-none" />

        <div className="flex items-center justify-between text-[8px] font-mono uppercase tracking-[0.3em] text-[#a9abaf] mb-2">
           <span>Whale Surveillance Protocol</span>
           <span className="flex items-center gap-1.5">
             <span className={`w-1.5 h-1.5 rounded-full ${stream.status === 'open' ? 'bg-[#ccff00]' : 'bg-red-500'} animate-pulse`} />
             {stream.status === 'open' ? 'Feed: Live' : 'Feed: Offline'}
           </span>
        </div>

        {/* Portfolio Balance Prototype side-stats panel style */}
        <div className="grid grid-cols-2 gap-3 mb-2">
           <div className="bg-[#1c2024] p-4 rounded-lg border border-white/5">
              <span className="text-[8px] uppercase font-bold tracking-widest text-[#ccff00] block mb-1">Glob Liquidity</span>
              <span className="text-xl font-heading font-bold text-[#f8f9fe]">4.2 TB/s</span>
           </div>
           <div className="bg-[#1c2024] p-4 rounded-lg border border-white/5">
              <span className="text-[8px] uppercase font-bold tracking-widest text-[#d277ff] block mb-1">Whale Denisty</span>
              <span className="text-xl font-heading font-bold text-[#f8f9fe]">High</span>
           </div>
        </div>

        {/* Tickers */}
        <div className="space-y-3 flex-1 overflow-y-auto custom-scrollbar">
          {prices.map((asset) => (
            <div
              key={asset.symbol}
              className="group bg-[#161a1e] rounded-lg p-4 border border-white/5 hover:bg-[#22262b] transition-all relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-2 opacity-5 scale-150 pointer-events-none">
                 <span className="material-symbols-outlined text-6xl">monitoring</span>
              </div>
              
              <div className="flex justify-between items-center mb-1">
                <span className="text-[10px] font-mono text-[#a9abaf] tracking-[0.2em]">{asset.symbol}</span>
                <span className={`text-[10px] font-mono ${asset.isUp ? 'text-[#ccff00]' : 'text-red-400'}`}>
                  {asset.isUp ? 'SURGING' : 'STABLE'}
                </span>
              </div>

              <div className="flex justify-between items-end">
                <span className="text-2xl font-heading font-bold tracking-tight text-[#f8f9fe] glow-text-primary">
                  ${asset.price}
                </span>
                <div className="flex flex-col items-end">
                   <div className={`text-xs font-mono font-bold ${asset.isUp ? 'text-[#ccff00]' : 'text-red-400'}`}>
                      {asset.isUp ? '▲' : '▼'} {asset.change}
                   </div>
                   <div className="w-16 h-1 bg-white/5 rounded-full mt-1 overflow-hidden">
                      <div className={`h-full ${asset.isUp ? 'bg-[#ccff00]' : 'bg-red-400'} w-2/3 animate-pulse`} />
                   </div>
                </div>
              </div>
            </div>
          ))}
          
          {/* Whale Feed - "Stitched" from portfolio dashboard/radar prototypes */}
          <div className="mt-4 pt-4 border-t border-white/10">
             <div className="flex items-center gap-2 mb-4">
                <span className="material-symbols-outlined text-secondary text-base">visibility</span>
                <h4 className="text-[10px] font-bold uppercase tracking-widest text-[#a9abaf]">Whale Surveillance</h4>
             </div>
             
             <div className="space-y-2">
                <div className="p-3 bg-black/40 border border-white/5 rounded-lg flex justify-between items-center group cursor-pointer hover:border-[#ccff00]/30">
                   <div>
                      <div className="text-[9px] text-[#ccff00] uppercase font-bold mb-1">Transfer Detected</div>
                      <div className="text-xs font-mono text-white">12,000 ETH → Exchange</div>
                   </div>
                   <span className="material-symbols-outlined text-[#a9abaf] group-hover:text-[#ccff00] text-sm">open_in_new</span>
                </div>
                <div className="p-3 bg-black/20 border border-white/5 rounded-lg opacity-50">
                   <div className="text-[9px] text-[#d277ff] uppercase font-bold mb-1">Large Accumulation</div>
                   <div className="text-xs font-mono text-white">500,000 SOL Staked</div>
                </div>
             </div>
          </div>
        </div>
      </div>
    </WidgetWrapper>
  );
}

