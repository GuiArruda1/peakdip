export interface OHLCVCandle {
  time: string; // ISO date or 'YYYY-MM-DD'
  timestamp: number; // epoch ms
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface SentimentData {
  time: string;
  indicatorCode: 'CRYPTO_FEAR_GREED' | 'CBOE_VIX';
  value: number;
  classification: string;
}

export interface IndicatorPoint {
  time: string;
  value: number;
}

export interface CalculatedIndicators {
  rsi14: (IndicatorPoint | null)[];
  sma200: (IndicatorPoint | null)[];
  sma50: (IndicatorPoint | null)[];
  drawdownZScore: (IndicatorPoint | null)[];
  distanceToSma200Pct: (IndicatorPoint | null)[];
}

export interface MLPrediction {
  regime: 'BULL_TREND' | 'BEAR_TREND' | 'VOLATILE_CHOP';
  dipSuccessProb14d: number; // 0.0 to 1.0 (e.g. 0.82)
  expectedFwdReturn14d: number; // percentage (e.g. +4.5%)
  featureContributions: {
    feature: string;
    impact: number; // e.g. +0.18 or -0.09
    direction: 'bullish' | 'bearish' | 'neutral';
    description: string;
  }[];
}

export interface DipTrigger {
  id: string;
  name: string;
  active: boolean;
  valueDescription: string;
  thresholdDescription: string;
  weight: number;
}

export interface DipConvictionSnapshot {
  assetSymbol: string;
  assetName: string;
  currentPrice: number;
  priceChange24h: number;
  lastUpdated: string;
  compositeScore: number; // 0 to 100
  signalLabel: 'STRONG_DIP_BUY' | 'MODERATE_DIP' | 'NEUTRAL' | 'EXTENDED';
  signalColor: string;
  triggers: DipTrigger[];
  indicators: {
    rsi14: number | null;
    sma200: number | null;
    sma50: number | null;
    distToSma200Pct: number | null;
    drawdownZScore: number | null;
    fearGreedOrVix: {
      name: string;
      value: number;
      label: string;
    };
    calendarStatus: {
      isFavorableWindow: boolean;
      dayOfWeek: string;
      reason: string;
    };
    elderRay?: ElderRayData;
    tripleScreen?: TripleScreenStatus;
  };
  ml: MLPrediction;
}

export interface ElderRayData {
  ema13: number;
  bullPower: number;
  bearPower: number;
  forceIndex2: number;
  bullishDivergence: boolean;
  trendDirection: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
  signal: 'STRONG_BUY_DIP' | 'BUY_DIP' | 'NEUTRAL' | 'SELL_RALLY';
  summary: string;
}

export interface TripleScreenStatus {
  screen1Tide: {
    timeframe: 'WEEKLY';
    indicator: '13-Week EMA Slope';
    direction: 'BULLISH' | 'BEARISH' | 'FLAT';
    verdict: string;
  };
  screen2Wave: {
    timeframe: 'DAILY';
    indicator: 'Elder-Ray Bear Power & Force Index';
    condition: 'OVERSOLD_DIP' | 'OVERBOUGHT_RALLY' | 'NEUTRAL';
    verdict: string;
  };
  screen3Ripple: {
    timeframe: 'DAILY EXECUTION';
    triggerPrice: number;
    trailingStop: number;
    status: 'ARMED_BUY_STOP' | 'STANDBY' | 'CAUTION';
    verdict: string;
  };
  confluenceScore: number; // 0 to 100
  allScreensAligned: boolean;
}

export interface WeekdayStat {
  dayNumber: number; // 0 = Sun, 1 = Mon, ..., 6 = Sat
  dayName: string;
  sampleSize: number;
  winRatePct: number;
  avgReturnPct: number;
  medianDrawdownPct: number;
  isFavorableEntry: boolean;
  notes: string;
}

export interface MonthStat {
  monthNumber: number; // 1 = Jan ... 12 = Dec
  monthName: string;
  winRatePct: number;
  avgReturnPct: number;
}

export interface SeasonalityMatrixData {
  symbol: string;
  weekdays: WeekdayStat[];
  monthlyHeatmap: {
    year: number;
    returns: Record<number, number | null>; // month 1-12 -> return %
    annualReturn: number;
  }[];
  monthlyAverages: MonthStat[];
  insights: string[];
}

export interface BacktestResult {
  symbol: string;
  totalSignals: number;
  winRate7d: number;
  avgReturn7d: number;
  winRate30d: number;
  avgReturn30d: number;
  winRate90d: number;
  avgReturn90d: number;
  maxDrawdownAvg: number;
  recentTriggers: {
    date: string;
    priceAtSignal: number;
    compositeScore: number;
    return7d: number;
    return30d: number;
    return90d: number;
    maxDrawdown: number;
  }[];
}

// -------------------------------------------------------------
// DAY TRADE / SCALPER TYPES
// -------------------------------------------------------------

export type DayTradeTimeframe = '1m' | '5m' | '15m' | '1h';

export interface DayTradeCandle {
  time: number; // Unix timestamp in seconds (for Lightweight Charts intraday)
  isoTime: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface DayTradePivotLevels {
  pp: number;
  r1: number;
  r2: number;
  s1: number;
  s2: number;
}

export interface DayTradeIndicators {
  vwap: { time: number; value: number }[];
  vwapUpper1: { time: number; value: number }[];
  vwapLower1: { time: number; value: number }[];
  vwapUpper2: { time: number; value: number }[];
  vwapLower2: { time: number; value: number }[];
  ema9: { time: number; value: number }[];
  ema21: { time: number; value: number }[];
  rsi14: { time: number; value: number }[];
  atr14: number;
  currentVwap: number;
  distToVwapPct: number;
  pivots: DayTradePivotLevels;
}

export interface DayTradeSetup {
  id: string;
  symbol: string;
  direction: 'LONG' | 'SHORT';
  setupName: string;
  confidence: number; // 0 - 100
  entryPrice: number;
  stopLoss: number;
  takeProfit1: number;
  takeProfit2: number;
  riskRewardRatio: string;
  status: 'ACTIVE' | 'TRIGGERED' | 'INVALIDATED';
  timeframe: DayTradeTimeframe;
  rationale: string[];
  timestamp: number;
}

export interface MarketSessionInfo {
  currentSession: 'ASIAN' | 'LONDON_OPEN' | 'NY_MORNING' | 'NY_POWER_HOUR' | 'OFF_HOURS';
  sessionName: string;
  volatilityTier: 'LOW' | 'MEDIUM' | 'HIGH' | 'EXTREME';
  description: string;
  utcTime: string;
}

export interface DayTradePayload {
  symbol: string;
  timeframe: DayTradeTimeframe;
  currentPrice: number;
  priceChangePct: number;
  high24h: number;
  low24h: number;
  volume24h: number;
  candles: DayTradeCandle[];
  indicators: DayTradeIndicators;
  setups: DayTradeSetup[];
  session: MarketSessionInfo;
  lastUpdated: number;
}

export type BubbleTemperatureZone =
  | 'FREEZING_DIP'
  | 'COOL_VALUE'
  | 'TEMPERATE'
  | 'WARM_FROTH'
  | 'BOILING_BUBBLE';

export type AIDecisionAction =
  | 'STRONG_BUY_DIP'
  | 'ACCUMULATE'
  | 'HOLD_MOMENTUM'
  | 'TAKE_PROFIT'
  | 'BUBBLE_CAUTION';

export interface TechShareThermometer {
  symbol: string;
  name: string;
  currentPrice: number;
  priceChange24h: number;
  temperature: number; // 0 to 100
  zone: BubbleTemperatureZone;
  zoneLabel: string;
  zoneColor: string;
  distanceToSma200Pct: number;
  distanceToSma50Pct: number;
  rsi14: number;
  drawdown52wPct: number;
  velocity90dPct: number;
  decision: {
    action: AIDecisionAction;
    label: string;
    color: string;
    invalidationPrice: number;
    targetPrice1: number;
    targetPrice2: number;
    rationale: string[];
  };
}

export interface BubbleThermometerPayload {
  macroTemperature: number; // 0 to 100
  macroZone: BubbleTemperatureZone;
  macroLabel: string;
  macroColor: string;
  macroSummary: string;
  shares: TechShareThermometer[];
  lastUpdated: string;
}

