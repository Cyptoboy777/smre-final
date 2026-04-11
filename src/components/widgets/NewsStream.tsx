"use client";

import WidgetWrapper from "../WidgetWrapper";
import { type NewsItem } from "@/lib/crypto-dashboard";
import { fetchApi } from "@/lib/client/api-client";
import { type ApiSuccessPayload, type NewsRouteResponse } from "@/lib/api";
import { useApiQuery } from "@/hooks/useApiQuery";

interface NewsStreamProps {
  onTickerClick: (ticker: string) => void;
}

export default function NewsStream({ onTickerClick }: NewsStreamProps) {
  const { data, loading, error } = useApiQuery<NewsItem[]>({
    refreshIntervalMs: 60000 * 5,
    request: async (signal) => {
      const response = await fetchApi<ApiSuccessPayload<NewsRouteResponse>>(
        "/api/news",
        { signal }
      );
      return Array.isArray(response.items) ? response.items.slice(0, 8) : [];
    },
  });

  const news = data || [];

  return (
    <WidgetWrapper
      title="INTELLIGENCE FEED"
      icon={<span className="material-symbols-outlined text-[#ccff00] text-base">rss_feed</span>}
      loading={loading}
      error={error}
    >
      <div className="flex flex-col gap-4 custom-scrollbar overflow-y-auto pr-2">
        {news.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center border border-white/5 bg-black/20 rounded-lg p-8">
             <span className="material-symbols-outlined text-[#a9abaf] text-3xl mb-2 opacity-20">cloud_off</span>
             <p className="text-[9px] font-mono text-[#a9abaf] uppercase tracking-widest text-center">Feed synchronized. Awaiting new signals.</p>
          </div>
        ) : (
          news.map((item, i) => (
            <div
              key={i}
              className="group bg-[#161a1e] border-l-2 border-white/5 hover:border-[#ccff00] p-4 rounded-r-lg hover:bg-[#22262b] transition-all"
            >
              <div className="flex justify-between items-start gap-4 mb-3">
                 <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#ccff00]" />
                    <span className="text-[10px] font-mono font-bold text-[#ccff00] uppercase tracking-widest">
                       {item.source?.title || "SIGNAL"}
                    </span>
                 </div>
                 <div className="flex flex-wrap gap-1 justify-end">
                    {item.currencies?.map((c, index: number) => (
                      <button
                        key={index}
                        onClick={() => onTickerClick(c.code)}
                        className="px-2 py-0.5 rounded bg-black/40 border border-[#ccff00]/20 text-[9px] font-black text-[#ccff00] hover:bg-[#ccff00] hover:text-black transition-all uppercase"
                      >
                        {c.code}
                      </button>
                    ))}
                 </div>
              </div>
              <p className="text-sm font-medium leading-relaxed text-[#f8f9fe]/90 group-hover:text-[#f8f9fe]">
                {item.title}
              </p>
            </div>
          ))
        )}
      </div>
    </WidgetWrapper>
  );
}

