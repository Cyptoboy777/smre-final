"use client";

import type { ReactNode } from "react";
import { SWRConfig } from "swr";
import { swrFetcher } from "@/lib/shared/fetcher";

type SWRProviderProps = {
  children: ReactNode;
};

export function SWRProvider({ children }: SWRProviderProps) {
  return (
    <SWRConfig
      value={{
        fetcher: swrFetcher,
        revalidateOnFocus: false,
        revalidateOnReconnect: true,
        shouldRetryOnError: true,
        errorRetryCount: 2,
        dedupingInterval: 5_000,
      }}
    >
      {children}
    </SWRConfig>
  );
}
