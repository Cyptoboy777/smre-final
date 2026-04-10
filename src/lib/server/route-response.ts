import "server-only";
import type { NextResponse } from "next/server";
import { json } from "@/lib/server/http/json";
import { getErrorMessage } from "@/lib/shared/errors";

export const jsonSuccess = <T extends Record<string, unknown>>(body: T, init?: ResponseInit) =>
  json(
    {
      success: true,
      ...body,
    },
    init,
  );

export const jsonError = (
  error: unknown,
  status = 500,
  extras?: Record<string, unknown>,
) =>
  json(
    {
      success: false,
      error: getErrorMessage(error),
      ...(extras ?? {}),
    },
    { status },
  );

export const jsonNotImplemented = (extras?: Record<string, unknown>) =>
  jsonError("Not implemented yet.", 501, extras);

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
