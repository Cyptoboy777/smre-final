"use client";

import { useEffect, useState } from "react";
import { FEATURE_FLAGS } from "@/config/feature-flags";

type OrderBookStreamState = {
  connected: boolean;
  message: string;
};

export function useOrderBookStream() {
  const [state, setState] = useState<OrderBookStreamState>({
    connected: false,
    message: "Order book stream reserved for Phase 2 websocket work.",
  });

  useEffect(() => {
    if (!FEATURE_FLAGS.enableSodexRealtime) {
      return;
    }

    setState({
      connected: false,
      message: "Realtime flag enabled but websocket manager is not implemented yet.",
    });
  }, []);

  return state;
}
