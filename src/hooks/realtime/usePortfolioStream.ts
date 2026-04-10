"use client";

import { useEffect, useState } from "react";
import { FEATURE_FLAGS } from "@/config/feature-flags";

type PortfolioStreamState = {
  connected: boolean;
  message: string;
};

export function usePortfolioStream() {
  const [state, setState] = useState<PortfolioStreamState>({
    connected: false,
    message: "Portfolio stream reserved for Phase 2 websocket work.",
  });

  useEffect(() => {
    if (!FEATURE_FLAGS.enableSodexRealtime) {
      return;
    }

    setState({
      connected: false,
      message: "Realtime flag enabled but portfolio stream is still scaffold-only.",
    });
  }, []);

  return state;
}
