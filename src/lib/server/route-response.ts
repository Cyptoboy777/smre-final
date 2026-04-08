import 'server-only';

import { NextResponse } from 'next/server';
import { getErrorMessage } from '@/lib/crypto-dashboard';

const DEFAULT_HEADERS = {
    'Cache-Control': 'no-store',
};

export const jsonSuccess = <T extends Record<string, unknown>>(body: T, init?: ResponseInit) =>
    NextResponse.json(
        {
            success: true,
            ...body,
        },
        {
            ...init,
            headers: {
                ...DEFAULT_HEADERS,
                ...(init?.headers || {}),
            },
        }
    );

export const jsonError = (error: unknown, status = 500, extras?: Record<string, unknown>) =>
    NextResponse.json(
        {
            success: false,
            error: getErrorMessage(error),
            ...(extras || {}),
        },
        {
            status,
            headers: DEFAULT_HEADERS,
        }
    );

export const ensureServerConfiguration = (condition: unknown, message: string) => {
    if (!condition) {
        throw new Error(message);
    }
};

export const handleRoute = async (handler: () => Promise<NextResponse> | NextResponse) => {
    try {
        return await handler();
    } catch (error) {
        return jsonError(error);
    }
};
