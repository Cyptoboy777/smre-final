'use client';

import { startTransition, useEffectEvent, useRef, useState } from 'react';

type UseApiMutationOptions<TData, TVariables> = {
    request: (variables: TVariables, signal: AbortSignal) => Promise<TData>;
};

export function useApiMutation<TData, TVariables>({ request }: UseApiMutationOptions<TData, TVariables>) {
    const [data, setData] = useState<TData | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const abortRef = useRef<AbortController | null>(null);

    const mutate = useEffectEvent(async (variables: TVariables) => {
        abortRef.current?.abort();
        const controller = new AbortController();
        abortRef.current = controller;
        setLoading(true);
        setError(null);

        try {
            const nextData = await request(variables, controller.signal);

            if (controller.signal.aborted) {
                return null;
            }

            startTransition(() => {
                setData(nextData);
            });

            return nextData;
        } catch (requestError) {
            if (controller.signal.aborted) {
                return null;
            }

            const message = requestError instanceof Error ? requestError.message : 'Request failed';
            setError(message);
            throw requestError;
        } finally {
            if (!controller.signal.aborted) {
                setLoading(false);
            }
        }
    });

    return {
        data,
        loading,
        error,
        mutate,
        reset: () => {
            abortRef.current?.abort();
            setData(null);
            setError(null);
            setLoading(false);
        },
    };
}
