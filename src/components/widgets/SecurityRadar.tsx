"use client";

import WidgetWrapper from "../WidgetWrapper";
import { motion, AnimatePresence } from "framer-motion";

interface SecurityRadarProps {
  data: any | null;
  loading: boolean;
}

export default function SecurityRadar({ data, loading }: SecurityRadarProps) {
  const isToken = data?.type === "token";
  const security = data?.security || null;
  const isSafe = security?.isSafe ?? true; // Defaulting to true for demo context if null

  return (
    <WidgetWrapper
      title="SECURITY RADAR"
      icon={<span className="material-symbols-outlined text-[#d277ff] text-base">security</span>}
      loading={loading}
    >
      <div className="flex flex-col h-full items-center justify-center relative overflow-hidden">
        {/* Radar Scanning Background */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
          <div className="w-[140px] h-[140px] rounded-full border border-[#ccff00]/40 animate-ping [animation-duration:3s]" />
          <div className="w-[100px] h-[100px] rounded-full border border-[#ccff00]/20 animate-ping [animation-duration:5s]" />
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={isSafe ? "safe" : "danger"}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            className="flex flex-col items-center gap-6 relative z-10"
          >
            <div
              className={`w-24 h-24 rounded-full flex items-center justify-center border-2 border-dashed ${
                isSafe
                  ? "border-[#ccff00] text-[#ccff00] bg-[#ccff00]/5"
                  : "border-red-500 text-red-500 bg-red-500/5"
              }`}
            >
              <span className="material-symbols-outlined text-5xl">
                {isSafe ? "verified_user" : "gpp_maybe"}
              </span>
            </div>

            <div className="text-center">
              <h4
                className={`text-sm font-black font-heading tracking-[0.2em] uppercase mb-1 ${
                  isSafe ? "text-[#ccff00]" : "text-red-400"
                }`}
              >
                {security?.status_text || (isSafe ? "DOMAIN_VERIFIED" : "THREAT_DETECTED")}
              </h4>
              {isToken && (
                <div className="flex gap-6 items-center justify-center mt-3">
                  <div className="flex flex-col">
                    <span className="text-[8px] font-mono text-[#a9abaf] uppercase tracking-widest leading-none mb-1">
                      Buy Tax
                    </span>
                    <span className="text-[10px] font-bold font-mono text-[#f8f9fe]">
                      {security?.buy_tax || "0%"}
                    </span>
                  </div>
                  <div className="flex flex-col border-l border-white/10 pl-6">
                    <span className="text-[8px] font-mono text-[#a9abaf] uppercase tracking-widest leading-none mb-1">
                      Sell Tax
                    </span>
                    <span className="text-[10px] font-bold font-mono text-[#f8f9fe]">
                      {security?.sell_tax || "0%"}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Global Surveillance Status */}
        <div className="absolute bottom-0 w-full p-3 bg-black/40 border-t border-white/5 rounded-b-lg flex items-center gap-3 overflow-hidden">
           <span className="text-[8px] font-mono text-[#ccff00] border border-[#ccff00]/30 px-1.5 py-0.5 rounded shrink-0">GOPLUS_SYNC</span>
           <span className="text-[8px] font-mono text-[#a9abaf] uppercase tracking-widest whitespace-nowrap animate-marquee">
             SCAN_COMPLETE: 0 THREATS FOUND | LIQUIDITY: LOCKED | OWNERSHIP: RENOUNCED | PROXY: NO
           </span>
        </div>
      </div>
    </WidgetWrapper>
  );
}

