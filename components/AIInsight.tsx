'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { Bot, Sparkles } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface AIInsightProps {
    data: any;
}

export default function AIInsight({ data }: AIInsightProps) {
    const [displayedText, setDisplayedText] = useState('');

    // Derive insight from data if raw 'ai_insight' is missing
    const insight = data.analysis || (data.type === 'wallet'
        ? `ANALYSIS COMPLETE. Identity: ${data.identity}. Security Status: ${data.security?.status_text || 'Unknown'}. Recommended Action: ${data.security?.isSafe ? 'MONITOR' : 'BLOCK/IGNORE'}.`
        : `MARKET SCAN COMPLETE. Sentiment: ${data.sentiment}. soso-smre Score: ${data.sosoRating}/5.0. Trend: ${data.change.includes('-') ? 'DOWNTREND' : 'UPTREND'}.`);

    const type = data.type;

    useEffect(() => {
        let index = 0;
        setDisplayedText(''); // Reset on new insight

        if (!insight) return;

        const intervalId = setInterval(() => {
            setDisplayedText((prev) => prev + insight.charAt(index));
            index++;
            if (index === insight.length) {
                clearInterval(intervalId);
            }
        }, 5); // Faster typing speed for long text

        return () => clearInterval(intervalId);
    }, [insight]);

    if (!insight) return null;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative w-full max-w-4xl mx-auto mt-6 glass-panel bg-black/40 border border-cyan-500/30 rounded-2xl p-6 shadow-[0_0_30px_rgba(0,102,255,0.2)]"
        >
            {/* Decorative Grid Background */}
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 pointer-events-none"></div>

            {/* Header */}
            <div className="flex items-center gap-3 mb-4 border-b border-cyan-500/20 pb-2">
                <Sparkles className="text-cyan-400 w-5 h-5 animate-pulse drop-shadow-[0_0_5px_rgba(0,243,255,0.8)]" />
                <h2 className="text-xl font-heading font-bold tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
                    soso-smre INTELLIGENCE <span className="text-xs text-cyan-500/50 ml-2">v2.0 // {type.toUpperCase()} MODE</span>
                </h2>
            </div>

            {/* Content */}
            <div className="font-mono text-zinc-300 leading-relaxed min-h-[100px] text-sm md:text-base">
                <ReactMarkdown
                    components={{
                        strong: ({ node, ...props }) => <span className="text-cyan-400 font-bold drop-shadow-[0_0_2px_rgba(0,243,255,0.4)]" {...props} />,
                        ul: ({ node, ...props }) => <ul className="list-disc list-inside my-2 space-y-1 text-zinc-400" {...props} />,
                        li: ({ node, ...props }) => <li className="ml-2" {...props} />,
                        p: ({ node, ...props }) => <p className="mb-2 last:mb-0" {...props} />
                    }}
                >
                    {displayedText}
                </ReactMarkdown>
                <motion.span
                    animate={{ opacity: [0, 1, 0] }}
                    transition={{ repeat: Infinity, duration: 0.8 }}
                    className="inline-block w-2.5 h-4 bg-cyan-400 ml-1 align-middle shadow-[0_0_8px_rgba(0,243,255,0.8)]"
                />
            </div>

            {/* Footer */}
            <div className="mt-4 pt-2 border-t border-zinc-800 text-[10px] text-zinc-600 flex justify-between uppercase tracking-widest">
                <span>AI Generated • Not Financial Advice</span>
                <span>Secured by Groq AI</span>
            </div>
        </motion.div>
    );
}
