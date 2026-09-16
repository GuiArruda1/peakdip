import { fetchBinanceKlines } from './ingestion/binance';
import { fetchYahooFinanceCandles } from './ingestion/yahoo';
import { fetchCryptoFearAndGreed, fetchVixData } from './ingestion/sentiment';
import { computeAllIndicators } from './engine/indicators';
import { computeSeasonalityMatrix } from './engine/seasonality';
import { evaluateConvictionSnapshot } from './engine/signals';
import { runDipSignalBacktest } from './engine/backtest';
import { initializeDatabase, getDbPool, isDatabaseConnected } from './db';
import {
  OHLCVCandle,
  CalculatedIndicators,
  DipConvictionSnapshot,
  SeasonalityMatrixData,
  BacktestResult,
  SentimentData,
} from './types';

// In-memory cache to ensure responsive page loads and prevent rate limits
interface CachedAssetData {
  candles: OHLCVCandle[];
  indicators: CalculatedIndicators;
  sentiment: SentimentData | null;
  conviction: DipConvictionSnapshot | null;
  seasonality: SeasonalityMatrixData | null;
  backtest: BacktestResult | null;
  lastFetched: number;
}

const memoryCache: Record<string, CachedAssetData> = {};
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

export async function ensureDataReady(symbol: 'BTCUSDT' | 'SPY', forceSync = false): Promise<CachedAssetData> {
  const isCrypto = symbol.toUpperCase().includes('BTC');
  const cacheKey = symbol.toUpperCase();
  const cached = memoryCache[cacheKey];

  if (!forceSync && cached && Date.now() - cached.lastFetched < CACHE_TTL_MS) {
    return cached;
  }

  // Attempt database init if not done yet
  await initializeDatabase();

  // Ingest Candles
  let candles: OHLCVCandle[] = [];
  if (isCrypto) {
    candles = await fetchBinanceKlines('BTCUSDT', '1d', 1000);
  } else {
    candles = await fetchYahooFinanceCandles('SPY', '5y', '1d');
  }

  // Ingest Sentiment
  let sentiment: SentimentData | null = null;
  if (isCrypto) {
    const fng = await fetchCryptoFearAndGreed(30);
    sentiment = fng.length > 0 ? fng[0] : null;
  } else {
    const vix = await fetchVixData();
    sentiment = vix.length > 0 ? vix[vix.length - 1] : null;
  }

  // Compute Indicators
  const indicators = computeAllIndicators(candles);

  // Compute Seasonality
  const seasonality = computeSeasonalityMatrix(symbol, candles);

  // Compute Conviction & ML
  const sentimentVal = sentiment?.value ?? (isCrypto ? 50 : 18);
  const sentimentLabel = sentiment?.classification ?? (isCrypto ? 'Neutral' : 'Normal');
  const conviction = evaluateConvictionSnapshot(
    symbol,
    candles,
    indicators,
    sentimentVal,
    sentimentLabel
  );

  // Compute Backtest
  const backtest = runDipSignalBacktest(symbol, candles, indicators);

  const assetData: CachedAssetData = {
    candles,
    indicators,
    sentiment,
    conviction,
    seasonality,
    backtest,
    lastFetched: Date.now(),
  };

  memoryCache[cacheKey] = assetData;

  // Persist to PostgreSQL if connected
  if (isDatabaseConnected()) {
    try {
      const pool = getDbPool();
      if (pool && candles.length > 0) {
        // Save latest candles & latest signal snapshot
        const latestCandle = candles[candles.length - 1];
        await pool.query(
          `INSERT INTO signal_snapshots (
            time, asset_id, rsi_14, sma_200, sma_50, distance_to_sma200_pct,
            rolling_drawdown_zscore, fear_greed_val, ml_regime, ml_dip_success_prob,
            composite_dip_score, signal_label
          ) VALUES (
            $1, (SELECT id FROM assets WHERE symbol = $2), $3, $4, $5, $6, $7, $8, $9, $10, $11, $12
          ) ON CONFLICT (asset_id, time) DO UPDATE SET composite_dip_score = EXCLUDED.composite_dip_score;`,
          [
            latestCandle.time,
            symbol,
            conviction?.indicators.rsi14,
            conviction?.indicators.sma200,
            conviction?.indicators.sma50,
            conviction?.indicators.distToSma200Pct,
            conviction?.indicators.drawdownZScore,
            sentimentVal,
            conviction?.ml.regime,
            conviction?.ml.dipSuccessProb14d,
            conviction?.compositeScore,
            conviction?.signalLabel,
          ]
        );
      }
    } catch (e) {
      console.warn('PostgreSQL write skipped:', e);
    }
  }

  return assetData;
}

export async function getMarketData(symbol: 'BTCUSDT' | 'SPY') {
  const data = await ensureDataReady(symbol);

  // Format markers for historical dip buying triggers
  const markers: {
    time: string;
    position: 'belowBar' | 'aboveBar';
    color: string;
    shape: 'arrowUp' | 'circle';
    text: string;
  }[] = [];

  if (data.backtest?.recentTriggers) {
    const sortedTriggers = [...data.backtest.recentTriggers].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );
    for (const t of sortedTriggers) {
      markers.push({
        time: t.date,
        position: 'belowBar',
        color: '#10B981',
        shape: 'arrowUp',
        text: `DIP ${t.compositeScore}%`,
      });
    }
  }

  return {
    symbol,
    candles: data.candles,
    indicators: data.indicators,
    markers,
    conviction: data.conviction,
    seasonality: data.seasonality,
    backtest: data.backtest,
    lastFetched: data.lastFetched,
  };
}

export async function getCockpitData() {
  const [btcData, spyData] = await Promise.all([
    ensureDataReady('BTCUSDT'),
    ensureDataReady('SPY'),
  ]);

  return {
    btc: btcData.conviction,
    spy: spyData.conviction,
    lastSync: Math.max(btcData.lastFetched, spyData.lastFetched),
  };
}

export async function getSeasonalityData(symbol: 'BTCUSDT' | 'SPY') {
  const data = await ensureDataReady(symbol);
  return data.seasonality;
}

export async function getBacktestData(symbol: 'BTCUSDT' | 'SPY') {
  const data = await ensureDataReady(symbol);
  return data.backtest;
}

export async function syncAllData() {
  const [btc, spy] = await Promise.all([
    ensureDataReady('BTCUSDT', true),
    ensureDataReady('SPY', true),
  ]);
  return {
    status: 'success',
    btcCandles: btc.candles.length,
    spyCandles: spy.candles.length,
    timestamp: Date.now(),
  };
}
