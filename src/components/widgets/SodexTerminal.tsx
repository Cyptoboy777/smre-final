"use client";

import { useState } from "react";
import WidgetWrapper from "../WidgetWrapper";
import { type SodexOrder } from "@/lib/crypto-dashboard";
import { useSodexWebSocket } from "@/hooks/useSodexWebSocket";
import { useApiMutation } from "@/hooks/useApiMutation";
import { useApiQuery } from "@/hooks/useApiQuery";
import { fetchApi } from "@/lib/client/api-client";
import { type ApiSuccessPayload, type MarketRouteResponse, type OrdersRouteResponse, type TradeRouteResponse } from "@/lib/api";

interface SodexTerminalProps {
  target: { symbol?: string } | null;
}

export default function SodexTerminal({ target }: SodexTerminalProps) {
  const [amount, setAmount] = useState("0.010000");
  const [validationError, setValidationError] = useState<string | null>(null);

  const asset = target?.symbol
    ? String(target.symbol).includes("-")
      ? String(target.symbol)
      : `${String(target.symbol).toUpperCase()}-USD`
    : "BTC-USD";

  const {
    data: ordersData,
    loading: loadingOrders,
    reload: reloadOrders,
  } = useApiQuery<SodexOrder[]>({
    deps: [asset],
    request: async (signal) => {
      const params = new URLSearchParams({
        market: "perps",
        symbol: asset,
        limit: "8",
      });
      const response = await fetchApi<ApiSuccessPayload<OrdersRouteResponse>>(
        `/api/sodex/orders?${params.toString()}`,
        { signal }
      );
      return response.orders || [];
    },
  });

  const { data: price, setData: setPrice } = useApiQuery<string | null>({
    deps: [asset],
    refreshIntervalMs: 15000,
    request: async (signal) => {
      const params = new URLSearchParams({ market: "perps", symbol: asset });
      const response = await fetchApi<ApiSuccessPayload<MarketRouteResponse>>(
        `/api/sodex/market?${params.toString()}`,
        { signal }
      );
      const marketEntry = Array.isArray(response.items) ? response.items[0] : null;
      return marketEntry?.price ? String(marketEntry.price).replace(/,/g, "") : null;
    },
  });

  const {
    loading: executing,
    mutate: executeTrade,
  } = useApiMutation<ApiSuccessPayload<TradeRouteResponse>, { direction: "LONG" | "SHORT"; amount: number }>({
    request: async (variables, signal) =>
      fetchApi<ApiSuccessPayload<TradeRouteResponse>>("/api/trade", {
        method: "POST",
        signal,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          symbol: asset,
          amount: variables.amount,
          direction: variables.direction,
        }),
      }),
  });

  const orders = ordersData || [];

  const { status: wsStatus } = useSodexWebSocket<any>({
    url: "wss://mainnet-gw.sodex.dev/ws/perps",
    subscribeMessages: [{ op: "subscribe", params: { channel: "allBookTicker" } }],
    onMessage: (message) => {
      if (message.channel === "allBookTicker" && Array.isArray(message.data)) {
        const update = message.data.find((entry: any) => entry.s === asset);
        if (update) {
          const ask = Number(update.a);
          const bid = Number(update.b);
          setPrice(((ask + bid) / 2).toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          }));
        }
      }
    },
  });

  const handleTrade = async (direction: "LONG" | "SHORT") => {
    if (!amount || Number(amount) <= 0) {
      setValidationError("POS_SIZE_ERR");
      return;
    }
    setValidationError(null);
    await executeTrade({ direction, amount: Number(amount) });
    await reloadOrders();
  };

  return (
    <WidgetWrapper 
      title="NEON TERMINAL" 
      icon={<span className="material-symbols-outlined text-[#ccff00] text-base">terminal</span>} 
      loading={executing}
    >
      <div className="flex flex-col h-full gap-6">
        {/* Institutional Price Header */}
        <div className="p-4 bg-surface-container-high rounded-lg border border-white/5 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#ccff00]/5 blur-[40px] rounded-full group-hover:bg-[#ccff00]/10 transition-colors" />
          
          <div className="flex justify-between items-start mb-4 relative z-10">
            <div>
               <div className="flex items-center gap-2 mb-1">
                 <span className="w-1.5 h-1.5 rounded-full bg-[#ccff00] animate-pulse" />
                 <span className="text-[10px] font-mono text-[#ccff00] uppercase tracking-widest">{wsStatus} Feed</span>
               </div>
               <h2 className="text-3xl font-heading font-bold tracking-tighter text-[#ccff00] uppercase glow-text-primary">
                 {asset}
               </h2>
            </div>
            <div className="text-right">
               <span className="text-[10px] text-[#a9abaf] uppercase font-bold tracking-widest block mb-1">Mark Price</span>
               <span className="text-3xl font-heading font-black text-[#f8f9fe]">${price || "---"}</span>
            </div>
          </div>
          
          {/* Progress Bar for Poll Sync */}
          <div className="h-[1px] w-full bg-white/5 absolute bottom-0 left-0">
             <div className="h-full bg-[#ccff00]/40 shimmer-anim w-1/3" />
          </div>
        </div>

        {/* Trade Configuration */}
        <div className="space-y-4">
           <div>
              <div className="flex justify-between items-center mb-2">
                 <span className="text-[10px] uppercase font-black tracking-widest text-[#a9abaf]">Position Size</span>
                 <span className="text-[9px] font-mono text-[#ccff00] uppercase">Max Leverage Active</span>
              </div>
              <div className="relative group">
                 <input 
                   type="number"
                   value={amount}
                   onChange={(e) => setAmount(e.target.value)}
                   className="w-full bg-[#0b0e11] border border-white/10 group-hover:border-[#ccff00]/30 focus:border-[#ccff00] rounded-lg py-4 px-6 font-mono text-sm text-[#f8f9fe] transition-all outline-none"
                   placeholder="0.000000"
                 />
                 <span className="absolute right-6 top-1/2 -translate-y-1/2 text-[10px] font-bold text-[#a9abaf] uppercase tracking-widest">UNIT</span>
              </div>
           </div>
        </div>

        {/* Execution Grid */}
        <div className="grid grid-cols-2 gap-4">
           <button 
             onClick={() => handleTrade("LONG")}
             disabled={executing}
             className="relative overflow-hidden group py-6 rounded-lg bg-[#ccff00]/10 border border-[#ccff00]/30 hover:bg-[#ccff00]/20 transition-all active:scale-[0.98] disabled:opacity-50"
           >
              <div className="relative z-10 flex flex-col items-center gap-1">
                 <span className="material-symbols-outlined text-[#ccff00] text-3xl">trending_up</span>
                 <span className="font-heading font-black text-[12px] uppercase tracking-[0.3em] text-[#ccff00]">Execute Long</span>
              </div>
           </button>
           <button 
             onClick={() => handleTrade("SHORT")}
             disabled={executing}
             className="relative overflow-hidden group py-6 rounded-lg bg-red-500/10 border border-red-500/30 hover:bg-red-500/20 transition-all active:scale-[0.98] disabled:opacity-50"
           >
              <div className="relative z-10 flex flex-col items-center gap-1">
                 <span className="material-symbols-outlined text-red-400 text-3xl">trending_down</span>
                 <span className="font-heading font-black text-[12px] uppercase tracking-[0.3em] text-red-400">Execute Short</span>
              </div>
           </button>
        </div>

        {/* Execution Log */}
        <div className="flex-1 flex flex-col min-h-0 bg-black/20 rounded-lg border border-white/5 overflow-hidden">
           <div className="px-4 py-2 border-b border-white/5 bg-[#1c2024] flex justify-between items-center">
              <span className="text-[10px] font-black uppercase tracking-widest text-[#a9abaf]">Execution History</span>
              <span className="material-symbols-outlined text-[#a9abaf] text-sm">history</span>
           </div>
           
           <div className="p-2 overflow-y-auto custom-scrollbar flex-1 space-y-2">
              {orders.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center opacity-20">
                   <span className="material-symbols-outlined text-4xl mb-2">database</span>
                   <span className="text-[9px] font-mono uppercase tracking-[0.3em]">No Buffer Data</span>
                </div>
              ) : (
                orders.map((o, i) => (
                   <div key={i} className="flex justify-between items-center p-3 bg-white/[0.02] border border-white/5 rounded group hover:border-[#ccff00]/20 transition-all">
                      <div className="flex flex-col">
                         <span className={`text-[10px] font-bold uppercase ${o.side === 'BUY' ? 'text-[#ccff00]' : 'text-red-400'}`}>
                           {o.side === 'BUY' ? 'LIMIT_BUY' : 'LIMIT_SELL'}
                         </span>
                         <span className="text-[9px] font-mono text-[#a9abaf]">{o.symbol} @ {o.price || 'MARKET'}</span>
                      </div>
                      <div className="flex flex-col items-end">
                         <div className="flex items-center gap-1 px-2 py-0.5 bg-[#ccff00]/10 border border-[#ccff00]/20 rounded">
                            <span className="material-symbols-outlined text-[10px] text-[#ccff00]" style={{ fontVariationSettings: "'FILL' 1" }}>verified_user</span>
                            <span className="text-[8px] font-mono text-[#ccff00] uppercase font-bold">{o.status}</span>
                         </div>
                      </div>
                   </div>
                ))
              )}
           </div>
        </div>

        {/* Secure Transaction Info */}
        <div className="p-3 border-t border-white/5 rounded-b-lg flex items-center justify-between">
           <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#ccff00] text-sm animate-spin">sync</span>
              <span className="text-[8px] font-mono text-[#a9abaf] uppercase tracking-[0.2em]">EIP-712 Secure Signing Active</span>
           </div>
           {validationError && (
             <span className="text-[9px] font-mono text-red-400 uppercase font-black">{validationError}</span>
           )}
        </div>
      </div>
    </WidgetWrapper>
  );
}

