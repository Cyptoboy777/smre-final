import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

interface WidgetWrapperProps {
    title: string;
    icon?: ReactNode;
    children: ReactNode;
    loading?: boolean;
    error?: string | null;
    className?: string;
}

export default function WidgetWrapper({
    title,
    icon,
    children,
    loading = false,
    error = null,
    className = '',
}: WidgetWrapperProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`glass-panel rounded-xl flex flex-col overflow-hidden h-full ${className}`}
        >
            {/* Widget Header */}
            <div className="bg-white/5 border-b border-white/5 px-4 py-3 flex items-center justify-between">
                <h3 className="text-cyan-400 font-heading font-bold text-sm tracking-widest flex items-center drop-shadow-[0_0_5px_rgba(0,243,255,0.4)]">
                    {icon && <span className="mr-2">{icon}</span>}
                    {title}
                </h3>
                {loading && <Loader2 className="w-4 h-4 text-magenta-500 animate-spin" />}
            </div>

            {/* Widget Content Area */}
            <div className="flex-1 overflow-y-auto p-4 relative font-mono">
                {loading && (
                    <div className="absolute inset-0 z-10 bg-black/50 backdrop-blur-sm flex items-center justify-center">
                        <div className="flex flex-col items-center">
                            <Loader2 className="w-8 h-8 text-cyan-500 animate-spin mb-2" />
                            <span className="text-xs text-cyan-400/80 tracking-widest animate-pulse">SYNCING...</span>
                        </div>
                    </div>
                )}

                {error ? (
                    <div className="h-full flex flex-col items-center justify-center text-red-400 text-center p-4">
                        <span className="text-3xl mb-2">⚠️</span>
                        <p className="text-xs">{error}</p>
                    </div>
                ) : (
                    children
                )}
            </div>
        </motion.div>
    );
}
