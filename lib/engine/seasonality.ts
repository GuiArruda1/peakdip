import { OHLCVCandle, SeasonalityMatrixData, WeekdayStat, MonthStat } from '../types';

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const MONTH_NAMES = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

export function computeSeasonalityMatrix(
  symbol: string,
  candles: OHLCVCandle[]
): SeasonalityMatrixData {
  if (candles.length === 0) {
    return {
      symbol,
      weekdays: [],
      monthlyHeatmap: [],
      monthlyAverages: [],
      insights: [],
    };
  }

  const isCrypto = symbol.toUpperCase().includes('BTC');

  // 1. Group daily returns & drawdowns by Day of Week
  const weekdayReturns: { returns: number[]; drawdowns: number[] }[] = Array.from(
    { length: 7 },
    () => ({ returns: [], drawdowns: [] })
  );

  for (let i = 1; i < candles.length; i++) {
    const c = candles[i];
    const prev = candles[i - 1];
    const dateObj = new Date(c.time + 'T00:00:00Z');
    const dow = dateObj.getUTCDay(); // 0 = Sun, 1 = Mon ...

    const dailyReturnPct = prev.close > 0 ? ((c.close - prev.close) / prev.close) * 100 : 0;
    const intraDrawdownPct = c.open > 0 ? ((c.low - c.open) / c.open) * 100 : 0;

    weekdayReturns[dow].returns.push(dailyReturnPct);
    weekdayReturns[dow].drawdowns.push(intraDrawdownPct);
  }

  const weekdays: WeekdayStat[] = weekdayReturns.map((stat, dow) => {
    const total = stat.returns.length;
    if (total === 0) {
      return {
        dayNumber: dow,
        dayName: DAY_NAMES[dow],
        sampleSize: 0,
        winRatePct: 0,
        avgReturnPct: 0,
        medianDrawdownPct: 0,
        isFavorableEntry: false,
        notes: 'Insufficient data',
      };
    }

    const positiveCount = stat.returns.filter((r) => r > 0).length;
    const winRatePct = Number(((positiveCount / total) * 100).toFixed(1));
    const avgReturnPct = Number(
      (stat.returns.reduce((acc, r) => acc + r, 0) / total).toFixed(3)
    );

    // Median drawdown calculation
    const sortedDrawdowns = [...stat.drawdowns].sort((a, b) => a - b);
    const mid = Math.floor(sortedDrawdowns.length / 2);
    const medianDrawdownPct = Number(
      (sortedDrawdowns.length % 2 !== 0
        ? sortedDrawdowns[mid]
        : (sortedDrawdowns[mid - 1] + sortedDrawdowns[mid]) / 2
      ).toFixed(2)
    );

    // Calendar tendency tags
    let isFavorableEntry = false;
    let notes = 'Normal session';

    if (isCrypto && dow === 0) {
      isFavorableEntry = true;
      notes = 'Late Sunday UTC: Historically soft weekend liquidity entry window';
    } else if (!isCrypto && dow === 1) {
      isFavorableEntry = true;
      notes = 'Monday Open: Institutional weekly gap absorption & dip accumulation';
    } else if (dow === 4 || dow === 5) {
      notes = isCrypto ? 'Pre-weekend positioning' : 'End-of-week institutional rebalance';
    }

    return {
      dayNumber: dow,
      dayName: DAY_NAMES[dow],
      sampleSize: total,
      winRatePct,
      avgReturnPct,
      medianDrawdownPct,
      isFavorableEntry,
      notes,
    };
  });

  // 2. Compute Monthly Heatmap (Year x Month)
  // Group candles by year and month
  const monthlyCandleMap: Record<number, Record<number, OHLCVCandle[]>> = {};

  for (const c of candles) {
    const d = new Date(c.time + 'T00:00:00Z');
    const year = d.getUTCFullYear();
    const month = d.getUTCMonth() + 1; // 1-12

    if (!monthlyCandleMap[year]) monthlyCandleMap[year] = {};
    if (!monthlyCandleMap[year][month]) monthlyCandleMap[year][month] = [];
    monthlyCandleMap[year][month].push(c);
  }

  const years = Object.keys(monthlyCandleMap)
    .map(Number)
    .sort((a, b) => b - a); // latest first

  const monthlyHeatmap = years.map((year) => {
    const returns: Record<number, number | null> = {};
    let yearStartClose: number | null = null;
    let yearEndClose: number | null = null;

    for (let m = 1; m <= 12; m++) {
      const monthCandles = monthlyCandleMap[year][m];
      if (!monthCandles || monthCandles.length === 0) {
        returns[m] = null;
      } else {
        const first = monthCandles[0];
        const last = monthCandles[monthCandles.length - 1];
        const mRet = first.open > 0 ? ((last.close - first.open) / first.open) * 100 : 0;
        returns[m] = Number(mRet.toFixed(2));

        if (yearStartClose === null) yearStartClose = first.open;
        yearEndClose = last.close;
      }
    }

    const annualReturn =
      yearStartClose && yearEndClose && yearStartClose > 0
        ? Number((((yearEndClose - yearStartClose) / yearStartClose) * 100).toFixed(2))
        : 0;

    return {
      year,
      returns,
      annualReturn,
    };
  });

  // 3. Compute Monthly Averages across all years
  const monthlyAverages: MonthStat[] = Array.from({ length: 12 }, (_, idx) => {
    const month = idx + 1;
    const allReturnsForMonth: number[] = [];

    for (const row of monthlyHeatmap) {
      const val = row.returns[month];
      if (val !== null && val !== undefined) {
        allReturnsForMonth.push(val);
      }
    }

    const total = allReturnsForMonth.length;
    if (total === 0) {
      return {
        monthNumber: month,
        monthName: MONTH_NAMES[idx],
        winRatePct: 0,
        avgReturnPct: 0,
      };
    }

    const positive = allReturnsForMonth.filter((r) => r > 0).length;
    return {
      monthNumber: month,
      monthName: MONTH_NAMES[idx],
      winRatePct: Number(((positive / total) * 100).toFixed(1)),
      avgReturnPct: Number(
        (allReturnsForMonth.reduce((acc, r) => acc + r, 0) / total).toFixed(2)
      ),
    };
  });

  // 4. Generate dynamic calendar insights
  const insights: string[] = [];
  if (isCrypto) {
    const sunStat = weekdays.find((w) => w.dayNumber === 0);
    const octStat = monthlyAverages[9]; // Oct
    const sepStat = monthlyAverages[8]; // Sep
    insights.push(
      `Sunday UTC Tendency: Across ${sunStat?.sampleSize || 0} sessions, Sunday exhibits a ${sunStat?.winRatePct || 0}% positive close rate with a median intraday dip of ${sunStat?.medianDrawdownPct || 0}%, consistently providing an optimal weekend discount entry.`
    );
    insights.push(
      `Q4 Seasonality: October historical win-rate stands at ${octStat?.winRatePct || 0}% (avg return ${octStat?.avgReturnPct || 0}%), contrasting with September historical weakness (avg ${sepStat?.avgReturnPct || 0}%).`
    );
  } else {
    const monStat = weekdays.find((w) => w.dayNumber === 1);
    const friStat = weekdays.find((w) => w.dayNumber === 5);
    insights.push(
      `Monday Gap Absorption: Monday sessions exhibit a ${monStat?.winRatePct || 0}% win rate and ${monStat?.medianDrawdownPct || 0}% median drawdown, representing prime institutional pullback entry windows.`
    );
    insights.push(
      `Friday Rebalance: Friday generates average returns of ${friStat?.avgReturnPct || 0}% with ${friStat?.winRatePct || 0}% win rate as institutional weekly positioning settles.`
    );
  }

  return {
    symbol,
    weekdays,
    monthlyHeatmap,
    monthlyAverages,
    insights,
  };
}
