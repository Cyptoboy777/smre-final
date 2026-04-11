"use client";

import { useDeferredValue, useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import WidgetWrapper from "../WidgetWrapper";
import { FEATURE_FLAGS } from "@/config/feature-flags";
import { useQuantIntelligence } from "@/hooks/swr/useQuantIntelligence";

function useTypingPrompt(label: string) {
  const [frame, setFrame] = useState(0);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setFrame((current) => (current + 1) % 4);
    }, 280);

    return () => window.clearInterval(intervalId);
  }, []);

  return `${label}${'.'.repeat(frame)}`;
}

function ConvictionCircle({ score }: { score: number }) {
  const circumference = 2 * Math.PI * 88;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="relative w-48 h-48 mx-auto mb-8">
      <svg className="w-full h-full transform -rotate-90">
        <circle 
          className="text-[#22262b]" 
          cx="96" cy="96" fill="transparent" r="88" 
          stroke="currentColor" strokeWidth="12" 
        />
        <circle 
          className="text-[#ccff00]" 
          cx="96" cy="96" fill="transparent" r="88" 
          stroke="currentColor" strokeDasharray={circumference} 
          strokeDashoffset={offset} strokeWidth="12"
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 1s ease-in-out' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <span className="font-heading text-5xl font-bold text-[#f8f9fe]">
          {score}<span className="text-xl text-[#a9abaf]">/100</span>
        </span>
        <span className="font-sans text-[10px] font-black uppercase tracking-widest text-[#ccff00] mt-1">
          {score > 80 ? 'Strong conviction' : score > 50 ? 'Neutral/Bullish' : 'Uncertain'}
        </span>
      </div>
    </div>
  );
}

