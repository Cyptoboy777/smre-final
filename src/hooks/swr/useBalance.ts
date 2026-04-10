"use client";

import useSWR from "swr";
import { SWR_KEYS } from "@/hooks/swr/keys";
import type { BalanceRouteResponse } from "@/types/sodex";

type UseBalanceOptions = {
  enabled?: boolean;
};

export function useBalance({ enabled = true }: UseBalanceOptions = {}) {
  return useSWR<BalanceRouteResponse>(enabled ? SWR_KEYS.sodex.balance : null);
}
