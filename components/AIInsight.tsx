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
        : `MARKET SCAN COMPLETE. Sentiment: ${data.sentiment}. SMRE Score: ${data.smreRating}/5.0. Trend: ${data.change.includes('-') ? 'DOWNTREND' : 'UPTREND'}.`);

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
            className="relative w-full max-w-4xl mx-auto mt-6 bg-black/80 border border-yellow-500/50 rounded-xl p-6 shadow-[0_0_30px_rgba(255,215,0,0.15)]"
        >
            {/* Decorative Grid Background */}
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 pointer-events-none"></div>

            {/* Header */}
            <div className="flex items-center gap-3 mb-4 border-b border-yellow-500/20 pb-2">
                <Sparkles className="text-yellow-400 w-5 h-5 animate-pulse" />
                <h2 className="text-xl font-heading font-bold text-yellow-400 tracking-wider">
                    SMRE INTELLIGENCE <span className="text-xs text-zinc-500 ml-2">v1.0 // {type.toUpperCase()} MODE</span>
                </h2>
            </div>

            {/* Content */}
            <div className="font-mono text-zinc-300 leading-relaxed min-h-[100px] text-sm md:text-base">
                <ReactMarkdown
                    components={{
                        strong: ({ node, ...props }) => <span className="text-yellow-400 font-bold" {...props} />,
                        ul: ({ node, ...props }) => <ul className="list-disc list-inside my-2 space-y-1" {...props} />,
                        li: ({ node, ...props }) => <li className="ml-2" {...props} />,
                        p: ({ node, ...props }) => <p className="mb-2 last:mb-0" {...props} />
                    }}
                >
                    {displayedText}
                </ReactMarkdown>
                <motion.span
                    animate={{ opacity: [0, 1, 0] }}
                    transition={{ repeat: Infinity, duration: 0.8 }}
                    className="inline-block w-2.5 h-4 bg-yellow-500 ml-1 align-middle"
                />
            </div>

            {/* Footer */}
            <div className="mt-4 pt-2 border-t border-zinc-800 text-[10px] text-zinc-600 flex justify-between uppercase tracking-widest">
                <span>AI Generated • Not Financial Advice</span>
                <span>Secured by Gemini Pro</span>
            </div>
        </motion.div>
    );
}
