"use client";

import { useEffect, useState } from "react";
import { FEATURE_FLAGS } from "@/config/feature-flags";

type SodexLiveFeedState = {
  connected: boolean;
  status: string;
};

export function useSodexLiveFeed() {
  const [state, setState] = useState<SodexLiveFeedState>({
    connected: false,
    status: "Singleton websocket manager is scaffolded but not connected.",
  });

  useEffect(() => {
    if (!FEATURE_FLAGS.enableSodexRealtime) {
      return;
    }

    setState({
      connected: false,
      status: "Realtime flag enabled but websocket connect flow is deferred to the next phase.",
    });
  }, []);

  return state;
}
