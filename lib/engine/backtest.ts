import { OHLCVCandle, CalculatedIndicators, BacktestResult } from '../types';

export function runDipSignalBacktest(
  symbol: string,
  candles: OHLCVCandle[],
  indicators: CalculatedIndicators
): BacktestResult {
  if (candles.length < 120) {
    return {
      symbol,
      totalSignals: 0,
      winRate7d: 0,
      avgReturn7d: 0,
      winRate30d: 0,
      avgReturn30d: 0,
      winRate90d: 0,
      avgReturn90d: 0,
      maxDrawdownAvg: 0,
      recentTriggers: [],
    };
  }

  const isCrypto = symbol.toUpperCase().includes('BTC');
  const rsiThreshold = isCrypto ? 30 : 35;

  const triggeredEvents: {
    date: string;
    index: number;
    priceAtSignal: number;
    compositeScore: number;
    return7d: number;
    return30d: number;
    return90d: number;
    maxDrawdown: number;
  }[] = [];

  // Iterate over candles where we have enough look-ahead room (leaving 90 days at end for full evaluation)
  const startIdx = 200; // after 200 SMA is warmed up
  const endIdx = candles.length - 1;

  for (let i = startIdx; i < endIdx; i++) {
    const c = candles[i];
    const rsi = indicators.rsi14[i]?.value;
    const zScore = indicators.drawdownZScore[i]?.value;
    const sma200 = indicators.sma200[i]?.value;
    const distToSma200 = sma200 ? ((c.close - sma200) / sma200) * 100 : 0;

    // A dip trigger event fires when:
    // 1. RSI is oversold, OR
    // 2. 30-day Drawdown Z-Score <= -2.5, OR
    // 3. Testing 200 SMA in uptrend with RSI < 42
    const isRsiDip = rsi !== null && rsi !== undefined && rsi < rsiThreshold;
    const isZScoreDip = zScore !== null && zScore !== undefined && zScore <= -2.5;
    const isSmaRetest = distToSma200 >= -3.5 && distToSma200 <= 1.5 && rsi !== null && rsi !== undefined && rsi < 42;

    if (isRsiDip || isZScoreDip || isSmaRetest) {
      // Avoid clustered identical triggers within 5 days
      const lastEvent = triggeredEvents[triggeredEvents.length - 1];
      if (lastEvent && i - lastEvent.index < 5) {
        continue;
      }

      // Calculate forward returns and maximum drawdown
      const entryPrice = c.close;
      const fwd7Idx = Math.min(candles.length - 1, i + 7);
      const fwd30Idx = Math.min(candles.length - 1, i + 30);
      const fwd90Idx = Math.min(candles.length - 1, i + 90);

      const return7d = Number((((candles[fwd7Idx].close - entryPrice) / entryPrice) * 100).toFixed(2));
      const return30d = Number((((candles[fwd30Idx].close - entryPrice) / entryPrice) * 100).toFixed(2));
      const return90d = Number((((candles[fwd90Idx].close - entryPrice) / entryPrice) * 100).toFixed(2));

      // Calculate max drawdown over next 30 days
      let lowestLow = entryPrice;
      for (let j = i + 1; j <= fwd30Idx; j++) {
        if (candles[j].low < lowestLow) lowestLow = candles[j].low;
      }
      const maxDrawdown = Number((((lowestLow - entryPrice) / entryPrice) * 100).toFixed(2));

      let score = 50;
      if (isRsiDip) score += 25;
      if (isZScoreDip) score += 25;
      if (isSmaRetest) score += 20;

      triggeredEvents.push({
        date: c.time,
        index: i,
        priceAtSignal: entryPrice,
        compositeScore: Math.min(100, score),
        return7d,
        return30d,
        return90d,
        maxDrawdown,
      });
    }
  }

  const total = triggeredEvents.length;
  if (total === 0) {
    return {
      symbol,
      totalSignals: 0,
      winRate7d: 0,
      avgReturn7d: 0,
      winRate30d: 0,
      avgReturn30d: 0,
      winRate90d: 0,
      avgReturn90d: 0,
      maxDrawdownAvg: 0,
      recentTriggers: [],
    };
  }

  const winCount7d = triggeredEvents.filter((e) => e.return7d > 0).length;
  const winCount30d = triggeredEvents.filter((e) => e.return30d > 0).length;
  const winCount90d = triggeredEvents.filter((e) => e.return90d > 0).length;

  const avgReturn7d = Number(
    (triggeredEvents.reduce((acc, e) => acc + e.return7d, 0) / total).toFixed(2)
  );
  const avgReturn30d = Number(
    (triggeredEvents.reduce((acc, e) => acc + e.return30d, 0) / total).toFixed(2)
  );
  const avgReturn90d = Number(
    (triggeredEvents.reduce((acc, e) => acc + e.return90d, 0) / total).toFixed(2)
  );
  const maxDrawdownAvg = Number(
    (triggeredEvents.reduce((acc, e) => acc + e.maxDrawdown, 0) / total).toFixed(2)
  );

  return {
    symbol,
    totalSignals: total,
    winRate7d: Number(((winCount7d / total) * 100).toFixed(1)),
    avgReturn7d,
    winRate30d: Number(((winCount30d / total) * 100).toFixed(1)),
    avgReturn30d,
    winRate90d: Number(((winCount90d / total) * 100).toFixed(1)),
    avgReturn90d,
    maxDrawdownAvg,
    recentTriggers: triggeredEvents
      .slice(-10)
      .reverse()
      .map(({ index, ...rest }) => rest),
  };
}
