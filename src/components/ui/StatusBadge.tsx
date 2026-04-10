import type { WsConnectionStatus } from '@/lib/ws/ws-manager';

type StatusBadgeProps = {
    status: WsConnectionStatus;
    label?: string;
    className?: string;
};

const STATUS_CONFIG: Record<
    WsConnectionStatus,
    { color: string; dotColor: string; pulse: boolean; text: string }
> = {
    idle:         { color: 'text-white/40',  dotColor: 'bg-white/30',   pulse: false, text: 'IDLE'         },
    connecting:   { color: 'text-yellow-400', dotColor: 'bg-yellow-400', pulse: true,  text: 'CONNECTING'   },
    open:         { color: 'text-accent',     dotColor: 'bg-accent',     pulse: true,  text: 'LIVE'         },
    reconnecting: { color: 'text-yellow-400', dotColor: 'bg-yellow-400', pulse: true,  text: 'RECONNECTING' },
    closed:       { color: 'text-white/40',   dotColor: 'bg-white/30',   pulse: false, text: 'CLOSED'       },
    error:        { color: 'text-red-400',    dotColor: 'bg-red-400',    pulse: false, text: 'ERROR'        },
};

export function StatusBadge({ status, label, className = '' }: StatusBadgeProps) {
    const cfg = STATUS_CONFIG[status];

    return (
        <span
            className={`inline-flex items-center gap-1.5 text-[9px] font-mono font-bold tracking-widest uppercase ${cfg.color} ${className}`}
        >
            <span
                className={`w-1.5 h-1.5 rounded-full ${cfg.dotColor} ${cfg.pulse ? 'animate-pulse' : ''}`}
            />
            {label ?? cfg.text}
        </span>
    );
}
