import { OHLCVCandle } from '../types';

export async function fetchBinanceKlines(
  symbol = 'BTCUSDT',
  interval = '1d',
  limit = 1000
): Promise<OHLCVCandle[]> {
  const hosts = ['https://api.binance.com', 'https://api.binance.us'];

  for (const host of hosts) {
    try {
      const url = `${host}/api/v3/klines?symbol=${symbol}&interval=${interval}&limit=${limit}`;
      const res = await fetch(url, {
        headers: { 'User-Agent': 'Mozilla/5.0 (PEAK-Timing-Engine)' },
        next: { revalidate: 300 }, // cache for 5 min in Next.js
      });

      if (!res.ok) {
        continue;
      }

      const data = await res.json();
      if (!Array.isArray(data) || data.length === 0) {
        continue;
      }

      // Format: [openTime, open, high, low, close, volume, closeTime, quoteAssetVolume, numberOfTrades, ...]
      const candles: OHLCVCandle[] = data.map((item: any[]) => {
        const openTimeMs = Number(item[0]);
        const dateObj = new Date(openTimeMs);
        const isoDate = dateObj.toISOString().split('T')[0];

        return {
          time: isoDate,
          timestamp: openTimeMs,
          open: parseFloat(item[1]),
          high: parseFloat(item[2]),
          low: parseFloat(item[3]),
          close: parseFloat(item[4]),
          volume: parseFloat(item[5]),
        };
      });

      return candles;
    } catch {
      // Try next host
    }
  }

  console.error(`Failed to fetch Binance klines for ${symbol} across all endpoints`);
  return [];
}
