'use client';

import { getResponseSnippet, isJsonContentType, type ApiFailure, type ApiResponse } from '@/lib/api';

type ApiErrorOptions = {
    status: number;
    contentType: string | null;
    body?: unknown;
    rawBody?: string;
};

export class ApiClientError extends Error {
    status: number;
    contentType: string | null;
    body?: unknown;
    rawBody?: string;

    constructor(message: string, options: ApiErrorOptions) {
        super(message);
        this.name = 'ApiClientError';
        this.status = options.status;
        this.contentType = options.contentType;
        this.body = options.body;
        this.rawBody = options.rawBody;
    }
}

const parseJsonBody = (response: Response, text: string) => {
    const contentType = response.headers.get('content-type');

    if (!isJsonContentType(contentType)) {
        const statusLabel = response.ok ? 'Unexpected non-JSON response' : `Request failed with non-JSON response (${response.status})`;
        const snippet = getResponseSnippet(text);
        throw new ApiClientError(snippet ? `${statusLabel}: ${snippet}` : statusLabel, {
            status: response.status,
            contentType,
            rawBody: text,
        });
    }

    if (!text) {
        return {};
    }

    try {
        return JSON.parse(text) as unknown;
    } catch {
        throw new ApiClientError(`Server returned invalid JSON (${response.status})`, {
            status: response.status,
            contentType,
            rawBody: text,
        });
    }
};

const getApiErrorMessage = (response: Response, body: unknown) => {
    if (body && typeof body === 'object' && 'error' in body && typeof body.error === 'string') {
        return body.error;
    }

    return `${response.status} ${response.statusText}`.trim() || 'Request failed';
};

export async function fetchApi<T extends object>(input: RequestInfo | URL, init?: RequestInit): Promise<T> {
    const headers = new Headers(init?.headers);

    if (!headers.has('Accept')) {
        headers.set('Accept', 'application/json');
    }

    const response = await fetch(input, {
        ...init,
        headers,
    });
    const text = await response.text();
    const body = parseJsonBody(response, text);

    if (!response.ok) {
        throw new ApiClientError(getApiErrorMessage(response, body), {
            status: response.status,
            contentType: response.headers.get('content-type'),
            body,
            rawBody: text,
        });
    }

    const payload = body as ApiResponse<T> | T;

    if (payload && typeof payload === 'object' && 'success' in payload && payload.success === false) {
        throw new ApiClientError((payload as ApiFailure).error || 'Request failed', {
            status: response.status,
            contentType: response.headers.get('content-type'),
            body: payload,
            rawBody: text,
        });
    }

    return payload as T;
}
