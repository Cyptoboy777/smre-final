'use client';

import { startTransition, useEffect, useEffectEvent, useRef, useState, type DependencyList } from 'react';

type UseApiQueryOptions<TData> = {
    enabled?: boolean;
    deps?: DependencyList;
    initialData?: TData | null;
    refreshIntervalMs?: number;
    request: (signal: AbortSignal) => Promise<TData>;
};

export function useApiQuery<TData>({
    enabled = true,
    deps = [],
    initialData = null,
    refreshIntervalMs,
    request,
}: UseApiQueryOptions<TData>) {
    const [data, setData] = useState<TData | null>(initialData);
    const [loading, setLoading] = useState(enabled);
    const [error, setError] = useState<string | null>(null);
    const abortRef = useRef<AbortController | null>(null);
    const dataRef = useRef<TData | null>(initialData);

    dataRef.current = data;

    const runRequest = useEffectEvent(async () => {
        abortRef.current?.abort();
        const controller = new AbortController();
        abortRef.current = controller;

        if (dataRef.current === null) {
            setLoading(true);
        }

        try {
            const nextData = await request(controller.signal);

            if (controller.signal.aborted) {
                return;
            }

            startTransition(() => {
                setData(nextData);
                setError(null);
            });
        } catch (requestError) {
            if (controller.signal.aborted) {
                return;
            }

            setError(requestError instanceof Error ? requestError.message : 'Request failed');
        } finally {
            if (!controller.signal.aborted) {
                setLoading(false);
            }
        }
    });

    useEffect(() => {
        if (!enabled) {
            abortRef.current?.abort();
            setLoading(false);
            return;
        }

        void runRequest();

        if (!refreshIntervalMs) {
            return () => {
                abortRef.current?.abort();
            };
        }

        const interval = window.setInterval(() => {
            void runRequest();
        }, refreshIntervalMs);

        return () => {
            window.clearInterval(interval);
            abortRef.current?.abort();
        };
    }, [enabled, refreshIntervalMs, runRequest, ...deps]);

    return {
        data,
        loading,
        error,
        reload: () => runRequest(),
        setData,
        setError,
    };
}
