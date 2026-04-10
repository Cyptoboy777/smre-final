'use client';

import { useEffect, useRef, useState } from 'react';
import {
    getSodexWsManager,
    type WsConnectionStatus,
} from '@/lib/ws/ws-manager';
import type { SodexWsMessage } from '@/types/sodex';

type UseSodexLiveOptions = {
    market: 'spot' | 'perps';
    /** Maximum messages to keep in the buffer */
    maxBuffer?: number;
    /** Called synchronously for every non-control message received */
    onMessage?: (msg: SodexWsMessage) => void;
    /** Set to false to prevent connecting (useful during SSR or opt-out) */
    enabled?: boolean;
};

type UseSodexLiveReturn = {
    status: WsConnectionStatus;
    messages: SodexWsMessage[];
    clearMessages: () => void;
};

/**
 * useSodexLive — thin React binding to the singleton WS manager.
 *
 * Multiple components can call this hook simultaneously.
 * Only ONE WebSocket connection is ever opened per market.
 */
export function useSodexLive({
    market,
    maxBuffer = 50,
    onMessage,
    enabled = true,
}: UseSodexLiveOptions): UseSodexLiveReturn {
    const [status, setStatus] = useState<WsConnectionStatus>('idle');
    const [messages, setMessages] = useState<SodexWsMessage[]>([]);

    // Keep onMessage stable across renders
    const onMessageRef = useRef(onMessage);
    onMessageRef.current = onMessage;

    useEffect(() => {
        if (!enabled) {
            setStatus('idle');
            return;
        }

        const manager = getSodexWsManager(market);

        const unsubscribe = manager.subscribe({
            onMessage: (msg) => {
                setMessages((prev) => [...prev, msg].slice(-maxBuffer));
                onMessageRef.current?.(msg);
            },
            onStatusChange: (next) => setStatus(next),
        });

        // Sync current status in case manager is already connected
        setStatus(manager.currentStatus);

        return unsubscribe;
    }, [market, enabled, maxBuffer]);

    return {
        status,
        messages,
        clearMessages: () => setMessages([]),
    };
}
