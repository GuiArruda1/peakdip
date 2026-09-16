'use client';

import React, { useEffect, useState } from 'react';
import { LiveNewsItem } from '@/lib/ingestion/news';
import { ExternalLink } from 'lucide-react';

export default function LiveNewsTicker() {
  const [news, setNews] = useState<LiveNewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPaused, setIsPaused] = useState(false);

  const fetchNews = async () => {
    try {
      const res = await fetch('/api/news');
      if (res.ok) {
        const json = await res.json();
        if (json.news && json.news.length > 0) {
          setNews(json.news);
        }
      }
    } catch (err) {
      console.warn('Failed to load market news ticker:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNews();

    // Auto-refresh news headlines every 60,000ms (1 minute)
    const interval = setInterval(fetchNews, 60000);
    return () => clearInterval(interval);
  }, []);

  if (news.length === 0 && !loading) {
    return null;
  }

  // Duplicate items to ensure seamless infinite looping marquee
  const tickerItems = [...news, ...news];

  return (
    <div className="fixed bottom-14 sm:bottom-0 left-0 right-0 z-30 bg-[#06080E]/95 backdrop-blur-md border-t border-slate-800/90 h-9 sm:h-10 flex items-center shadow-2xl overflow-hidden select-none">
      {/* Fixed Left Live Badge */}
      <div className="flex items-center gap-2 px-3 bg-[#090D16] border-r border-slate-800/90 h-full z-20 shrink-0 shadow-md">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-500 opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500" />
        </span>
        <span className="font-mono text-[10px] sm:text-[11px] font-black tracking-wider text-white flex items-center gap-1">
          <span>LIVE</span>
          <span className="text-rose-400">WIRE</span>
        </span>
        <span className="hidden md:inline-block px-1.5 py-0.2 rounded text-[8px] font-mono font-bold bg-slate-800 text-slate-400">
          CRYPTO & S&P 500
        </span>
      </div>

      {/* Infinite Horizontal Scrolling Track */}
      <div
        className="flex-1 overflow-hidden relative flex items-center h-full"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onTouchStart={() => setIsPaused(true)}
        onTouchEnd={() => setIsPaused(false)}
        title="Hover or tap to pause"
      >
        {/* Soft edge gradient fades */}
        <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-6 sm:w-10 bg-gradient-to-r from-[#06080E] to-transparent z-10" />
        <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-6 sm:w-10 bg-gradient-to-l from-[#06080E] to-transparent z-10" />

        {/* Marquee Elements */}
        <div
          className="animate-marquee flex items-center gap-8 whitespace-nowrap pl-4"
          style={{
            animationPlayState: isPaused ? 'paused' : 'running',
            animationDuration: '220s',
          }}
        >
          {tickerItems.map((item, index) => {
            const isBullish = item.sentiment === 'BULLISH';
            const isBearish = item.sentiment === 'BEARISH';

            return (
              <a
                key={`${item.id}-${index}`}
                href={item.link}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 group hover:opacity-100 transition-opacity py-1"
                title={`${item.title} — Source: ${item.publisher} (${item.publishedAt})`}
              >
                {/* Category Badge */}
                <span
                  className={`px-1.5 py-0.5 rounded text-[9px] font-mono font-black uppercase tracking-wider border ${
                    item.category === 'CRYPTO'
                      ? 'bg-amber-950/70 border-amber-600/50 text-amber-300'
                      : item.category === 'TECH'
                      ? 'bg-emerald-950/70 border-emerald-600/50 text-emerald-300'
                      : item.category === 'MACRO'
                      ? 'bg-purple-950/70 border-purple-600/50 text-purple-300'
                      : 'bg-blue-950/70 border-blue-600/50 text-blue-300'
                  }`}
                >
                  {item.category}
                </span>

                {/* Sentiment Dot */}
                <span
                  className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                    isBullish ? 'bg-emerald-400' : isBearish ? 'bg-rose-400' : 'bg-slate-400'
                  }`}
                />

                {/* Headline Text */}
                <span className="font-mono text-[11px] sm:text-xs text-slate-200 group-hover:text-white group-hover:underline underline-offset-2 transition-colors">
                  {item.title}
                </span>

                {/* Source & Timestamp */}
                <span className="text-[10px] text-slate-400 font-sans flex items-center gap-1 shrink-0">
                  <span>•</span>
                  <span>{item.publisher}</span>
                  <span className="text-slate-400 font-mono">({item.publishedAt})</span>
                </span>

                <ExternalLink className="w-3 h-3 text-slate-400 group-hover:text-cyan-400 transition-colors ml-0.5" />
              </a>
            );
          })}
        </div>
      </div>
    </div>
  );
}
