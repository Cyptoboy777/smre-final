"use client";

import useSWR from "swr";
import { SWR_KEYS } from "@/hooks/swr/keys";
import type { OrdersRouteResponse } from "@/types/sodex";

type UseOrdersOptions = {
  enabled?: boolean;
};

export function useOrders({ enabled = true }: UseOrdersOptions = {}) {
  return useSWR<OrdersRouteResponse>(enabled ? SWR_KEYS.sodex.orders : null);
}
