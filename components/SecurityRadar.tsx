'use client';

import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';
import { ShieldAlert, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';

interface SecurityRadarProps {
    data: any;
}

export default function SecurityRadar({ data }: SecurityRadarProps) {
    if (!data) return null;

    let chartData: any[] = [];
    // Strict Logic: Only tokens can be "Honeypots" in this context
    const isHoneypot = data.type === 'token' && data.security?.isHoneypot === true;

    if (data.type === 'token') {
        const score = parseFloat(data.smreRating || '0') * 20;
        chartData = [
            { subject: 'Liquidity', A: score, fullMark: 100 },
            { subject: 'Volume', A: score > 50 ? score + 10 : score - 10, fullMark: 100 },
            { subject: 'Community', A: data.sentiment === 'Bullish' ? 90 : 30, fullMark: 100 },
            { subject: 'Volatility', A: data.change?.includes('-') ? 80 : 40, fullMark: 100 },
            { subject: 'Reliability', A: score, fullMark: 100 },
        ];
    } else if (data.type === 'wallet') {
        const safeScore = data.security?.isSafe ? 90 : 10;
        chartData = [
            { subject: 'Tx History', A: safeScore, fullMark: 100 },
            { subject: 'Assets', A: safeScore, fullMark: 100 },
            { subject: 'Reputation', A: safeScore, fullMark: 100 },
            { subject: 'Activity', A: 80, fullMark: 100 },
            { subject: 'Safety', A: safeScore, fullMark: 100 },
        ];
    }

    const riskColor = (isHoneypot || parseFloat(data.smreRating) < 2.0) ? '#ef4444' : '#22c55e';

    return (
        <div className="relative bg-zinc-900/50 border border-zinc-800 p-4 rounded-xl flex flex-col items-center">
            <h3 className="text-yellow-500 font-heading tracking-widest mb-4 flex items-center">
                {isHoneypot ? <ShieldAlert className="w-5 h-5 mr-2 text-red-500" /> : <ShieldCheck className="w-5 h-5 mr-2 text-green-500" />}
                SECURITY PROFILE
            </h3>

            <div className="w-full h-[300px] relative">
                <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="80%" data={chartData}>
                        <PolarGrid stroke="#333" />
                        <PolarAngleAxis dataKey="subject" tick={{ fill: '#888', fontSize: 10 }} />
                        <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                        <Radar
                            name="Security"
                            dataKey="A"
                            stroke={riskColor}
                            strokeWidth={2}
                            fill={riskColor}
                            fillOpacity={0.4}
                        />
                    </RadarChart>
                </ResponsiveContainer>

                {/* Honeypot Overlay - ONLY for Tokens */}
                {isHoneypot && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-10 rounded-xl">
                        <motion.div
                            animate={{ scale: [1, 1.1, 1] }}
                            transition={{ repeat: Infinity, duration: 1 }}
                            className="bg-red-900/90 border-2 border-red-500 text-white p-6 rounded-lg text-center"
                        >
                            <ShieldAlert className="w-12 h-12 mx-auto mb-2" />
                            <h2 className="text-2xl font-bold font-heading">HONEYPOT DETECTED</h2>
                            <p className="text-sm font-mono mt-2">DO NOT BUY. SELL TAX &gt; 50% OR TRANSFER DISABLED.</p>
                        </motion.div>
                    </div>
                )}
            </div>
        </div>
    );
}
