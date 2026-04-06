import React from 'react';

interface WidgetWrapperProps {
    title: string;
    icon?: React.ReactNode;
    children: React.ReactNode;
    className?: string;
    loading?: boolean;
    error?: string | null;
}

export default function WidgetWrapper({ title, icon, children, className = '', loading, error }: WidgetWrapperProps) {
    return (
        <div className={`glass-panel rounded-2xl overflow-hidden flex flex-col h-full relative transition-all duration-300 group hover:border-white/20 ${className}`}>
            {/* Header */}
            <div className="px-4 py-3 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
                <div className="flex items-center gap-2">
                    {icon && <span className="text-secondary neon-glow-purple">{icon}</span>}
                    <h3 className="text-[10px] font-bold font-heading tracking-[0.2em] text-white/60 uppercase">
                        {title}
                    </h3>
                </div>
                {loading && (
                    <div className="flex gap-1">
                        <div className="w-1 h-1 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]" />
                        <div className="w-1 h-1 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]" />
                        <div className="w-1 h-1 bg-primary rounded-full animate-bounce" />
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="flex-1 relative flex flex-col p-4">
                {error ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-center p-6 text-red-400">
                        <p className="text-xs font-mono mb-2 opacity-50">&gt; ERROR_THRESHOLD_EXCEEDED</p>
                        <p className="text-sm font-bold uppercase">{error}</p>
                    </div>
                ) : (
                    children
                )}
            </div>

            {/* Subtle Gradient Shadow */}
            <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-white/5 to-transparent" />
        </div>
    );
}
