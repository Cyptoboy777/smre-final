/**
 * Global SWR fetcher — the single entry-point used by every useSWR call.
 *
 * Features:
 * - Rejects non-OK responses with a typed ApiClientError
 * - Surfaces the `error` field from our ApiFailure envelope shape
 * - Preserves the full response body for debugging
 */

import { ApiClientError } from '@/lib/client/api-client';

export const swrFetcher = async <T>(url: string): Promise<T> => {
    const response = await fetch(url, {
        headers: { Accept: 'application/json' },
    });

    const text = await response.text();
    const contentType = response.headers.get('content-type');

    let body: unknown;
    try {
        body = text ? JSON.parse(text) : {};
    } catch {
        throw new ApiClientError(
            `Server returned invalid JSON (${response.status})`,
            { status: response.status, contentType, rawBody: text }
        );
    }

    if (!response.ok) {
        const msg =
            body && typeof body === 'object' && 'error' in body && typeof (body as Record<string, unknown>).error === 'string'
                ? (body as { error: string }).error
                : `${response.status} ${response.statusText}`.trim();

        throw new ApiClientError(msg, {
            status: response.status,
            contentType,
            body,
            rawBody: text,
        });
    }

    // Unwrap our ApiFailure envelope if present
    if (
        body &&
        typeof body === 'object' &&
        'success' in body &&
        (body as { success: boolean }).success === false
    ) {
        throw new ApiClientError(
            (body as { error?: string }).error ?? 'Request failed',
            { status: response.status, contentType, body, rawBody: text }
        );
    }

    return body as T;
};
