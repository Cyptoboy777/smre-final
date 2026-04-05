'use client';

import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';
import { ShieldAlert, ShieldCheck, Activity } from 'lucide-react';
import { motion } from 'framer-motion';
import WidgetWrapper from './WidgetWrapper';

interface SecurityWidgetProps {
    data: any | null;
    loading: boolean;
}

export default function SecurityWidget({ data, loading }: SecurityWidgetProps) {
    let chartData: any[] = [];
    const isHoneypot = data?.type === 'token' && data?.security?.isHoneypot === true;

    if (data?.type === 'token') {
        const score = parseFloat(data.smreRating || '0') * 20;
        chartData = [
            { subject: 'Liquidity', A: score, fullMark: 100 },
            { subject: 'Volume', A: score > 50 ? score + 10 : score - 10, fullMark: 100 },
            { subject: 'Community', A: data.sentiment === 'Bullish' ? 90 : 30, fullMark: 100 },
            { subject: 'Volatility', A: data.change?.includes('-') ? 80 : 40, fullMark: 100 },
            { subject: 'Reliability', A: score, fullMark: 100 },
        ];
    } else if (data?.type === 'wallet') {
        const safeScore = data.security?.isSafe ? 90 : 10;
        chartData = [
            { subject: 'Tx History', A: safeScore, fullMark: 100 },
            { subject: 'Assets', A: safeScore, fullMark: 100 },
            { subject: 'Reputation', A: safeScore, fullMark: 100 },
            { subject: 'Activity', A: 80, fullMark: 100 },
            { subject: 'Safety', A: safeScore, fullMark: 100 },
        ];
    }

    const riskColor = isHoneypot || (data && parseFloat(data.smreRating) < 2.0) ? '#ff003c' : '#00ff9d';

    return (
        <WidgetWrapper
            title="ON-CHAIN RADAR"
            icon={<Activity className="w-4 h-4 text-magenta-500 drop-shadow-[0_0_5px_rgba(255,0,236,0.5)]" />}
            loading={loading}
            className="min-h-[300px]"
        >
            {!data && !loading ? (
                <div className="flex flex-col items-center justify-center h-full text-zinc-500 font-mono text-sm opacity-50">
                    <PolarGrid className="w-16 h-16 mb-2" />
                    NO DATA
                </div>
            ) : (
                <div className="w-full h-full relative flex flex-col items-center justify-center">

                    {data && (
                        <div className="absolute top-0 right-0 z-10 flex flex-col items-end">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${isHoneypot ? 'bg-red-500/20 text-red-400 border-red-500/50' : 'bg-green-500/20 text-green-400 border-green-500/50'}`}>
                                {isHoneypot ? 'RISK: CRITICAL' : 'STATUS: SAFE'}
                            </span>
                        </div>
                    )}

                    <div className="w-full h-[220px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <RadarChart cx="50%" cy="50%" outerRadius="70%" data={chartData}>
                                <PolarGrid stroke="rgba(0, 243, 255, 0.15)" />
                                <PolarAngleAxis dataKey="subject" tick={{ fill: 'rgba(255, 255, 255, 0.6)', fontSize: 10, fontFamily: 'monospace' }} />
                                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                                <Radar
                                    name="Security"
                                    dataKey="A"
                                    stroke={riskColor}
                                    strokeWidth={2}
                                    fill={riskColor}
                                    fillOpacity={0.2}
                                    style={{ filter: `drop-shadow(0 0 8px ${riskColor})` }}
                                />
                            </RadarChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Honeypot Overlay */}
                    {isHoneypot && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/80 backdrop-blur-md z-20 rounded-xl">
                            <motion.div
                                animate={{ scale: [1, 1.05, 1] }}
                                transition={{ repeat: Infinity, duration: 1.5 }}
                                className="bg-[#ff003c]/20 border border-[#ff003c] text-white p-4 rounded-xl text-center shadow-[0_0_30px_rgba(255,0,60,0.5)]"
                            >
                                <ShieldAlert className="w-8 h-8 mx-auto mb-2 text-[#ff003c] drop-shadow-[0_0_10px_rgba(255,0,60,1)]" />
                                <h2 className="text-lg font-bold font-heading text-[#ff003c] tracking-widest">HONEYPOT</h2>
                                <p className="text-[10px] font-mono mt-1 text-zinc-300">DO NOT BUY. TRANSFER DISABLED.</p>
                            </motion.div>
                        </div>
                    )}
                </div>
            )}
        </WidgetWrapper>
    );
}
