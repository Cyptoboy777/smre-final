'use client';

import { useEffect, useState, useRef } from 'react';
import { Bot, Sparkles, Shield } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { motion } from 'framer-motion';
import WidgetWrapper from '../WidgetWrapper';

interface IntelligenceWidgetProps {
    data: any | null;
    loading: boolean;
    error: string | null;
}

export default function IntelligenceWidget({ data, loading, error }: IntelligenceWidgetProps) {
    const [displayedText, setDisplayedText] = useState('');
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!data?.analysis) {
            setDisplayedText('');
            return;
        }

        let index = 0;
        setDisplayedText('');
        const text = data.analysis;

        const interval = setInterval(() => {
            setDisplayedText((prev) => prev + text.charAt(index));
            index++;
            if (index >= text.length) clearInterval(interval);
            
            // Auto-scroll
            if (scrollRef.current) {
                scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
            }
        }, 5); // 5ms typing speed

        return () => clearInterval(interval);
    }, [data?.analysis]);

    return (
        <WidgetWrapper 
            title="QUANT INTELLIGENCE" 
            icon={<Bot className="w-3 h-3 text-primary" />} 
            loading={loading}
            error={error}
        >
            <div className="flex flex-col h-full overflow-hidden">
                {!data && !loading && !error ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-center opacity-30 grayscale p-10">
                        <Sparkles className="w-10 h-10 mb-4 animate-pulse" />
                        <p className="text-[10px] font-mono tracking-widest uppercase">&gt; Awaiting market trigger...</p>
                    </div>
                ) : (
                    <div className="flex-1 flex flex-col gap-4 overflow-hidden">
                        {/* Summary Header */}
                        {data && (
                            <div className="flex items-center justify-between p-3 rounded-xl bg-primary/5 border border-primary/20 shrink-0">
                                <div className="flex flex-col">
                                    <span className="text-[8px] font-mono text-primary/50 uppercase tracking-widest leading-none mb-1">TARGET_IDENTITY</span>
                                    <h4 className="text-sm font-bold text-white uppercase tracking-tight">
                                        {data.type === 'wallet' ? data.address : `${data.name} (${data.symbol})`}
                                    </h4>
                                </div>
                                <div className="text-right">
                                    <span className="text-[8px] font-mono text-primary/50 uppercase tracking-widest leading-none mb-1">CONVICTION_SCORE</span>
                                    <div className="text-xl font-black text-primary font-heading neon-glow-cyan">
                                        {data.sosoRating}<span className="text-[10px] text-white/30 ml-0.5">/10.0</span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Analysis Content */}
                        <div 
                            ref={scrollRef}
                            className="flex-1 overflow-y-auto custom-scrollbar pr-4 pb-10"
                        >
                            <div className="prose prose-invert prose-xs max-w-none font-mono text-white/70 leading-relaxed">
                                <ReactMarkdown
                                    components={{
                                        h2: ({ node, ...props }) => <h2 className="text-[10px] font-bold text-primary uppercase tracking-[0.2em] mt-6 mb-2 flex items-center gap-2" {...props} />,
                                        strong: ({ node, ...props }) => <strong className="text-white font-black neon-glow-cyan" {...props} />,
                                        p: ({ node, ...props }) => <p className="mb-4 text-xs lg:text-sm" {...props} />,
                                        ul: ({ node, ...props }) => <ul className="list-disc list-outside ml-4 mb-4 text-white/50" {...props} />,
                                    }}
                                >
                                    {displayedText}
                                </ReactMarkdown>
                                
                                {displayedText.length < (data?.analysis?.length || 0) && (
                                    <motion.span 
                                        animate={{ opacity: [0, 1, 0] }}
                                        transition={{ repeat: Infinity, duration: 0.8 }}
                                        className="inline-block w-1.5 h-4 bg-primary align-middle ml-1"
                                    />
                                )}
                            </div>
                        </div>

                        {/* Verification Footer */}
                        {data?.isSodexVerified && (
                            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-accent/10 border border-accent/20 w-fit shrink-0">
                                <Shield className="w-3 h-3 text-accent" />
                                <span className="text-[8px] font-bold text-accent uppercase tracking-widest font-mono">SoDEX MAINNET VERIFIED SOURCE</span>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </WidgetWrapper>
    );
}
