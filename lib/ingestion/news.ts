export interface LiveNewsItem {
  id: string;
  title: string;
  publisher: string;
  link: string;
  publishedAt: string; // e.g. "12m ago"
  category: 'CRYPTO' | 'SP500' | 'MACRO' | 'TECH';
  sentiment: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
}

const BULLISH_KEYWORDS = [
  'surge', 'surges', 'rally', 'rallies', 'jumps', 'jump', 'gains', 'gain',
  'high', 'highs', 'inflow', 'inflows', 'bull', 'bullish', 'rebound', 'soar',
  'explodes', 'record', 'outperform', 'beat', 'buying', 'accumulate',
];

const BEARISH_KEYWORDS = [
  'slump', 'slumps', 'plunge', 'plunges', 'drop', 'drops', 'fall', 'falls',
  'slide', 'slides', 'tumble', 'tumbles', 'down', 'loss', 'losses', 'bear',
  'bearish', 'cut', 'cuts', 'warning', 'probe', 'crash', 'liquidat',
];

function classifySentiment(title: string): 'BULLISH' | 'BEARISH' | 'NEUTRAL' {
  const lower = title.toLowerCase();
  let bullCount = 0;
  let bearCount = 0;

  for (const w of BULLISH_KEYWORDS) {
    if (lower.includes(w)) bullCount++;
  }
  for (const w of BEARISH_KEYWORDS) {
    if (lower.includes(w)) bearCount++;
  }

  if (bullCount > bearCount) return 'BULLISH';
  if (bearCount > bullCount) return 'BEARISH';
  return 'NEUTRAL';
}

function classifyCategory(title: string): 'CRYPTO' | 'SP500' | 'MACRO' | 'TECH' {
  const lower = title.toLowerCase();
  if (
    lower.includes('bitcoin') ||
    lower.includes('btc') ||
    lower.includes('crypto') ||
    lower.includes('ether') ||
    lower.includes('solana') ||
    lower.includes('altcoin') ||
    lower.includes('coin')
  ) {
    return 'CRYPTO';
  }
  if (
    lower.includes('fed') ||
    lower.includes('rate') ||
    lower.includes('inflation') ||
    lower.includes('cpi') ||
    lower.includes('jobs') ||
    lower.includes('yield') ||
    lower.includes('treasury')
  ) {
    return 'MACRO';
  }
  if (
    lower.includes('nvidia') ||
    lower.includes('nvda') ||
    lower.includes('apple') ||
    lower.includes('aapl') ||
    lower.includes('microsoft') ||
    lower.includes('msft') ||
    lower.includes('meta') ||
    lower.includes('ai') ||
    lower.includes('semiconductor')
  ) {
    return 'TECH';
  }
  return 'SP500';
}

function formatRelativeTime(secondsAgo: number): string {
  if (secondsAgo < 60) return 'Just now';
  const mins = Math.floor(secondsAgo / 60);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

// Fallback high-impact market headlines
const FALLBACK_NEWS: LiveNewsItem[] = [
  {
    id: 'fb-1',
    title: 'Bitcoin Institutional Inflows Accelerate as Global ETF Holdings Cross $75 Billion',
    publisher: 'Bloomberg Markets',
    link: 'https://finance.yahoo.com',
    publishedAt: '5m ago',
    category: 'CRYPTO',
    sentiment: 'BULLISH',
  },
  {
    id: 'fb-2',
    title: 'S&P 500 Tests Key 50-Day Moving Average Ahead of Upcoming Federal Reserve Rate Decision',
    publisher: 'Reuters',
    link: 'https://finance.yahoo.com',
    publishedAt: '12m ago',
    category: 'SP500',
    sentiment: 'NEUTRAL',
  },
  {
    id: 'fb-3',
    title: 'NVIDIA Hardware Demand Remains Robust as Cloud Providers Expand Next-Gen AI Infrastructure',
    publisher: 'Wall Street Journal',
    link: 'https://finance.yahoo.com',
    publishedAt: '18m ago',
    category: 'TECH',
    sentiment: 'BULLISH',
  },
  {
    id: 'fb-4',
    title: 'Treasury Yields Stabilize as Inflation Expectations Cool Across Intermediate Curves',
    publisher: 'Financial Times',
    link: 'https://finance.yahoo.com',
    publishedAt: '25m ago',
    category: 'MACRO',
    sentiment: 'BULLISH',
  },
  {
    id: 'fb-5',
    title: 'Crypto Derivative Open Interest Signals Volatility Spike Ahead of Weekend Liquidity Window',
    publisher: 'CoinDesk',
    link: 'https://finance.yahoo.com',
    publishedAt: '32m ago',
    category: 'CRYPTO',
    sentiment: 'NEUTRAL',
  },
];

let cachedNews: LiveNewsItem[] = [];
let lastFetchTime = 0;
const CACHE_TTL_MS = 60 * 1000; // 1 minute

export async function fetchLiveMarketNews(): Promise<LiveNewsItem[]> {
  const now = Date.now();
  if (cachedNews.length > 0 && now - lastFetchTime < CACHE_TTL_MS) {
    return cachedNews;
  }

  try {
    const queries = ['Bitcoin', 'SPY,SP500'];
    const items: LiveNewsItem[] = [];
    const seenTitles = new Set<string>();

    await Promise.all(
      queries.map(async (q) => {
        try {
          const url = `https://query2.finance.yahoo.com/v1/finance/search?q=${encodeURIComponent(q)}&newsCount=15`;
          const res = await fetch(url, {
            headers: {
              'User-Agent':
                'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
              Accept: '*/*',
            },
            next: { revalidate: 60 },
          });

          if (!res.ok) return;
          const json = await res.json();
          const newsList = json.news || [];

          for (const item of newsList) {
            if (!item.title || seenTitles.has(item.title)) continue;
            seenTitles.add(item.title);

            const pubTimeSeconds = item.providerPublishTime
              ? Math.floor((now - item.providerPublishTime * 1000) / 1000)
              : 300;

            items.push({
              id: item.uuid || `news-${Math.random().toString(36).substring(2, 9)}`,
              title: item.title,
              publisher: item.publisher || 'Market Wire',
              link: item.link || 'https://finance.yahoo.com',
              publishedAt: formatRelativeTime(Math.max(0, pubTimeSeconds)),
              category: classifyCategory(item.title),
              sentiment: classifySentiment(item.title),
            });
          }
        } catch (err) {
          console.warn(`[News Ingestion] Failed to fetch query ${q}:`, err);
        }
      })
    );

    if (items.length > 0) {
      cachedNews = items;
      lastFetchTime = now;
      return items;
    }
  } catch (err) {
    console.error('[News Ingestion] Global error:', err);
  }

  // Fallback if network fails
  return FALLBACK_NEWS;
}