export function QuantIntelligence() {
  const loadingLabel = useTypingPrompt("NEURAL_SYNC_IN_PROGRESS");
  const { data, error, isLoading } = useQuantIntelligence({
    enabled: FEATURE_FLAGS.enableGroqRoutes,
  });

  const snapshot = data && data.success ? data : null;
  const deferredSnapshot = useDeferredValue(snapshot);
  const analysisText = deferredSnapshot?.analysis ?? "";
  
  // Normalized score for the circle (rating is usually 0-10)
  const circularScore = deferredSnapshot ? Math.round(parseFloat(deferredSnapshot.sosoRating || "0") * 10) : 0;

  return (
    <WidgetWrapper
      title="NEURAL ANALYSIS ENGINE"
      icon={<span className="material-symbols-outlined text-[#d277ff] text-base" style={{ fontVariationSettings: "'FILL' 1" }}>psychology</span>}
      loading={isLoading && !deferredSnapshot}
    >
      <div className="flex h-full flex-col overflow-hidden">
        {isLoading && !deferredSnapshot ? (
          <div className="flex flex-1 flex-col items-center justify-center p-8 text-center">
            <div className="w-16 h-16 border-2 border-[#ccff00]/20 border-t-[#ccff00] rounded-full animate-spin mb-4" />
            <p className="text-[10px] font-mono uppercase tracking-[0.25em] text-[#ccff00]">
              {loadingLabel}
            </p>
          </div>
        ) : error ? (
          <div className="flex flex-1 flex-col justify-center rounded-lg border border-red-500/15 bg-red-500/5 p-6">
            <span className="text-[10px] font-mono uppercase tracking-widest text-red-400 mb-2">Neural Link Failure</span>
            <p className="text-sm text-red-200">{error.message}</p>
          </div>
        ) : !deferredSnapshot ? (
          <div className="flex flex-1 flex-col items-center justify-center text-center opacity-40 p-8 border border-white/5 bg-black/20 rounded-lg">
            <span className="material-symbols-outlined text-[#ccff00] text-5xl mb-4 animate-pulse">monitoring</span>
            <p className="text-[10px] font-mono uppercase tracking-[0.24em] text-[#a9abaf]">
              WAITING FOR SEED CONTEXT
            </p>
          </div>
        ) : (
          <div className="flex flex-1 flex-col gap-6 overflow-hidden">
            {/* Header / Meta */}
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
               <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#d277ff]">Neural Report</span>
                    <span className="w-1 h-1 rounded-full bg-[#d277ff] animate-pulse" />
                  </div>
                  <h3 className="font-heading text-2xl font-bold tracking-tight">
                    {deferredSnapshot.type === 'wallet'
                       ? `Wallet Analysis: ${deferredSnapshot.address?.slice(0, 6)}...${deferredSnapshot.address?.slice(-4)}`
                       : `Token Deep Dive: ${deferredSnapshot.symbol || '---'}`}
                  </h3>
               </div>
               <div className="text-right">
                  <span className="text-[9px] font-mono uppercase text-[#a9abaf]">Source: Institutional Llama-3</span>
               </div>
            </header>

            {/* Bento Grid Content */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 overflow-hidden">
               {/* Conviction Sidebar */}
               <div className="lg:col-span-4 bg-[#161a1e] p-6 rounded-lg border border-white/5 flex flex-col items-center justify-center shrink-0">
                  <ConvictionCircle score={circularScore} />
                  <div className="w-full space-y-3 pt-4 border-t border-white/5">
                     <div className="flex justify-between items-center text-[10px] uppercase font-bold tracking-widest text-[#a9abaf]">
                        <span>Verified</span>
                        <span className={deferredSnapshot.isSodexVerified ? "text-[#ccff00]" : "text-red-400"}>
                          {deferredSnapshot.isSodexVerified ? "YES" : "NO"}
                        </span>
                     </div>
                     <div className="flex justify-between items-center text-[10px] uppercase font-bold tracking-widest text-[#a9abaf]">
                        <span>Confidence</span>
                        <span className="text-[#00eefc]">94%</span>
                     </div>
                  </div>
               </div>

               {/* Analysis Report */}
               <div className="lg:col-span-8 bg-[#0b0e11] border border-white/5 rounded-lg flex flex-col overflow-hidden relative">
                  <div className="bg-[#1c2024] px-4 py-2 border-b border-white/5 flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-widest text-[#a9abaf]">Analysis Report</span>
                    <span className="font-mono text-[9px] text-[#ccff00]">#SYNC-882-AI</span>
                  </div>
                  
                  <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
                    <div className="prose prose-invert prose-sm max-w-none">
                      <ReactMarkdown
                        components={{
                          h1: ({ node, ...props }) => (
                            <h1 className="mb-4 text-xl font-heading font-bold text-[#f3ffca]" {...props} />
                          ),
                          h2: ({ node, ...props }) => (
                            <h2 className="mt-8 mb-4 flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-[#ccff00] border-b border-[#ccff00]/20 pb-2" {...props} />
                          ),
                          p: ({ node, ...props }) => (
                            <p className="mb-4 text-sm leading-relaxed text-[#a9abaf]" {...props} />
                          ),
                          strong: ({ node, ...props }) => (
                            <strong className="font-bold text-[#f8f9fe]" {...props} />
                          ),
                          li: ({ node, ...props }) => (
                            <li className="text-sm text-[#a9abaf] mb-1" {...props} />
                          ),
                          blockquote: ({ node, ...props }) => (
                            <blockquote className="border-l-2 border-[#d277ff] pl-4 italic text-[#d277ff]/80 my-4" {...props} />
                          ),
                        }}
                      >
                        {analysisText}
                      </ReactMarkdown>
                    </div>
                  </div>
                  
                  {/* Decorative Footer */}
                  <div className="absolute bottom-0 w-full h-1 bg-[#ccff00]/10 overflow-hidden">
                    <div className="h-full bg-[#ccff00] w-1/3 shimmer-anim" />
                  </div>
               </div>
            </div>
          </div>
        )}
      </div>
    </WidgetWrapper>
  );
}

