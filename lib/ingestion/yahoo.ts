import { OHLCVCandle } from '../types';

export async function fetchYahooFinanceCandles(
  symbol = 'SPY',
  range = '5y',
  interval = '1d'
): Promise<OHLCVCandle[]> {
  const hosts = ['https://query2.finance.yahoo.com', 'https://query1.finance.yahoo.com'];

  for (const host of hosts) {
    try {
      const encodedSymbol = encodeURIComponent(symbol);
      const url = `${host}/v8/finance/chart/${encodedSymbol}?interval=${interval}&range=${range}`;

      const res = await fetch(url, {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
          Accept: '*/*',
        },
        next: { revalidate: 300 },
      });

      if (!res.ok) {
        continue;
      }

      const json = await res.json();
      const result = json?.chart?.result?.[0];
      if (!result || !result.timestamp || !result.indicators?.quote?.[0]) {
        continue;
      }

      const timestamps: number[] = result.timestamp;
      const quotes = result.indicators.quote[0];
      const opens = quotes.open;
      const highs = quotes.high;
      const lows = quotes.low;
      const closes = quotes.close;
      const volumes = quotes.volume;

      const candles: OHLCVCandle[] = [];

      for (let i = 0; i < timestamps.length; i++) {
        const open = opens[i];
        const high = highs[i];
        const low = lows[i];
        const close = closes[i];
        const volume = volumes ? volumes[i] || 0 : 0;

        if (
          close !== null &&
          close !== undefined &&
          open !== null &&
          high !== null &&
          low !== null &&
          !isNaN(close)
        ) {
          const dateObj = new Date(timestamps[i] * 1000);
          const isoDate = dateObj.toISOString().split('T')[0];

          candles.push({
            time: isoDate,
            timestamp: timestamps[i] * 1000,
            open: Number(open.toFixed(2)),
            high: Number(high.toFixed(2)),
            low: Number(low.toFixed(2)),
            close: Number(close.toFixed(2)),
            volume: Math.round(volume),
          });
        }
      }

      if (candles.length > 0) {
        return candles;
      }
    } catch (err) {
      console.warn(`Attempt with ${host} failed for ${symbol}:`, err);
    }
  }

  console.error(`Failed to fetch Yahoo Finance candles for ${symbol} across all endpoints.`);
  return [];
}
