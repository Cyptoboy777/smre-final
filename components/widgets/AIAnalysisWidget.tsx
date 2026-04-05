'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Bot, Sparkles } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import WidgetWrapper from './WidgetWrapper';

interface AIAnalysisWidgetProps {
    data: any | null;
    loading: boolean;
}

export default function AIAnalysisWidget({ data, loading }: AIAnalysisWidgetProps) {
    const [displayedText, setDisplayedText] = useState('');

    // Derive insight
    const insight = data
        ? data.analysis ||
        (data.type === 'wallet'
            ? `ANALYSIS COMPLETE. Identity: ${data.identity}. Security Status: ${data.security?.status_text || 'Unknown'
            }. Recommended Action: ${data.security?.isSafe ? 'MONITOR' : 'BLOCK/IGNORE'}.`
            : `MARKET SCAN COMPLETE. Sentiment: ${data.sentiment}. SMRE Score: ${data.smreRating
            }/5.0. Trend: ${data.change?.includes('-') ? 'DOWNTREND' : 'UPTREND'}.`)
        : '';

    useEffect(() => {
        let index = 0;
        setDisplayedText('');

        if (!insight) return;

        const intervalId = setInterval(() => {
            setDisplayedText((prev) => prev + insight.charAt(index));
            index++;
            if (index === insight.length) {
                clearInterval(intervalId);
            }
        }, 5);

        return () => clearInterval(intervalId);
    }, [insight]);

    return (
        <WidgetWrapper
            title={`AI ANALYSIS DEEP DIVE`}
            icon={<Bot className="w-4 h-4 text-cyan-400 drop-shadow-[0_0_5px_rgba(0,243,255,0.8)]" />}
            loading={loading}
            className="h-[400px] border-cyan-500/20 shadow-[0_0_20px_rgba(0,243,255,0.05)]"
        >
            {!data && !loading ? (
                <div className="flex flex-col items-center justify-center h-full text-zinc-500 font-mono text-sm">
                    <Sparkles className="w-8 h-8 mb-4 opacity-50" />
                    <p>AWAITING COMMAND INPUT...</p>
                </div>
            ) : (
                <div className="font-mono text-cyan-50 leading-relaxed text-sm h-full flex flex-col">
                    <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                        {/* Context Header */}
                        {data && (
                            <div className="mb-4 pb-4 border-b border-cyan-500/20 flex flex-col gap-2">
                                <div className="flex justify-between items-center">
                                    <span className="text-xs text-cyan-500/60 font-bold uppercase tracking-widest">
                                        Target: {data.type === 'token' ? data.symbol : 'Wallet'} // Model: Groq AI
                                    </span>
                                    {data.type === 'token' && (
                                        <div className="text-right">
                                            <span className="text-sm font-bold text-white mr-2">{data.price}</span>
                                            <span className={`text-[10px] ${data.change?.includes('-') ? 'text-red-400' : 'text-green-400'}`}>
                                                {data.change} (24h)
                                            </span>
                                        </div>
                                    )}
                                </div>
                                {data.liquidity && (
                                    <div className="text-[10px] text-zinc-500 uppercase tracking-widest">
                                        Liquidity / Vol: <span className="text-zinc-300">{data.liquidity}</span>
                                    </div>
                                )}
                            </div>
                        )}

                        <ReactMarkdown
                            components={{
                                strong: ({ node, ...props }) => (
                                    <span className="text-cyan-400 font-bold drop-shadow-[0_0_2px_rgba(0,243,255,0.4)]" {...props} />
                                ),
                                ul: ({ node, ...props }) => (
                                    <ul className="list-disc list-inside my-2 space-y-1 text-zinc-400" {...props} />
                                ),
                                li: ({ node, ...props }) => <li className="ml-2" {...props} />,
                                p: ({ node, ...props }) => <p className="mb-2 last:mb-0" {...props} />,
                            }}
                        >
                            {displayedText}
                        </ReactMarkdown>

                        {(loading || (insight && displayedText.length < insight.length)) && (
                            <motion.span
                                animate={{ opacity: [0, 1, 0] }}
                                transition={{ repeat: Infinity, duration: 0.8 }}
                                className="inline-block w-2.5 h-4 bg-cyan-400 ml-1 align-middle shadow-[0_0_8px_rgba(0,243,255,0.8)]"
                            />
                        )}
                    </div>
                </div>
            )}
        </WidgetWrapper>
    );
}
