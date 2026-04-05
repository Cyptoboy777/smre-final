'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import WidgetWrapper from './WidgetWrapper';
import { Newspaper } from 'lucide-react';

interface NewsFeedWidgetProps {
    onKeywordSelect: (keyword: string) => void;
}

export default function NewsFeedWidget({ onKeywordSelect }: NewsFeedWidgetProps) {
    const [news, setNews] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let mounted = true;
        const fetchNews = async () => {
            try {
                const res = await axios.get('https://min-api.cryptocompare.com/data/v2/news/?lang=EN');
                const newsData = res.data.Data.slice(0, 15); // Get more for the feed
                if (mounted) {
                    setNews(newsData);
                    setLoading(false);
                }
            } catch (err) {
                console.error("Failed to fetch news", err);
                if (mounted) {
                    // Fallback Mock Data
                    setNews([
                        { title: "Bitcoin breaks $60k resistance level as ETFs see record inflow.", categories: "BTC|Market" },
                        { title: "Vitalik Buterin proposes new gas fee structure for Ethereum L2s.", categories: "ETH|Technology" },
                        { title: "Solana network congestion eases after patch deployment.", categories: "SOL|Update" },
                        { title: "BlackRock CEO says crypto is 'digital gold'.", categories: "BTC|Institutions" },
                        { title: "Regulatory clarity coming to US stablecoin market.", categories: "USDC|USDT|Regulation" }
                    ]);
                    setLoading(false);
                }
            }
        };

        fetchNews();
        // News updates less frequently
        const interval = setInterval(fetchNews, 300000); // 5 minutes
        return () => { mounted = false; clearInterval(interval); };
    }, []);

    // A simple function to extract a token symbol from categories or title to click on
    const handleNewsClick = (item: any) => {
        // Try to find a known ticker from the categories (E.g. "BTC|Market" -> "BTC")
        const possibleTokens = item.categories ? item.categories.split('|') : [];
        const mainToken = possibleTokens.find((t: string) => t.length <= 4 && t === t.toUpperCase());

        if (mainToken) {
            onKeywordSelect(mainToken);
        } else {
            // If no clear token, try to grab the first word of the title as a search term
            const firstWord = item.title.split(' ')[0].replace(/[^a-zA-Z0-9]/g, '');
            if (firstWord) onKeywordSelect(firstWord);
        }
    };

    return (
        <WidgetWrapper title="INTELLIGENCE FEED" icon={<Newspaper className="w-4 h-4" />} loading={loading} error={error} className="min-h-[400px]">
            <div className="flex flex-col space-y-3 pr-2">
                {news.map((item, i) => (
                    <div
                        key={i}
                        className="group flex flex-col p-3 bg-white/5 hover:bg-white/10 rounded-lg border border-transparent hover:border-magenta-500/30 transition-all cursor-pointer"
                        onClick={() => handleNewsClick(item)}
                    >
                        <span className="text-xs font-mono text-magenta-400 mb-1 drop-shadow-[0_0_5px_rgba(255,0,236,0.3)]">
                            &gt; {item.source_info?.name || "Global Stream"}
                        </span>
                        <p className="text-sm text-zinc-300 leading-snug group-hover:text-cyan-100 transition-colors">
                            {item.title}
                        </p>
                    </div>
                ))}
            </div>
        </WidgetWrapper>
    );
}
