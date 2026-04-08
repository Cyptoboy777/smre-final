'use client';

import { Signal } from 'lucide-react';
import WidgetWrapper from '../WidgetWrapper';
import { type NewsItem } from '@/lib/crypto-dashboard';
import { fetchApi } from '@/lib/client/api-client';
import { type ApiSuccessPayload, type NewsRouteResponse } from '@/lib/api';
import { useApiQuery } from '@/hooks/useApiQuery';

interface NewsStreamProps {
    onTickerClick: (ticker: string) => void;
}

export default function NewsStream({ onTickerClick }: NewsStreamProps) {
    const { data, loading, error } = useApiQuery<NewsItem[]>({
        refreshIntervalMs: 60000 * 5,
        request: async (signal) => {
            const response = await fetchApi<ApiSuccessPayload<NewsRouteResponse>>('/api/news', { signal });
            return Array.isArray(response.items) ? response.items.slice(0, 8) : [];
        },
    });

    const news = data || [];

    return (
        <WidgetWrapper
            title="INTELLIGENCE FEED"
            icon={<Signal className="w-3 h-3 text-secondary" />}
            loading={loading}
            error={error}
        >
            <div className="flex flex-col gap-3 custom-scrollbar overflow-y-auto pr-2">
                {news.length === 0 ? (
                    <div className="flex-1 flex items-center justify-center rounded-xl border border-white/5 bg-white/[0.02] text-[9px] font-mono text-white/30 uppercase tracking-widest text-center px-4">
                        News feed is temporarily quiet
                    </div>
                ) : (
                    news.map((item, i) => (
                        <div key={i} className="group p-3 border border-white/5 rounded-xl hover:bg-white/5 bg-white/[0.01] transition-all cursor-default">
                            <div className="flex justify-between items-start gap-2 mb-2">
                                <span className="text-[8px] font-mono text-white/30 uppercase tracking-widest">{item.source?.title || 'NEWS'}</span>
                                <div className="flex gap-1">
                                    {item.currencies?.map((c, index: number) => (
                                        <button 
                                            key={index}
                                            onClick={() => onTickerClick(c.code)}
                                            className="px-2 py-0.5 rounded-full bg-primary/10 border border-primary/20 text-[9px] font-bold text-primary hover:bg-primary hover:text-black transition-all"
                                        >
                                            {c.code}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <p className="text-xs font-medium text-white/80 leading-snug group-hover:text-white transition-colors">
                                {item.title}
                            </p>
                        </div>
                    ))
                )}
            </div>
        </WidgetWrapper>
    );
}
