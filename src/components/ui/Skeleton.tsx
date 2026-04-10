type SkeletonProps = {
    className?: string;
    rows?: number;
    rowHeight?: string;
    gap?: string;
};

/**
 * Skeleton — animated loading placeholder.
 * Uses Tailwind animate-pulse with the project's dark glass aesthetic.
 */
export function Skeleton({ className = '', rows = 1, rowHeight = 'h-4', gap = 'gap-2' }: SkeletonProps) {
    if (rows === 1) {
        return (
            <div
                className={`animate-pulse rounded-md bg-white/[0.06] ${rowHeight} ${className}`}
            />
        );
    }

    return (
        <div className={`flex flex-col ${gap}`}>
            {Array.from({ length: rows }).map((_, i) => (
                <div
                    key={i}
                    className={`animate-pulse rounded-md bg-white/[0.06] ${rowHeight}`}
                    style={{ opacity: 1 - i * (0.15 / rows) }}
                />
            ))}
        </div>
    );
}

/** Full-panel skeleton for widget loading states */
export function WidgetSkeleton({ label = 'LOADING...' }: { label?: string }) {
    return (
        <div className="flex flex-col gap-3 p-4 h-full">
            <div className="flex items-center justify-between">
                <Skeleton className="w-24 h-3" />
                <Skeleton className="w-12 h-3" />
            </div>
            <Skeleton rows={4} rowHeight="h-4" gap="gap-3" />
            <div className="mt-auto text-center text-[9px] font-mono text-white/20 tracking-widest">
                {label}
            </div>
        </div>
    );
}
