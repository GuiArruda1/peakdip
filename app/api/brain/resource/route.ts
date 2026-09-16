import { NextRequest, NextResponse } from 'next/server';

// Alias mapping for common financial acronyms to Wikipedia page titles
const FINANCIAL_TERM_ALIASES: Record<string, string> = {
  's&p 500': 'S%26P_500',
  'sp500': 'S%26P_500',
  'sp 500': 'S%26P_500',
  'spy': 'SPDR_S%26P_500_Trust_ETF',
  'voo': 'Vanguard_500_Index_Fund',
  'bitcoin': 'Bitcoin',
  'btc': 'Bitcoin',
  'futures': 'Futures_contract',
  'emini': 'E-mini_S%26P_500',
  'e-mini': 'E-mini_S%26P_500',
  'mes': 'E-mini_S%26P_500',
  'options': 'Option_(finance)',
  '0dte': 'Option_(finance)',
  'margin': 'Margin_(finance)',
  'rsi': 'Relative_strength_index',
  'moving average': 'Moving_average',
  'vwap': 'Volume-weighted_average_price',
  'vix': 'VIX',
  'etf': 'Exchange-traded_fund',
  'short selling': 'Short_(finance)',
  'algorithmic trading': 'Algorithmic_trading',
  'stop loss': 'Stop-loss_order',
  'order book': 'Order_book',
  'technical analysis': 'Technical_analysis',
};

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const rawQuery = searchParams.get('query')?.trim() || 'S&P 500';

  const normalizedKey = rawQuery.toLowerCase();
  const wikiTitle =
    FINANCIAL_TERM_ALIASES[normalizedKey] ||
    encodeURIComponent(rawQuery.replace(/\s+/g, '_'));

  try {
    const wikiUrl = `https://en.wikipedia.org/api/rest_v1/page/summary/${wikiTitle}`;
    const res = await fetch(wikiUrl, {
      headers: {
        'User-Agent': 'PeakTradingTerminal/1.0 (https://peakdip.app; info@peakdip.app)',
        Accept: 'application/json',
      },
      next: { revalidate: 3600 }, // cache for 1 hour
    });

    if (res.ok) {
      const data = await res.json();
      return NextResponse.json({
        success: true,
        query: rawQuery,
        title: data.title,
        description: data.description || 'Financial / Market Concept',
        extract: data.extract,
        thumbnail: data.thumbnail?.source || null,
        url: data.content_urls?.desktop?.page || `https://en.wikipedia.org/wiki/${wikiTitle}`,
        source: 'Wikipedia Financial Knowledge API',
      });
    }

    // If direct title 404s, attempt Wikipedia search API
    const searchUrl = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(
      rawQuery + ' finance trading'
    )}&format=json&origin=*`;

    const searchRes = await fetch(searchUrl, {
      headers: {
        'User-Agent': 'PeakTradingTerminal/1.0 (https://peakdip.app; info@peakdip.app)',
      },
    });

    if (searchRes.ok) {
      const searchData = await searchRes.json();
      const firstHit = searchData.query?.search?.[0];

      if (firstHit) {
        // Fetch summary of the first search hit
        const hitRes = await fetch(
          `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(
            firstHit.title.replace(/\s+/g, '_')
          )}`,
          {
            headers: {
              'User-Agent': 'PeakTradingTerminal/1.0 (https://peakdip.app; info@peakdip.app)',
            },
          }
        );

        if (hitRes.ok) {
          const hitData = await hitRes.json();
          return NextResponse.json({
            success: true,
            query: rawQuery,
            title: hitData.title,
            description: hitData.description || 'Financial / Market Concept',
            extract: hitData.extract,
            thumbnail: hitData.thumbnail?.source || null,
            url: hitData.content_urls?.desktop?.page || null,
            source: 'Wikipedia Financial Knowledge Search API',
          });
        }
      }
    }

    return NextResponse.json({
      success: false,
      query: rawQuery,
      message: `No public Wikipedia financial entry found for "${rawQuery}". Try terms like S&P 500, SPY, Futures, Margin, or Options.`,
    });
  } catch (error) {
    console.error('Error fetching brain resource API:', error);
    return NextResponse.json(
      {
        success: false,
        query: rawQuery,
        error: 'Failed to fetch knowledge resource from external API.',
      },
      { status: 500 }
    );
  }
}
