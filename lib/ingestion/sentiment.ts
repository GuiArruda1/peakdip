import { SentimentData } from '../types';

export async function fetchCryptoFearAndGreed(limit = 365): Promise<SentimentData[]> {
  try {
    const url = `https://api.alternative.me/fng/?limit=${limit}`;
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (PEAK-Timing-Engine)' },
      next: { revalidate: 1800 },
    });

    if (!res.ok) {
      throw new Error(`Alternative.me API error: ${res.status}`);
    }

    const json = await res.json();
    if (!json?.data || !Array.isArray(json.data)) {
      return [];
    }

    return json.data.map((item: any) => {
      const dateObj = new Date(Number(item.timestamp) * 1000);
      const isoDate = dateObj.toISOString().split('T')[0];

      return {
        time: isoDate,
        indicatorCode: 'CRYPTO_FEAR_GREED',
        value: Number(item.value),
        classification: item.value_classification,
      };
    });
  } catch (err) {
    console.error('Failed to fetch Crypto Fear & Greed Index:', err);
    return [];
  }
}

export async function fetchVixData(): Promise<SentimentData[]> {
  const hosts = ['https://query2.finance.yahoo.com', 'https://query1.finance.yahoo.com'];

  for (const host of hosts) {
    try {
      const url = `${host}/v8/finance/chart/%5EVIX?interval=1d&range=2y`;
      const res = await fetch(url, {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
          Accept: '*/*',
        },
        next: { revalidate: 900 },
      });

      if (!res.ok) continue;

      const json = await res.json();
      const result = json?.chart?.result?.[0];
      if (!result?.timestamp || !result?.indicators?.quote?.[0]?.close) continue;

      const timestamps: number[] = result.timestamp;
      const closes: (number | null)[] = result.indicators.quote[0].close;

      const data: SentimentData[] = [];
      for (let i = 0; i < timestamps.length; i++) {
        const close = closes[i];
        if (close !== null && close !== undefined && !isNaN(close)) {
          const isoDate = new Date(timestamps[i] * 1000).toISOString().split('T')[0];
          let classification = 'Normal';
          if (close >= 35) classification = 'Extreme Panic Spike';
          else if (close >= 30) classification = 'High Volatility Spike';
          else if (close <= 14) classification = 'Complacency / Low Vol';

          data.push({
            time: isoDate,
            indicatorCode: 'CBOE_VIX',
            value: Number(close.toFixed(2)),
            classification,
          });
        }
      }

      if (data.length > 0) return data;
    } catch (err) {
      console.warn(`VIX fetch attempt with ${host} failed:`, err);
    }
  }

  console.error('Failed to fetch VIX data across all hosts.');
  return [];
}
