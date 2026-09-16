import { OHLCVCandle, CalculatedIndicators, IndicatorPoint } from '../types';

/**
 * Calculates 14-period RSI using Wilder's exponential smoothing method.
 */
export function calculateRSI(candles: OHLCVCandle[], period = 14): (IndicatorPoint | null)[] {
  const result: (IndicatorPoint | null)[] = new Array(candles.length).fill(null);
  if (candles.length <= period) return result;

  let gains = 0;
  let losses = 0;

  // First period simple average
  for (let i = 1; i <= period; i++) {
    const diff = candles[i].close - candles[i - 1].close;
    if (diff >= 0) gains += diff;
    else losses += Math.abs(diff);
  }

  let avgGain = gains / period;
  let avgLoss = losses / period;

  const firstRs = avgLoss === 0 ? 100 : avgGain / avgLoss;
  const firstRsi = avgLoss === 0 ? 100 : 100 - 100 / (1 + firstRs);
  result[period] = { time: candles[period].time, value: Number(firstRsi.toFixed(2)) };

  // Wilder's smoothing for subsequent periods
  for (let i = period + 1; i < candles.length; i++) {
    const diff = candles[i].close - candles[i - 1].close;
    const currentGain = diff > 0 ? diff : 0;
    const currentLoss = diff < 0 ? Math.abs(diff) : 0;

    avgGain = (avgGain * (period - 1) + currentGain) / period;
    avgLoss = (avgLoss * (period - 1) + currentLoss) / period;

    let rsi = 100;
    if (avgLoss !== 0) {
      const rs = avgGain / avgLoss;
      rsi = 100 - 100 / (1 + rs);
    }
    result[i] = { time: candles[i].time, value: Number(rsi.toFixed(2)) };
  }

  return result;
}

/**
 * Calculates Simple Moving Average (SMA) of candle close prices.
 */
export function calculateSMA(candles: OHLCVCandle[], period: number): (IndicatorPoint | null)[] {
  const result: (IndicatorPoint | null)[] = new Array(candles.length).fill(null);
  if (candles.length < period) return result;

  let sum = 0;
  for (let i = 0; i < period; i++) {
    sum += candles[i].close;
  }
  result[period - 1] = {
    time: candles[period - 1].time,
    value: Number((sum / period).toFixed(2)),
  };

  for (let i = period; i < candles.length; i++) {
    sum += candles[i].close - candles[i - period].close;
    result[i] = {
      time: candles[i].time,
      value: Number((sum / period).toFixed(2)),
    };
  }

  return result;
}

/**
 * Calculates Z-Score of single-day return relative to a 30-day rolling window.
 * Flags single-day drops exceeding 2.5x standard deviations.
 */
export function calculateDrawdownZScore(candles: OHLCVCandle[], window = 30): (IndicatorPoint | null)[] {
  const result: (IndicatorPoint | null)[] = new Array(candles.length).fill(null);
  if (candles.length <= window) return result;

  // Daily returns array
  const returns: number[] = [0];
  for (let i = 1; i < candles.length; i++) {
    const prev = candles[i - 1].close;
    const ret = prev > 0 ? (candles[i].close - prev) / prev : 0;
    returns.push(ret);
  }

  for (let i = window; i < candles.length; i++) {
    const windowSlice = returns.slice(i - window + 1, i + 1);
    const mean = windowSlice.reduce((acc, v) => acc + v, 0) / window;
    const variance =
      windowSlice.reduce((acc, v) => acc + Math.pow(v - mean, 2), 0) / (window - 1);
    const stdDev = Math.sqrt(variance);

    const currentReturn = returns[i];
    let zScore = 0;
    if (stdDev > 0.0001) {
      zScore = (currentReturn - mean) / stdDev;
    }

    result[i] = {
      time: candles[i].time,
      value: Number(zScore.toFixed(2)),
    };
  }

  return result;
}

/**
 * Computes all technical indicators for the candle series.
 */
export function computeAllIndicators(candles: OHLCVCandle[]): CalculatedIndicators {
  const rsi14 = calculateRSI(candles, 14);
  const sma200 = calculateSMA(candles, 200);
  const sma50 = calculateSMA(candles, 50);
  const drawdownZScore = calculateDrawdownZScore(candles, 30);

  const distanceToSma200Pct: (IndicatorPoint | null)[] = candles.map((c, i) => {
    const sma = sma200[i]?.value;
    if (!sma || sma === 0) return null;
    const pct = ((c.close - sma) / sma) * 100;
    return { time: c.time, value: Number(pct.toFixed(2)) };
  });

  return {
    rsi14,
    sma200,
    sma50,
    drawdownZScore,
    distanceToSma200Pct,
  };
}

/**
 * Calculates Exponential Moving Average (EMA) of candle close prices.
 */
