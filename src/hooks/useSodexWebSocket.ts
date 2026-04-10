'use client';

import { startTransition, useEffect, useEffectEvent, useRef, useState } from 'react';
import {
    getSodexWsManager,
    SODEX_PERPS_WS_URL,
    SODEX_SPOT_WS_URL,
    type SodexSubscriptionMessage,
    type SodexWireMessage,
    type WsConnectionStatus,
} from '@/lib/ws/ws-manager';

type UseSodexWebSocketOptions<TMessage> = {
    url: string;
    enabled?: boolean;
    subscribeMessages?: unknown[];
    heartbeatMs?: number;
    pongTimeoutMs?: number;
    maxBufferedMessages?: number;
    onMessage?: (message: TMessage) => void;
};

const inferMarketFromUrl = (url: string) => {
    if (url === SODEX_SPOT_WS_URL || url.endsWith('/spot')) {
        return 'spot' as const;
    }

    if (url === SODEX_PERPS_WS_URL || url.endsWith('/perps')) {
        return 'perps' as const;
    }

    return null;
};

const getSubscribeChannel = (message: unknown) => {
    if (!message || typeof message !== 'object') {
        return undefined;
    }

    const params = (message as { params?: Record<string, unknown> }).params;
    return typeof params?.channel === 'string' ? params.channel : undefined;
};

export function useSodexWebSocket<TMessage>({
    url,
    enabled = true,
    subscribeMessages = [],
    maxBufferedMessages = 50,
    onMessage,
}: UseSodexWebSocketOptions<TMessage>) {
    const animationFrameRef = useRef<number | null>(null);
    const messageQueueRef = useRef<TMessage[]>([]);
    const market = inferMarketFromUrl(url);
    const subscribeMessagesKey = JSON.stringify(subscribeMessages);

    const [status, setStatus] = useState<WsConnectionStatus>('idle');
    const [messages, setMessages] = useState<TMessage[]>([]);
    const [lastMessageAt, setLastMessageAt] = useState<number | null>(null);
    const [error, setError] = useState<string | null>(null);

    const flushQueue = useEffectEvent(() => {
        if (messageQueueRef.current.length === 0) {
            return;
        }

        const queued = messageQueueRef.current.splice(0, messageQueueRef.current.length);

        startTransition(() => {
            setMessages((current) => [...current, ...queued].slice(-maxBufferedMessages));
        });

        for (const item of queued) {
            onMessage?.(item);
        }
    });

    const scheduleFlush = useEffectEvent(() => {
        if (animationFrameRef.current !== null) {
            return;
        }

        animationFrameRef.current = window.requestAnimationFrame(() => {
            animationFrameRef.current = null;
            flushQueue();
        });
    });

    const clearUiTimers = useEffectEvent(() => {
        if (animationFrameRef.current !== null) {
            window.cancelAnimationFrame(animationFrameRef.current);
            animationFrameRef.current = null;
        }
    });

    const send = useEffectEvent((payload: unknown) => {
        if (!market) {
            return false;
        }

        return getSodexWsManager(market).send(payload);
    });

    useEffect(() => {
        if (!enabled) {
            setStatus('idle');
            return;
        }

        if (!market) {
            setStatus('error');
            setError(`Unsupported SoDEX websocket URL: ${url}`);
            return;
        }

        setError(null);
        const manager = getSodexWsManager(market);
        const unsubscribes: Array<() => void> = [];

        const attachSubscriber = (subscribeMessage?: SodexSubscriptionMessage) => {
            const channel = subscribeMessage ? getSubscribeChannel(subscribeMessage) : undefined;

            unsubscribes.push(
                manager.subscribe<TMessage & SodexWireMessage>({
                    channel,
                    subscribeMessage,
                    onStatusChange: (nextStatus) => setStatus(nextStatus),
                    onMessage: (message) => {
                        messageQueueRef.current.push(message as TMessage);
                        setLastMessageAt(Date.now());
                        scheduleFlush();
                    },
                }),
            );
        };

        if (subscribeMessages.length === 0) {
            attachSubscriber();
        } else {
            for (const subscribeMessage of subscribeMessages) {
                attachSubscriber(subscribeMessage as SodexSubscriptionMessage);
            }
        }

        setStatus(manager.currentStatus);

        return () => {
            clearUiTimers();
            for (const unsubscribe of unsubscribes) {
                unsubscribe();
            }
        };
    }, [clearUiTimers, enabled, market, scheduleFlush, subscribeMessagesKey, url]);

    return {
        status,
        error,
        lastMessageAt,
        messages,
        send,
        clearMessages: () => setMessages([]),
    };
}
