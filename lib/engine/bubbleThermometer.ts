import { fetchYahooFinanceCandles } from '../ingestion/yahoo';
import { calculateRSI, calculateSMA } from './indicators';
import {
  BubbleThermometerPayload,
  TechShareThermometer,
  BubbleTemperatureZone,
  AIDecisionAction,
  OHLCVCandle,
} from '../types';

interface TechStockConfig {
  symbol: string;
  name: string;
  baselinePrice: number;
}

const TECH_SHARES: TechStockConfig[] = [
  { symbol: 'NVDA', name: 'NVIDIA Corporation', baselinePrice: 118.5 },
  { symbol: 'AAPL', name: 'Apple Inc.', baselinePrice: 224.2 },
  { symbol: 'MSFT', name: 'Microsoft Corporation', baselinePrice: 428.6 },
  { symbol: 'AMZN', name: 'Amazon.com Inc.', baselinePrice: 187.3 },
  { symbol: 'GOOGL', name: 'Alphabet Inc.', baselinePrice: 165.4 },
  { symbol: 'META', name: 'Meta Platforms Inc.', baselinePrice: 512.8 },
  { symbol: 'TSLA', name: 'Tesla Inc.', baselinePrice: 219.1 },
  { symbol: 'AMD', name: 'Advanced Micro Devices', baselinePrice: 146.7 },
  { symbol: 'AVGO', name: 'Broadcom Inc.', baselinePrice: 158.9 },
];

let cachedPayload: BubbleThermometerPayload | null = null;
let lastCacheTime = 0;
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

/**
 * Generate fallback candles if Yahoo Finance rate-limits or fails
 */
function generateFallbackCandles(symbol: string, basePrice: number, days = 250): OHLCVCandle[] {
  const candles: OHLCVCandle[] = [];
  const now = Date.now();
  const dayMs = 86400000;
  let price = basePrice * 0.82;

  // Predictable pseudo-random trend based on symbol
  const seed = symbol.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);

  for (let i = days; i >= 0; i--) {
    const time = new Date(now - i * dayMs).toISOString().split('T')[0];
    const wave = Math.sin((i + seed) / 14) * 0.015;
    const noise = (((i * 9301 + 49297) % 233280) / 233280 - 0.48) * 0.02;
    const dailyReturn = 0.0008 + wave + noise;
    const open = price;
    price = Math.max(10, price * (1 + dailyReturn));
    const high = Math.max(open, price) * (1 + Math.abs(noise) * 0.5);
    const low = Math.min(open, price) * (1 - Math.abs(noise) * 0.5);
    const close = price;
    const volume = Math.floor(10000000 + Math.abs(noise) * 50000000);

    candles.push({
      time,
      timestamp: now - i * dayMs,
      open: Number(open.toFixed(2)),
      high: Number(high.toFixed(2)),
      low: Number(low.toFixed(2)),
      close: Number(close.toFixed(2)),
      volume,
    });
  }

  return candles;
}

/**
 * Evaluates individual tech share's bubble score, zone, and AI trading decision
 */
