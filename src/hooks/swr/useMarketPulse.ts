"use client";

import useSWR from "swr";
import { SWR_KEYS } from "@/hooks/swr/keys";
import type { MarketRouteResponse } from "@/types/sodex";

type UseMarketPulseOptions = {
  enabled?: boolean;
};

export function useMarketPulse({ enabled = true }: UseMarketPulseOptions = {}) {
  return useSWR<MarketRouteResponse>(enabled ? SWR_KEYS.sodex.market : null, {
    refreshInterval: enabled ? 30_000 : 0,
  });
}