export function calculateEMA(candles: OHLCVCandle[], period: number): (IndicatorPoint | null)[] {
  const result: (IndicatorPoint | null)[] = new Array(candles.length).fill(null);
  if (candles.length < period) return result;

  const multiplier = 2 / (period + 1);

  // Initialize with SMA
  let initialSum = 0;
  for (let i = 0; i < period; i++) {
    initialSum += candles[i].close;
  }
  let currentEma = initialSum / period;
  result[period - 1] = {
    time: candles[period - 1].time,
    value: Number(currentEma.toFixed(2)),
  };

  for (let i = period; i < candles.length; i++) {
    currentEma = (candles[i].close - currentEma) * multiplier + currentEma;
    result[i] = {
      time: candles[i].time,
      value: Number(currentEma.toFixed(2)),
    };
  }

  return result;
}

/**
 * Calculates Dr. Alexander Elder's Elder-Ray indicator (Bull & Bear Power).
 * - Bull Power = High - 13-day EMA
 * - Bear Power = Low - 13-day EMA
 */
export function calculateElderRay(candles: OHLCVCandle[], emaPeriod = 13) {
  if (candles.length < emaPeriod + 5) {
    return {
      ema13: candles[candles.length - 1]?.close || 0,
      bullPower: 0,
      bearPower: 0,
      forceIndex2: 0,
      bullishDivergence: false,
      trendDirection: 'NEUTRAL' as const,
      signal: 'NEUTRAL' as const,
      summary: 'Insufficient candles for Elder-Ray analysis.',
    };
  }

  const emaSeries = calculateEMA(candles, emaPeriod);
  const lastIdx = candles.length - 1;
  const currentCandle = candles[lastIdx];
  const currentEma = emaSeries[lastIdx]?.value ?? currentCandle.close;
  const prevEma = emaSeries[lastIdx - 4]?.value ?? currentEma;

  const bullPower = Number((currentCandle.high - currentEma).toFixed(2));
  const bearPower = Number((currentCandle.low - currentEma).toFixed(2));

  // 13-day EMA slope determines macro direction
  const emaSlope = currentEma - prevEma;
  const trendDirection: 'BULLISH' | 'BEARISH' | 'NEUTRAL' =
    emaSlope > 0 ? 'BULLISH' : emaSlope < -0.001 ? 'BEARISH' : 'NEUTRAL';

  // Calculate 2-day smoothed Force Index
  const forceIndex2 = calculateForceIndex(candles, 2);

  // Detect Bullish Divergence in Bear Power (Price lower low vs Bear Power higher low)
  let bullishDivergence = false;
  if (candles.length >= 25) {
    const lookback = 20;
    let minPriceIdx = lastIdx;
    let minBearPowerIdx = lastIdx;
    let lowestBearPower = bearPower;
    let lowestPrice = currentCandle.close;

    for (let i = lastIdx - lookback; i < lastIdx; i++) {
      const c = candles[i];
      const ema = emaSeries[i]?.value ?? c.close;
      const bp = c.low - ema;
      if (c.close < lowestPrice) {
        lowestPrice = c.close;
        minPriceIdx = i;
      }
      if (bp < lowestBearPower) {
        lowestBearPower = bp;
        minBearPowerIdx = i;
      }
    }

    // If recent price is lower or near low, but Bear Power has formed a distinctly higher trough
    if (currentCandle.close <= lowestPrice * 1.02 && bearPower > lowestBearPower * 0.6) {
      bullishDivergence = true;
    }
  }

  // Generate Elder-Ray Signal
  let signal: 'STRONG_BUY_DIP' | 'BUY_DIP' | 'NEUTRAL' | 'SELL_RALLY' = 'NEUTRAL';
  let summary = 'Consensus value in equilibrium.';

  if (trendDirection === 'BULLISH') {
    if (bullishDivergence) {
      signal = 'STRONG_BUY_DIP';
      summary = 'Bullish Divergence in Bear Power detected during macro uptrend — prime institutional reload.';
    } else if (bearPower < 0 && bearPower > (candles[lastIdx - 1]?.low - (emaSeries[lastIdx - 1]?.value ?? currentEma))) {
      signal = 'BUY_DIP';
      summary = 'Bear Power negative but rising with upward 13-EMA — pullback buying opportunity.';
    } else {
      signal = 'BUY_DIP';
      summary = 'Macro trend positive; awaiting oversold Bear Power dip.';
    }
  } else if (trendDirection === 'BEARISH') {
    if (bullPower > 0) {
      signal = 'SELL_RALLY';
      summary = 'Bull Power positive in downtrend — bear market relief rally fading.';
    } else {
      signal = 'NEUTRAL';
      summary = 'Downtrend intact; Bear Power deeply depressed.';
    }
  }

  return {
    ema13: Number(currentEma.toFixed(2)),
    bullPower,
    bearPower,
    forceIndex2,
    bullishDivergence,
    trendDirection,
    signal,
    summary,
  };
}

/**
 * Calculates Dr. Alexander Elder's 2-day Force Index:
 * Force Index = (Close_t - Close_{t-1}) * Volume_t, smoothed via 2-period EMA.
 */