function evaluateShareThermometer(
  symbol: string,
  name: string,
  candles: OHLCVCandle[]
): TechShareThermometer {
  if (candles.length < 30) {
    candles = generateFallbackCandles(symbol, 150);
  }

  const latest = candles[candles.length - 1];
  const previous = candles[candles.length - 2] || latest;
  const currentPrice = latest.close;
  const priceChange24h = Number(
    (((currentPrice - previous.close) / previous.close) * 100).toFixed(2)
  );

  // Indicators
  const rsiSeries = calculateRSI(candles, 14);
  const latestRsiObj = rsiSeries[rsiSeries.length - 1];
  const rsi14 = latestRsiObj ? latestRsiObj.value : 50;

  const sma200Series = calculateSMA(candles, Math.min(200, candles.length));
  const latestSma200 = sma200Series[sma200Series.length - 1]?.value ?? currentPrice * 0.9;

  const sma50Series = calculateSMA(candles, Math.min(50, candles.length));
  const latestSma50 = sma50Series[sma50Series.length - 1]?.value ?? currentPrice * 0.95;

  const distanceToSma200Pct = Number(
    (((currentPrice - latestSma200) / latestSma200) * 100).toFixed(2)
  );
  const distanceToSma50Pct = Number(
    (((currentPrice - latestSma50) / latestSma50) * 100).toFixed(2)
  );

  // 52-week High Drawdown
  const sliceYear = candles.slice(-252);
  const high52w = Math.max(...sliceYear.map((c) => c.high));
  const drawdown52wPct = Number((((currentPrice - high52w) / high52w) * 100).toFixed(2));

  // 90-day Rate-of-Change Velocity
  const candle90dAgo = candles[Math.max(0, candles.length - 65)] || candles[0];
  const velocity90dPct = Number(
    (((currentPrice - candle90dAgo.close) / candle90dAgo.close) * 100).toFixed(2)
  );

  // --- COMPOSITE BUBBLE TEMPERATURE CALCULATION (0° to 100°) ---
  // Factor 1: 200-SMA Overextension (Weight 35%)
  // -15% = 0 pts; 0% = 12 pts; +15% = 24 pts; +35% = 35 pts
  const smaScore = Math.min(35, Math.max(0, ((distanceToSma200Pct + 15) / 50) * 35));

  // Factor 2: RSI Heat (Weight 25%)
  // RSI 25 = 0 pts; RSI 50 = 12.5 pts; RSI 80 = 25 pts
  const rsiScore = Math.min(25, Math.max(0, ((rsi14 - 25) / 55) * 25));

  // Factor 3: 52-Week High Proximity (Weight 20%)
  // -30% drawdown = 0 pts; 0% ATH = 20 pts
  const athScore = Math.min(20, Math.max(0, ((drawdown52wPct + 30) / 30) * 20));

  // Factor 4: 90-Day Velocity (Weight 20%)
  // -15% = 0 pts; +35% = 20 pts
  const velScore = Math.min(20, Math.max(0, ((velocity90dPct + 15) / 50) * 20));

  const rawTemp = Math.round(smaScore + rsiScore + athScore + velScore);
  const temperature = Math.min(100, Math.max(0, rawTemp));

  // Determine Temperature Zone
  let zone: BubbleTemperatureZone = 'TEMPERATE';
  let zoneLabel = 'Temperate / Fair Value';
  let zoneColor = '#38BDF8'; // Cyan
  let action: AIDecisionAction = 'HOLD_MOMENTUM';
  let actionLabel = 'HOLD MOMENTUM';
  let actionColor = '#38BDF8';
  let rationale: string[] = [];

  if (temperature <= 25) {
    zone = 'FREEZING_DIP';
    zoneLabel = 'Freezing Value Dip';
    zoneColor = '#10B981'; // Emerald
    action = 'STRONG_BUY_DIP';
    actionLabel = 'STRONG BUY DIP';
    actionColor = '#10B981';
    rationale = [
      `Extreme capitulation discount. Trading ${Math.abs(distanceToSma200Pct)}% below or near 200-SMA baseline ($${latestSma200.toFixed(2)}).`,
      `Oversold momentum exhaustion (RSI ${rsi14}). Low asymmetric downside risk.`,
      `Prime institutional reload accumulation zone. Optimal risk-to-reward window.`,
    ];
  } else if (temperature <= 50) {
    zone = 'COOL_VALUE';
    zoneLabel = 'Cool / Healthy Pullback';
    zoneColor = '#06B6D4'; // Light cyan
    action = 'ACCUMULATE';
    actionLabel = 'ACCUMULATE VALUE';
    actionColor = '#06B6D4';
    rationale = [
      `Healthy mean-reversion pullback. Testing intermediate support near 50-SMA ($${latestSma50.toFixed(2)}).`,
      `Moderate RSI (${rsi14}) allows room for upward trend resumption without bubble froth.`,
      `Place staggered dollar-cost average bids near the 200-SMA support.`,
    ];
  } else if (temperature <= 74) {
    zone = 'TEMPERATE';
    zoneLabel = 'Temperate / Trend Continuation';
    zoneColor = '#3B82F6'; // Blue
    action = 'HOLD_MOMENTUM';
    actionLabel = 'HOLD WITH TRAIL STOP';
    actionColor = '#3B82F6';
    rationale = [
      `Balanced institutional trend continuation. Price is holding comfortably above 200-SMA (+${distanceToSma200Pct}%).`,
      `RSI (${rsi14}) in healthy momentum territory. Avoid chasing fresh breakout buys here.`,
      `Maintain existing long positions with a trailing stop-loss under the 50-SMA ($${latestSma50.toFixed(2)}).`,
    ];
  } else if (temperature <= 89) {
    zone = 'WARM_FROTH';
    zoneLabel = 'Warm / Extended Froth';
    zoneColor = '#F59E0B'; // Amber
    action = 'TAKE_PROFIT';
    actionLabel = 'TRIM PROFITS / TIGHTEN STOPS';
    actionColor = '#F59E0B';
    rationale = [
      `Extended overbought valuation. Trading +${distanceToSma200Pct}% stretched above the macro 200-SMA.`,
      `Elevated RSI (${rsi14}) signals momentum exhaustion and heightened vulnerability to macro pullbacks.`,
      `Lock in partial profits (25%-50% size) and raise stop-losses tightly to protect capital.`,
    ];
  } else {
    zone = 'BOILING_BUBBLE';
    zoneLabel = 'Boiling Bubble / Parabolic Froth';
    zoneColor = '#EF4444'; // Red
    action = 'BUBBLE_CAUTION';
    actionLabel = 'EXTREME BUBBLE CAUTION';
    actionColor = '#EF4444';
    rationale = [
      `Parabolic euphoria warning! Severe overextension (+${distanceToSma200Pct}%) above 200-day baseline.`,
      `Overheated RSI (${rsi14}) and extreme momentum velocity (+${velocity90dPct}% over 90d).`,
      `High-probability mean reversion drop expected. Avoid initiating new longs; hedge with protective puts.`,
    ];
  }

  // Exact Invalidation Stop-Loss & Target Calculations
  const invalidationPrice = Number(
    (action === 'STRONG_BUY_DIP' || action === 'ACCUMULATE'
      ? Math.min(currentPrice * 0.94, latestSma200 * 0.97)
      : latestSma50 * 0.98
    ).toFixed(2)
  );

  const targetPrice1 = Number(
    (action === 'STRONG_BUY_DIP' || action === 'ACCUMULATE'
      ? currentPrice * 1.08
      : currentPrice * 1.04
    ).toFixed(2)
  );

  const targetPrice2 = Number(
    (action === 'STRONG_BUY_DIP' || action === 'ACCUMULATE'
      ? high52w * 1.02
      : currentPrice * 1.12
    ).toFixed(2)
  );

  return {
    symbol,
    name,
    currentPrice,
    priceChange24h,
    temperature,
    zone,
    zoneLabel,
    zoneColor,
    distanceToSma200Pct,
    distanceToSma50Pct,
    rsi14,
    drawdown52wPct,
    velocity90dPct,
    decision: {
      action,
      label: actionLabel,
      color: actionColor,
      invalidationPrice,
      targetPrice1,
      targetPrice2,
      rationale,
    },
  };
}

