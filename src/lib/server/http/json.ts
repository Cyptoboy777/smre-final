import "server-only";
import { NextResponse } from "next/server";

const DEFAULT_HEADERS = {
  "Cache-Control": "no-store",
};

export function json<T extends Record<string, unknown>>(body: T, init?: ResponseInit) {
  return NextResponse.json(body, {
    ...init,
    headers: {
      ...DEFAULT_HEADERS,
      ...(init?.headers ?? {}),
    },
  });
}
