"use client";

import useSWR from "swr";
import { SWR_KEYS } from "@/hooks/swr/keys";
import type { AnalyzeRouteResponse } from "@/types/groq";

type UseQuantIntelligenceOptions = {
  enabled?: boolean;
};

export function useQuantIntelligence({
  enabled = true,
}: UseQuantIntelligenceOptions = {}) {
  return useSWR<AnalyzeRouteResponse>(
    enabled ? SWR_KEYS.groq.quantIntelligence : null,
  );
}
