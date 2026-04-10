"use client";

import useSWR from "swr";
import { SWR_KEYS } from "@/hooks/swr/keys";
import type { PortfolioRouteResponse } from "@/types/sodex";

type UsePortfolioOptions = {
  enabled?: boolean;
};

export function usePortfolio({ enabled = true }: UsePortfolioOptions = {}) {
  return useSWR<PortfolioRouteResponse>(enabled ? SWR_KEYS.sodex.portfolio : null);
}
