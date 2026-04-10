/**
 * Canonical API envelope types shared between Route Handlers and client SWR hooks.
 * This is the authoritative source — do NOT import from @/lib/api.ts.
 */

export type ApiSuccess<T extends object> = { success: true } & T;

export type ApiFailure = {
    success: false;
    error: string;
};

export type ApiResponse<T extends object> = ApiSuccess<T> | ApiFailure;

/** Narrows an ApiResponse to only the success branch */
export type ApiSuccessPayload<T extends { success: boolean }> = Extract<T, { success: true }>;

// ─── Utility helpers ───────────────────────────────────────────────────────────

export const isJsonContentType = (contentType: string | null) =>
    Boolean(contentType?.toLowerCase().includes('application/json'));

export const getResponseSnippet = (text: string) =>
    text.replace(/\s+/g, ' ').trim().slice(0, 160);
