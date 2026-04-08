'use client';

import { startTransition, useEffect, useEffectEvent, useRef, useState } from 'react';

type ConnectionStatus = 'idle' | 'connecting' | 'open' | 'reconnecting' | 'closed' | 'error';

type UseSodexWebSocketOptions<TMessage> = {
    url: string;
    enabled?: boolean;
    subscribeMessages?: unknown[];
    heartbeatMs?: number;
    maxBufferedMessages?: number;
    onMessage?: (message: TMessage) => void;
};

export function useSodexWebSocket<TMessage>({
    url,
    enabled = true,
    subscribeMessages = [],
    heartbeatMs = 50000,
    maxBufferedMessages = 50,
    onMessage,
}: UseSodexWebSocketOptions<TMessage>) {
    const wsRef = useRef<WebSocket | null>(null);
    const subscribeMessagesRef = useRef(subscribeMessages);
    const reconnectTimerRef = useRef<number | null>(null);
    const heartbeatTimerRef = useRef<number | null>(null);
    const animationFrameRef = useRef<number | null>(null);
    const reconnectAttemptsRef = useRef(0);
    const messageQueueRef = useRef<TMessage[]>([]);
    const lastActivityRef = useRef<number>(Date.now());

    const [status, setStatus] = useState<ConnectionStatus>('idle');
    const [messages, setMessages] = useState<TMessage[]>([]);
    const [lastMessageAt, setLastMessageAt] = useState<number | null>(null);
    const [error, setError] = useState<string | null>(null);

    subscribeMessagesRef.current = subscribeMessages;

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

    const clearTimers = useEffectEvent(() => {
        if (reconnectTimerRef.current !== null) {
            window.clearTimeout(reconnectTimerRef.current);
            reconnectTimerRef.current = null;
        }

        if (heartbeatTimerRef.current !== null) {
            window.clearInterval(heartbeatTimerRef.current);
            heartbeatTimerRef.current = null;
        }

        if (animationFrameRef.current !== null) {
            window.cancelAnimationFrame(animationFrameRef.current);
            animationFrameRef.current = null;
        }
    });

    const send = useEffectEvent((payload: unknown) => {
        const socket = wsRef.current;

        if (!socket || socket.readyState !== WebSocket.OPEN) {
            return false;
        }

        socket.send(JSON.stringify(payload));
        lastActivityRef.current = Date.now();
        return true;
    });

    const scheduleReconnect = useEffectEvent(() => {
        if (!enabled) {
            return;
        }

        clearTimers();
        setStatus('reconnecting');
        reconnectAttemptsRef.current += 1;
        const delay = Math.min(30000, 1000 * 2 ** Math.min(reconnectAttemptsRef.current, 5));

        reconnectTimerRef.current = window.setTimeout(() => {
            connect();
        }, delay);
    });

    const connect = useEffectEvent(() => {
        if (!enabled) {
            return;
        }

        clearTimers();
        wsRef.current?.close();
        setStatus('connecting');
        setError(null);

        const socket = new WebSocket(url);
        wsRef.current = socket;

        socket.onopen = () => {
            reconnectAttemptsRef.current = 0;
            lastActivityRef.current = Date.now();
            setStatus('open');

            for (const message of subscribeMessagesRef.current) {
                socket.send(JSON.stringify(message));
            }

            heartbeatTimerRef.current = window.setInterval(() => {
                if (socket.readyState !== WebSocket.OPEN) {
                    return;
                }

                if (Date.now() - lastActivityRef.current >= heartbeatMs) {
                    socket.send(JSON.stringify({ op: 'ping' }));
                    lastActivityRef.current = Date.now();
                }
            }, 5000);
        };

        socket.onmessage = (event) => {
            lastActivityRef.current = Date.now();
            setLastMessageAt(lastActivityRef.current);

            try {
                const parsed = JSON.parse(event.data) as TMessage | { op?: string };
                if ((parsed as { op?: string }).op === 'pong') {
                    return;
                }

                messageQueueRef.current.push(parsed as TMessage);
                scheduleFlush();
            } catch (parseError) {
                setError(parseError instanceof Error ? parseError.message : 'Failed to parse websocket message');
            }
        };

        socket.onerror = () => {
            setStatus('error');
            setError('WebSocket connection error');
        };

        socket.onclose = () => {
            setStatus('closed');
            scheduleReconnect();
        };
    });

    useEffect(() => {
        if (!enabled) {
            clearTimers();
            wsRef.current?.close();
            wsRef.current = null;
            setStatus('idle');
            return;
        }

        connect();

        return () => {
            clearTimers();
            wsRef.current?.close();
            wsRef.current = null;
            setStatus('closed');
        };
    }, [connect, clearTimers, enabled, url, heartbeatMs]);

    return {
        status,
        error,
        lastMessageAt,
        messages,
        send,
        clearMessages: () => setMessages([]),
    };
}