/**
 * Main function that evaluates all S&P 500 tech shares and sector macro temperature
 */
export async function getBubbleThermometerPayload(forceSync = false): Promise<BubbleThermometerPayload> {
  const now = Date.now();
  if (!forceSync && cachedPayload && now - lastCacheTime < CACHE_TTL_MS) {
    return cachedPayload;
  }

  const shares: TechShareThermometer[] = [];

  // Concurrently fetch candles and compute for all 9 tech shares
  await Promise.all(
    TECH_SHARES.map(async (stock) => {
      let candles: OHLCVCandle[] = [];
      try {
        candles = await fetchYahooFinanceCandles(stock.symbol, '1y', '1d');
      } catch (err) {
        console.warn(`[BubbleThermometer] Yahoo fetch failed for ${stock.symbol}, using synthetic baseline.`);
      }

      if (!candles || candles.length === 0) {
        candles = generateFallbackCandles(stock.symbol, stock.baselinePrice);
      }

      const analyzed = evaluateShareThermometer(stock.symbol, stock.name, candles);
      shares.push(analyzed);
    })
  );

  // Sort descending by temperature (most overheated first)
  shares.sort((a, b) => b.temperature - a.temperature);

  // Compute aggregate Sector Macro Temperature
  const avgTemp = Math.round(
    shares.reduce((acc, s) => acc + s.temperature, 0) / (shares.length || 1)
  );

  let macroZone: BubbleTemperatureZone = 'TEMPERATE';
  let macroLabel = 'Temperate / Balanced Market';
  let macroColor = '#38BDF8';
  let macroSummary =
    'S&P 500 Tech Sector is in balanced equilibrium. Selective dip-buying is favored on cool shares while avoiding chasing parabolic winners.';

  if (avgTemp <= 25) {
    macroZone = 'FREEZING_DIP';
    macroLabel = 'Sector-Wide Freezing Capitulation';
    macroColor = '#10B981';
    macroSummary =
      'Broad institutional panic across megacap tech. Rare asymmetric macro dip opportunity. Aggressive scaling-in favored.';
  } else if (avgTemp <= 50) {
    macroZone = 'COOL_VALUE';
    macroLabel = 'Sector Cool Pullback Zone';
    macroColor = '#06B6D4';
    macroSummary =
      'Healthy index-wide technical pullback. Key tech leaders testing moving average support with favorable risk-reward.';
  } else if (avgTemp <= 74) {
    macroZone = 'TEMPERATE';
    macroLabel = 'Temperate Tech Trend';
    macroColor = '#38BDF8';
    macroSummary =
      'Tech megacaps trading in steady trend-following posture. Maintain trailing stop-losses; selectively hunt dips on lagging assets.';
  } else if (avgTemp <= 89) {
    macroZone = 'WARM_FROTH';
    macroLabel = 'Warm Froth / High Valuation Heat';
    macroColor = '#F59E0B';
    macroSummary =
      'Significant overextension above 200-day baselines across multiple semiconductor and cloud leaders. Prudent to trim profits and raise stops.';
  } else {
    macroZone = 'BOILING_BUBBLE';
    macroLabel = 'Boiling Bubble Euphoria';
    macroColor = '#EF4444';
    macroSummary =
      'Extreme euphoric froth detected across the S&P 500 tech complex. Parabolic price acceleration signals asymmetric downside vulnerability.';
  }

  const payload: BubbleThermometerPayload = {
    macroTemperature: avgTemp,
    macroZone,
    macroLabel,
    macroColor,
    macroSummary,
    shares,
    lastUpdated: new Date().toLocaleTimeString(undefined, {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }),
  };

  cachedPayload = payload;
  lastCacheTime = now;

  return payload;
}
