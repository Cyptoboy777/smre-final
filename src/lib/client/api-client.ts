"use client";

import { fetchJson } from "@/lib/shared/fetcher";

type ApiErrorOptions = {
  status: number;
  contentType?: string | null;
  body?: unknown;
  rawBody?: string;
};

export class ApiClientError extends Error {
  status: number;
  contentType?: string | null;
  body?: unknown;
  rawBody?: string;

  constructor(message: string, options: ApiErrorOptions) {
    super(message);
    this.name = "ApiClientError";
    this.status = options.status;
    this.contentType = options.contentType;
    this.body = options.body;
    this.rawBody = options.rawBody;
  }
}

export async function fetchApi<T>(
  input: RequestInfo | URL,
  init?: RequestInit,
): Promise<T> {
  return fetchJson<T>(input, init);
}
