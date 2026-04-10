"use client";

import { useDeferredValue, useEffect, useState } from "react";
import { Bot, Shield, Sparkles, Target } from "lucide-react";
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

function QuantLoadingState({ label }: { label: string }) {
  return (
    <div className="flex flex-1 flex-col gap-4 animate-pulse">
      <div className="rounded-xl border border-primary/15 bg-primary/5 p-4">
        <div className="text-[10px] font-mono uppercase tracking-[0.25em] text-primary/65">{label}</div>
        <div className="mt-3 h-6 w-2/3 rounded-full bg-white/10" />
        <div className="mt-3 flex items-end justify-between gap-3">
          <div className="h-3 w-32 rounded-full bg-white/10" />
          <div className="h-8 w-24 rounded-full bg-primary/20" />
        </div>
      </div>
      <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
        <div className="h-2 w-40 rounded-full bg-primary/20" />
        <div className="mt-4 space-y-3">
          <div className="h-3 w-full rounded-full bg-white/10" />
          <div className="h-3 w-11/12 rounded-full bg-white/10" />
          <div className="h-3 w-5/6 rounded-full bg-white/10" />
          <div className="h-3 w-full rounded-full bg-white/10" />
        </div>
      </div>
    </div>
  );
}

export function QuantIntelligence() {
  const loadingLabel = useTypingPrompt("AWAITING QUANT COMPUTATION");
  const { data, error, isLoading, isValidating } = useQuantIntelligence({
    enabled: FEATURE_FLAGS.enableGroqRoutes,
  });

  const snapshot = data && data.success ? data : null;
  const deferredSnapshot = useDeferredValue(snapshot);
  const analysisText = deferredSnapshot?.analysis ?? "";

  return (
    <WidgetWrapper
      title="QUANT INTELLIGENCE"
      icon={<Bot className="w-3 h-3 text-primary" />}
      loading={isLoading && !deferredSnapshot}
    >
      <div className="flex h-full flex-col overflow-hidden">
        {!FEATURE_FLAGS.enableGroqRoutes ? (
          <div className="flex flex-1 flex-col items-center justify-center text-center opacity-60 p-8">
            <Sparkles className="mb-4 h-10 w-10 animate-pulse text-primary" />
            <p className="text-[10px] font-mono uppercase tracking-[0.24em] text-white/65">
              QUANT ENGINE STANDBY
            </p>
            <p className="mt-3 max-w-md text-sm leading-6 text-white/45">
              Groq inference remains server-only. Enable the production route to stream institutional analysis here.
            </p>
          </div>
        ) : isLoading && !deferredSnapshot ? (
          <QuantLoadingState label={loadingLabel} />
        ) : error ? (
          <div className="flex flex-1 flex-col justify-center rounded-xl border border-red-400/15 bg-red-400/5 p-6">
            <p className="text-[10px] font-mono uppercase tracking-[0.24em] text-red-200/70">
              QUANT UPLINK DEGRADED
            </p>
            <p className="mt-3 text-sm font-semibold text-red-100">
              {error.message}
            </p>
          </div>
        ) : !deferredSnapshot ? (
          <div className="flex flex-1 flex-col items-center justify-center text-center opacity-40 p-8">
            <Target className="mb-4 h-10 w-10 animate-pulse text-primary" />
            <p className="text-[10px] font-mono uppercase tracking-[0.24em] text-white/65">
              AWAITING MARKET CONTEXT
            </p>
          </div>
        ) : (
          <div className="flex flex-1 flex-col gap-4 overflow-hidden">
            <div className="rounded-xl border border-primary/20 bg-primary/5 p-3 shrink-0">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-col">
                  <span className="text-[8px] font-mono uppercase tracking-[0.24em] text-primary/60">
                    TARGET_IDENTITY
                  </span>
                  <h4 className="mt-1 text-sm font-bold uppercase tracking-tight text-white">
                    {deferredSnapshot.type === 'wallet'
                      ? deferredSnapshot.address
                      : `${deferredSnapshot.name} (${deferredSnapshot.symbol})`}
                  </h4>
                </div>
                <div className="text-right">
                  <span className="text-[8px] font-mono uppercase tracking-[0.24em] text-primary/60">
                    CONVICTION_SCORE
                  </span>
                  <div className="text-xl font-black font-heading text-primary neon-glow-cyan">
                    {deferredSnapshot.sosoRating}
                    <span className="ml-1 text-[10px] text-white/35">/10.0</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <div className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-[9px] font-mono uppercase tracking-[0.22em] text-white/65">
                SOURCE: {deferredSnapshot.source}
              </div>
              {deferredSnapshot.isSodexVerified && (
                <div className="inline-flex items-center gap-1.5 rounded-full border border-accent/20 bg-accent/10 px-3 py-1 text-[9px] font-mono uppercase tracking-[0.22em] text-accent">
                  <Shield className="h-3 w-3" />
                  SODEX VERIFIED
                </div>
              )}
            </div>

            <div className="relative flex-1 overflow-hidden rounded-xl border border-white/5 bg-white/[0.02]">
              {isValidating && (
                <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-10 bg-gradient-to-b from-black/50 to-transparent" />
              )}

              <div className="h-full overflow-y-auto custom-scrollbar px-4 py-4 pb-10">
                <div className="prose prose-invert prose-sm max-w-none text-white/75">
                  <ReactMarkdown
                    components={{
                      h1: ({ node, ...props }) => (
                        <h1 className="mb-4 text-lg font-black uppercase tracking-[0.16em] text-white" {...props} />
                      ),
                      h2: ({ node, ...props }) => (
                        <h2
                          className="mt-6 mb-3 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.22em] text-primary"
                          {...props}
                        />
                      ),
                      h3: ({ node, ...props }) => (
                        <h3 className="mt-5 mb-2 text-sm font-semibold uppercase tracking-[0.16em] text-white" {...props} />
                      ),
                      p: ({ node, ...props }) => (
                        <p className="mb-4 text-sm leading-7 text-white/75" {...props} />
                      ),
                      ul: ({ node, ...props }) => (
                        <ul className="mb-4 list-disc space-y-2 pl-5 text-sm text-white/70" {...props} />
                      ),
                      ol: ({ node, ...props }) => (
                        <ol className="mb-4 list-decimal space-y-2 pl-5 text-sm text-white/70" {...props} />
                      ),
                      li: ({ node, ...props }) => <li className="pl-1" {...props} />,
                      strong: ({ node, ...props }) => (
                        <strong className="font-black text-white neon-glow-cyan" {...props} />
                      ),
                      blockquote: ({ node, ...props }) => (
                        <blockquote className="my-4 border-l-2 border-primary/40 pl-4 italic text-primary/85" {...props} />
                      ),
                      code: ({ inline, node, className, ...props }: { inline?: boolean; node?: unknown; className?: string; children?: React.ReactNode }) =>
                        inline ? (
                          <code className="rounded bg-white/8 px-1.5 py-0.5 font-mono text-[0.9em] text-cyan-100" {...props} />
                        ) : (
                          <code className="block overflow-x-auto rounded-xl border border-white/10 bg-black/30 p-4 font-mono text-xs text-cyan-50" {...props} />
                        ),
                    }}
                  >
                    {analysisText}
                  </ReactMarkdown>

                  {!analysisText && (
                    <p className="text-sm text-white/40">
                      No quant markdown was returned by the server.
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </WidgetWrapper>
  );
}
