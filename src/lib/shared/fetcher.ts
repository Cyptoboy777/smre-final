import { getErrorMessage } from "@/lib/shared/errors";

export async function fetchJson<T>(
  input: RequestInfo | URL,
  init?: RequestInit,
): Promise<T> {
  const response = await fetch(input, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });

  const isJson = response.headers.get("content-type")?.includes("application/json");
  const body = isJson ? await response.json() : await response.text();

  if (!response.ok) {
    const message =
      typeof body === "object" && body && "error" in body
        ? String(body.error)
        : getErrorMessage(body);
    throw new Error(message);
  }

  return body as T;
}

export async function swrFetcher<T>(key: string) {
  return fetchJson<T>(key);
}
