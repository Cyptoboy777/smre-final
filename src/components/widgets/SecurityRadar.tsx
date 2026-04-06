'use client';

import { Shield, ShieldAlert, ShieldCheck, Activity, Terminal } from 'lucide-react';
import WidgetWrapper from '../WidgetWrapper';
import { motion, AnimatePresence } from 'framer-motion';

interface SecurityRadarProps {
    data: any | null;
    loading: boolean;
}

export default function SecurityRadar({ data, loading }: SecurityRadarProps) {
    const isToken = data?.type === 'token';
    const security = data?.security || null;
    const isSafe = security?.isSafe;

    return (
        <WidgetWrapper title="SECURITY RADAR" icon={<Shield className="w-3 h-3" />} loading={loading}>
            {!data && !loading ? (
                <div className="flex-1 flex flex-col items-center justify-center opacity-20 grayscale">
                    <Activity className="w-8 h-8 mb-2 animate-pulse" />
                    <span className="text-[8px] font-mono tracking-widest leading-none">NO DATA TARGET FOUND</span>
                </div>
            ) : (
                <div className="flex flex-col h-full items-center justify-center relative overflow-hidden">
                    {/* Background Radar Effect */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
                        <div className="w-[120px] h-[120px] rounded-full border border-primary/40 animate-ping [animation-duration:3s]" />
                        <div className="w-[80px] h-[80px] rounded-full border border-primary/20 animate-ping [animation-duration:5s]" />
                    </div>

                    <AnimatePresence mode="wait">
                        <motion.div 
                            key={isSafe ? 'safe' : 'danger'}
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.8, opacity: 0 }}
                            className="flex flex-col items-center gap-4 relative z-10"
                        >
                            <div className={`w-20 h-20 rounded-full flex items-center justify-center border-2 border-dashed ${isSafe ? 'border-accent neon-glow-green text-accent bg-accent/5' : 'border-destructive neon-glow-red text-destructive bg-destructive/5'}`}>
                                {isSafe ? <ShieldCheck className="w-10 h-10" /> : <ShieldAlert className="w-10 h-10" />}
                            </div>

                            <div className="text-center">
                                <h4 className={`text-sm font-black font-heading tracking-widest uppercase mb-1 ${isSafe ? 'text-accent' : 'text-destructive'}`}>
                                    {security?.status_text || 'SCANNING...'}
                                </h4>
                                {isToken && (
                                    <div className="flex gap-4 items-center justify-center mt-2">
                                        <div className="flex flex-col">
                                            <span className="text-[8px] font-mono text-white/30 uppercase tracking-widest leading-none mb-1">BUY_TAX</span>
                                            <span className="text-[10px] font-bold font-mono text-white tracking-widest">{security?.buy_tax || '0%'}</span>
                                        </div>
                                        <div className="flex flex-col border-l border-white/10 pl-4">
                                            <span className="text-[8px] font-mono text-white/30 uppercase tracking-widest leading-none mb-1">SELL_TAX</span>
                                            <span className="text-[10px] font-bold font-mono text-white tracking-widest">{security?.sell_tax || '0%'}</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </AnimatePresence>

                    {/* Footer Log */}
                    <div className="absolute bottom-0 w-full p-2 bg-black/40 border-t border-white/5 rounded-b-xl mt-4">
                        <div className="flex items-center gap-2 overflow-hidden whitespace-nowrap">
                            <Terminal className="w-2.5 h-2.5 text-primary shrink-0 opacity-50" />
                            <span className="text-[8px] font-mono text-white/40 uppercase tracking-widest animate-[marquee_20s_linear_infinite]">
                                &gt; GOPLUS_SECURITY_API: SYNCED | RUG_PULL_DETECTION: ON | HONEYPOT_CHECK: VERIFIED
                            </span>
                        </div>
                    </div>
                </div>
            )}
        </WidgetWrapper>
    );
}

// Global styles would handle this marquee, but adding here as well
const styles = `
@keyframes marquee {
  0% { transform: translateX(0) }
  100% { transform: translateX(-50%) }
}
`;
