import {
  OHLCVCandle,
  CalculatedIndicators,
  DipConvictionSnapshot,
  DipTrigger,
} from '../types';
import { extractFeaturesAtIndex, predictDipQuality } from '../ml/engine';
import { calculateElderRay, evaluateTripleScreen } from './indicators';

export function evaluateConvictionSnapshot(
  symbol: string,
  candles: OHLCVCandle[],
  indicators: CalculatedIndicators,
  sentimentValue = 50,
  sentimentClassification = 'Neutral'
): DipConvictionSnapshot | null {
  if (candles.length === 0) return null;

  const lastIdx = candles.length - 1;
  const currentCandle = candles[lastIdx];
  const prevCandle = candles[lastIdx - 1] || currentCandle;
  const priceChange24h =
    prevCandle.close > 0
      ? Number((((currentCandle.close - prevCandle.close) / prevCandle.close) * 100).toFixed(2))
      : 0;

  const isCrypto = symbol.toUpperCase().includes('BTC');
  const assetName = isCrypto ? 'Bitcoin (BTC/USDT)' : 'S&P 500 ETF (SPY)';

  // Extract current values
  const rsi = indicators.rsi14[lastIdx]?.value ?? null;
  const sma200 = indicators.sma200[lastIdx]?.value ?? null;
  const sma50 = indicators.sma50[lastIdx]?.value ?? null;
  const distToSma200 = indicators.distanceToSma200Pct[lastIdx]?.value ?? null;
  const zScore = indicators.drawdownZScore[lastIdx]?.value ?? null;

  // Calculate Elder's Systems
  const elderRay = calculateElderRay(candles, 13);
  const tripleScreen = evaluateTripleScreen(candles);

  // Calendar Tendency check
  const dateObj = new Date(currentCandle.time + 'T00:00:00Z');
  const dow = dateObj.getUTCDay(); // 0=Sun, 1=Mon...
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const dayOfWeek = dayNames[dow];

  let isFavorableWindow = false;
  let calendarReason = 'Neutral market window';
  if (isCrypto && dow === 0) {
    isFavorableWindow = true;
    calendarReason = 'Late Sunday UTC: Historically discounted weekend liquidity window.';
  } else if (!isCrypto && dow === 1) {
    isFavorableWindow = true;
    calendarReason = 'Monday Open: Institutional weekly gap absorption and dip accumulation.';
  }

  // 1. Evaluate Individual Triggers
  const rsiThreshold = isCrypto ? 30 : 35;
  const triggerRsi = rsi !== null && rsi < rsiThreshold;

  const triggerSma200 = Boolean(
    distToSma200 !== null &&
    sma200 !== null &&
    distToSma200 >= -3.5 &&
    distToSma200 <= 2.5 &&
    (sma50 === null || sma50 >= sma200 * 0.98)
  );

  const triggerZScore = zScore !== null && zScore <= -2.5;

  const triggerSentiment = isCrypto ? sentimentValue <= 20 : sentimentValue >= 30;

  const triggers: DipTrigger[] = [
    {
      id: 'rsi_oversold',
      name: `RSI(14) Oversold (< ${rsiThreshold})`,
      active: triggerRsi,
      valueDescription: rsi !== null ? `${rsi.toFixed(1)}` : 'N/A',
      thresholdDescription: `< ${rsiThreshold}`,
      weight: 25,
    },
    {
      id: 'sma200_retest',
      name: '200-Day SMA Uptrend Support',
      active: triggerSma200,
      valueDescription: distToSma200 !== null ? `${distToSma200 > 0 ? '+' : ''}${distToSma200.toFixed(1)}%` : 'N/A',
      thresholdDescription: '-3.5% to +2.5% in macro uptrend',
      weight: 20,
    },
    {
      id: 'drawdown_zscore',
      name: '30-Day Drawdown Z-Score (Capitulation Drop)',
      active: triggerZScore,
      valueDescription: zScore !== null ? `${zScore.toFixed(2)}σ` : 'N/A',
      thresholdDescription: '≤ -2.50σ',
      weight: 25,
    },
    {
      id: 'sentiment_panic',
      name: isCrypto ? 'Crypto Fear & Greed (Extreme Fear)' : 'CBOE VIX Spike Panic',
      active: triggerSentiment,
      valueDescription: isCrypto ? `${sentimentValue} (${sentimentClassification})` : `VIX ${sentimentValue.toFixed(1)}`,
      thresholdDescription: isCrypto ? '≤ 20 (Extreme Fear)' : '≥ 30.0 (High Volatility)',
      weight: 20,
    },
    {
      id: 'calendar_timing',
      name: 'Calendar & Seasonality Window',
      active: isFavorableWindow,
      valueDescription: dayOfWeek,
      thresholdDescription: isCrypto ? 'Sunday UTC Entry' : 'Monday Institutional Open',
      weight: 10,
    },
  ];

  // 2. Compute ML Prediction
  const features = extractFeaturesAtIndex(lastIdx, candles, indicators, sentimentValue);
  const ml = features
    ? predictDipQuality(features, symbol)
    : {
        regime: 'VOLATILE_CHOP' as const,
        dipSuccessProb14d: 0.5,
        expectedFwdReturn14d: 1.0,
        featureContributions: [],
      };

  // 3. Compute Composite Conviction Score (0-100)
  let ruleScore = 0;
  for (const t of triggers) {
    if (t.active) ruleScore += t.weight;
  }

  // Bonus points for Triple Screen alignment and Elder-Ray Bullish Divergence
  let elderBonus = 0;
  if (tripleScreen.allScreensAligned) elderBonus += 8;
  if (elderRay.bullishDivergence) elderBonus += 10;

  // Modulate with ML probability
  const mlBonus = Math.round((ml.dipSuccessProb14d - 0.5) * 40);
  const compositeScore = Math.max(0, Math.min(100, ruleScore + mlBonus + elderBonus));

  // Determine Signal Label & Color
  let signalLabel: 'STRONG_DIP_BUY' | 'MODERATE_DIP' | 'NEUTRAL' | 'EXTENDED' = 'NEUTRAL';
  let signalColor = '#94A3B8'; // Slate

  if (compositeScore >= 70) {
    signalLabel = 'STRONG_DIP_BUY';
    signalColor = '#10B981'; // Emerald
  } else if (compositeScore >= 50) {
    signalLabel = 'MODERATE_DIP';
    signalColor = '#3B82F6'; // Blue / Cyan
  } else if (compositeScore < 30) {
    signalLabel = 'EXTENDED';
    signalColor = '#F59E0B'; // Amber
  }

  return {
    assetSymbol: symbol,
    assetName,
    currentPrice: currentCandle.close,
    priceChange24h,
    lastUpdated: currentCandle.time,
    compositeScore,
    signalLabel,
    signalColor,
    triggers,
    indicators: {
      rsi14: rsi,
      sma200,
      sma50,
      distToSma200Pct: distToSma200,
      drawdownZScore: zScore,
      fearGreedOrVix: {
        name: isCrypto ? 'Fear & Greed' : 'CBOE VIX',
        value: sentimentValue,
        label: sentimentClassification,
      },
      calendarStatus: {
        isFavorableWindow,
        dayOfWeek,
        reason: calendarReason,
      },
      elderRay,
      tripleScreen,
    },
    ml,
  };
}
