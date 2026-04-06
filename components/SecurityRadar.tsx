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
        const score = parseFloat(data.sosoRating || '0') * 20;
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

    const riskColor = (isHoneypot || parseFloat(data.sosoRating) < 2.0) ? '#ff003c' : '#00ff9d'; // Neon Red or Neon Green

    return (
        <div className="relative glass-panel rounded-2xl p-4 flex flex-col items-center shadow-[0_4px_30px_rgba(0,0,0,0.5)] border-white/5">
            <h3 className="text-cyan-400 font-heading tracking-widest mb-4 flex items-center drop-shadow-[0_0_5px_rgba(0,243,255,0.5)]">
                {isHoneypot ? <ShieldAlert className="w-5 h-5 mr-2 text-[#ff003c]" /> : <ShieldCheck className="w-5 h-5 mr-2 text-[#00ff9d]" />}
                SECURITY PROFILE
            </h3>

            <div className="w-full h-[300px] relative">
                <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="80%" data={chartData}>
                        <PolarGrid stroke="rgba(0, 243, 255, 0.2)" />
                        <PolarAngleAxis dataKey="subject" tick={{ fill: 'rgba(0, 243, 255, 0.7)', fontSize: 11, fontFamily: 'monospace' }} />
                        <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                        <Radar
                            name="Security"
                            dataKey="A"
                            stroke={riskColor}
                            strokeWidth={2}
                            fill={riskColor}
                            fillOpacity={0.3}
                            style={{ filter: `drop-shadow(0 0 10px ${riskColor})` }}
                        />
                    </RadarChart>
                </ResponsiveContainer>

                {/* Honeypot Overlay - ONLY for Tokens */}
                {isHoneypot && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/80 backdrop-blur-md z-10 rounded-xl">
                        <motion.div
                            animate={{ scale: [1, 1.05, 1] }}
                            transition={{ repeat: Infinity, duration: 1.5 }}
                            className="bg-[#ff003c]/20 border border-[#ff003c] text-white p-6 rounded-xl text-center shadow-[0_0_30px_rgba(255,0,60,0.5)]"
                        >
                            <ShieldAlert className="w-12 h-12 mx-auto mb-2 text-[#ff003c] drop-shadow-[0_0_10px_rgba(255,0,60,1)]" />
                            <h2 className="text-2xl font-bold font-heading text-[#ff003c] tracking-widest text-shadow-sm">HONEYPOT DETECTED</h2>
                            <p className="text-sm font-mono mt-2 text-zinc-300">DO NOT BUY. SELL TAX &gt; 50% OR TRANSFER DISABLED.</p>
                        </motion.div>
                    </div>
                )}
            </div>
        </div>
    );
}
