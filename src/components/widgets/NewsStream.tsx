'use client';

import { useEffect, useState } from 'react';
import { Signal } from 'lucide-react';
import WidgetWrapper from '../WidgetWrapper';
import { type NewsItem } from '@/lib/crypto-dashboard';

interface NewsStreamProps {
    onTickerClick: (ticker: string) => void;
}

export default function NewsStream({ onTickerClick }: NewsStreamProps) {
    const [news, setNews] = useState<NewsItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchNews = async () => {
        try {
            const res = await fetch('/api/news');
            const data = await res.json();
            if (!data?.success) {
                throw new Error(data?.error || 'Unable to load CryptoPanic news');
            }

            setNews(Array.isArray(data.items) ? data.items.slice(0, 8) : []);
            setError(null);
        } catch (fetchError: any) {
            setError(fetchError?.message || 'Unable to load CryptoPanic news');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNews();
        const interval = setInterval(fetchNews, 60000 * 5); // 5 min news check
        return () => clearInterval(interval);
    }, []);

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
