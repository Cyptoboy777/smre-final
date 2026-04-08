'use client';

import { useDeferredValue } from 'react';
import { Bot, Sparkles, Shield } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import WidgetWrapper from '../WidgetWrapper';
import type { AnalyzeRouteResponse, ApiSuccessPayload } from '@/lib/api';

interface IntelligenceWidgetProps {
    data: ApiSuccessPayload<AnalyzeRouteResponse> | null;
    loading: boolean;
    error: string | null;
}

function AnalysisSkeleton() {
    return (
        <div className="flex-1 flex flex-col gap-4 animate-pulse">
            <div className="rounded-xl border border-primary/15 bg-primary/5 p-4">
                <div className="h-2 w-24 rounded-full bg-primary/20" />
                <div className="mt-3 h-6 w-2/3 rounded-full bg-white/10" />
                <div className="mt-3 flex items-end justify-between gap-3">
                    <div className="h-3 w-28 rounded-full bg-white/10" />
                    <div className="h-8 w-20 rounded-full bg-primary/20" />
                </div>
            </div>
            <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
                <div className="h-2 w-40 rounded-full bg-primary/20" />
                <div className="mt-4 space-y-3">
                    <div className="h-3 w-full rounded-full bg-white/10" />
                    <div className="h-3 w-11/12 rounded-full bg-white/10" />
                    <div className="h-3 w-5/6 rounded-full bg-white/10" />
                    <div className="h-3 w-full rounded-full bg-white/10" />
                    <div className="h-3 w-4/6 rounded-full bg-white/10" />
                </div>
            </div>
            <div className="h-9 w-40 rounded-lg bg-accent/10" />
        </div>
    );
}

export default function IntelligenceWidget({ data, loading, error }: IntelligenceWidgetProps) {
    const deferredData = useDeferredValue(data);
    const analysisText = deferredData?.analysis || '';

    return (
        <WidgetWrapper
            title="QUANT INTELLIGENCE"
            icon={<Bot className="w-3 h-3 text-primary" />}
            loading={loading}
            error={error}
        >
            <div className="flex flex-col h-full overflow-hidden">
                {loading && !data ? (
                    <AnalysisSkeleton />
                ) : !deferredData && !loading && !error ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-center opacity-30 grayscale p-10">
                        <Sparkles className="w-10 h-10 mb-4 animate-pulse" />
                        <p className="text-[10px] font-mono tracking-widest uppercase">&gt; Awaiting market trigger...</p>
                    </div>
                ) : (
                    <div className="flex-1 flex flex-col gap-4 overflow-hidden">
                        {deferredData && (
                            <div className="flex items-center justify-between p-3 rounded-xl bg-primary/5 border border-primary/20 shrink-0">
                                <div className="flex flex-col">
                                    <span className="text-[8px] font-mono text-primary/50 uppercase tracking-widest leading-none mb-1">
                                        TARGET_IDENTITY
                                    </span>
                                    <h4 className="text-sm font-bold text-white uppercase tracking-tight">
                                        {deferredData.type === 'wallet'
                                            ? deferredData.address
                                            : `${deferredData.name} (${deferredData.symbol})`}
                                    </h4>
                                </div>
                                <div className="text-right">
                                    <span className="text-[8px] font-mono text-primary/50 uppercase tracking-widest leading-none mb-1">
                                        CONVICTION_SCORE
                                    </span>
                                    <div className="text-xl font-black text-primary font-heading neon-glow-cyan">
                                        {deferredData.sosoRating}
                                        <span className="text-[10px] text-white/30 ml-0.5">/10.0</span>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="relative flex-1 overflow-hidden">
                            {loading && (
                                <div className="pointer-events-none absolute inset-0 z-10 rounded-xl border border-white/5 bg-black/35 backdrop-blur-sm">
                                    <div className="h-full animate-pulse p-4">
                                        <div className="h-2 w-32 rounded-full bg-primary/20" />
                                        <div className="mt-4 space-y-3">
                                            <div className="h-3 w-full rounded-full bg-white/10" />
                                            <div className="h-3 w-10/12 rounded-full bg-white/10" />
                                            <div className="h-3 w-11/12 rounded-full bg-white/10" />
                                            <div className="h-3 w-8/12 rounded-full bg-white/10" />
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="h-full overflow-y-auto custom-scrollbar pr-4 pb-10">
                                <div className="prose prose-invert prose-xs max-w-none font-mono text-white/70 leading-relaxed">
                                    <ReactMarkdown
                                        components={{
                                            h2: ({ node, ...props }) => (
                                                <h2
                                                    className="text-[10px] font-bold text-primary uppercase tracking-[0.2em] mt-6 mb-2 flex items-center gap-2"
                                                    {...props}
                                                />
                                            ),
                                            strong: ({ node, ...props }) => (
                                                <strong className="text-white font-black neon-glow-cyan" {...props} />
                                            ),
                                            p: ({ node, ...props }) => <p className="mb-4 text-xs lg:text-sm" {...props} />,
                                            ul: ({ node, ...props }) => (
                                                <ul className="list-disc list-outside ml-4 mb-4 text-white/50" {...props} />
                                            ),
                                        }}
                                    >
                                        {analysisText}
                                    </ReactMarkdown>

                                    {!analysisText && !loading && (
                                        <p className="text-xs text-white/40">No analysis payload returned.</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {deferredData?.isSodexVerified && (
                            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-accent/10 border border-accent/20 w-fit shrink-0">
                                <Shield className="w-3 h-3 text-accent" />
                                <span className="text-[8px] font-bold text-accent uppercase tracking-widest font-mono">
                                    SoDEX MAINNET VERIFIED SOURCE
                                </span>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </WidgetWrapper>
    );
}