export function calculateForceIndex(candles: OHLCVCandle[], period = 2): number {
  if (candles.length < period + 2) return 0;

  const rawForces: number[] = [];
  for (let i = 1; i < candles.length; i++) {
    const diff = candles[i].close - candles[i - 1].close;
    const force = diff * candles[i].volume;
    rawForces.push(force);
  }

  // 2-period exponential smoothing
  const multiplier = 2 / (period + 1);
  let smoothedForce = rawForces[0] || 0;
  for (let i = 1; i < rawForces.length; i++) {
    smoothedForce = (rawForces[i] - smoothedForce) * multiplier + smoothedForce;
  }

  return Number(smoothedForce.toFixed(2));
}

/**
 * Evaluates Dr. Alexander Elder's Triple Screen Trading System.
 * - Screen 1: Weekly Tide (13-week EMA slope)
 * - Screen 2: Daily Wave (Elder-Ray Bear Power & Force Index oversold)
 * - Screen 3: Execution Ripple (Trailing Buy Stop above prior high)
 */
export function evaluateTripleScreen(candles: OHLCVCandle[]) {
  if (candles.length < 30) {
    return {
      screen1Tide: {
        timeframe: 'WEEKLY' as const,
        indicator: '13-Week EMA Slope' as const,
        direction: 'FLAT' as const,
        verdict: 'Insufficient history for weekly tide.',
      },
      screen2Wave: {
        timeframe: 'DAILY' as const,
        indicator: 'Elder-Ray Bear Power & Force Index' as const,
        condition: 'NEUTRAL' as const,
        verdict: 'Neutral daily oscillator.',
      },
      screen3Ripple: {
        timeframe: 'DAILY EXECUTION' as const,
        triggerPrice: candles[candles.length - 1]?.close || 0,
        trailingStop: (candles[candles.length - 1]?.close || 0) * 0.95,
        status: 'STANDBY' as const,
        verdict: 'Awaiting alignment.',
      },
      confluenceScore: 50,
      allScreensAligned: false,
    };
  }

  // 1. Synthesize Weekly Candles from Daily (stride of 5 trading days)
  const weeklyCloses: number[] = [];
  for (let i = 4; i < candles.length; i += 5) {
    weeklyCloses.push(candles[i].close);
  }

  // Calculate 13-week EMA
  const weeklyMultiplier = 2 / (13 + 1);
  let weeklyEma = weeklyCloses[0] || 0;
  for (let i = 1; i < weeklyCloses.length; i++) {
    weeklyEma = (weeklyCloses[i] - weeklyEma) * weeklyMultiplier + weeklyEma;
  }
  const prevWeeklyEma = weeklyCloses.length > 2
    ? weeklyCloses[weeklyCloses.length - 3]
    : weeklyEma;

  const weeklySlope = weeklyEma - prevWeeklyEma;
  const isWeeklyBullish = weeklySlope >= 0;

  const screen1Tide = {
    timeframe: 'WEEKLY' as const,
    indicator: '13-Week EMA Slope' as const,
    direction: isWeeklyBullish ? ('BULLISH' as const) : ('BEARISH' as const),
    verdict: isWeeklyBullish
      ? 'Weekly Tide is RISING: Only buy signals are permitted. Do not short.'
      : 'Weekly Tide is FALLING: Defensive posture; cash conservation mode.',
  };

  // 2. Screen 2: Daily Wave
  const elderRay = calculateElderRay(candles, 13);
  const isWaveOversold = elderRay.bearPower < 0 || elderRay.forceIndex2 < 0;

  const screen2Wave = {
    timeframe: 'DAILY' as const,
    indicator: 'Elder-Ray Bear Power & Force Index' as const,
    condition: isWaveOversold ? ('OVERSOLD_DIP' as const) : ('OVERBOUGHT_RALLY' as const),
    verdict: isWaveOversold
      ? `Daily Wave pulled back below 13-EMA (Bear Power: ${elderRay.bearPower}). Prime dip window.`
      : 'Daily Wave is extended above 13-EMA. Wait for healthy pullback.',
  };

  // 3. Screen 3: Execution Ripple
  const lastCandle = candles[candles.length - 1];
  const prevCandle = candles[candles.length - 2] || lastCandle;
  const triggerPrice = Number((Math.max(lastCandle.high, prevCandle.high) * 1.002).toFixed(2));
  const trailingStop = Number((Math.min(lastCandle.low, prevCandle.low) * 0.985).toFixed(2));

  const allScreensAligned = isWeeklyBullish && isWaveOversold;
  let confluenceScore = 30;
  if (isWeeklyBullish) confluenceScore += 40;
  if (isWaveOversold) confluenceScore += 20;
  if (elderRay.bullishDivergence) confluenceScore += 10;

  const screen3Ripple = {
    timeframe: 'DAILY EXECUTION' as const,
    triggerPrice,
    trailingStop,
    status: allScreensAligned ? ('ARMED_BUY_STOP' as const) : ('STANDBY' as const),
    verdict: allScreensAligned
      ? `Screens 1 & 2 Aligned! Arm trailing buy stop at $${triggerPrice.toLocaleString()} (Stop-loss: $${trailingStop.toLocaleString()}).`
      : 'Waiting for Tide & Wave alignment before arming breakout trigger.',
  };

  return {
    screen1Tide,
    screen2Wave,
    screen3Ripple,
    confluenceScore: Math.min(100, confluenceScore),
    allScreensAligned,
  };
}

