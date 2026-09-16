// ============================================================================
// PEAK MINDSET MASTERY ENGINE
// Synthesis of 4 Trading Masterworks:
// 1. "Trading in the Zone" by Mark Douglas (20-Trade Probabilistic Batch)
// 2. "The Best Loser Wins" by Tom Hougaard (Cutting Losers & Stop Compliance)
// 3. "Reminiscences of a Stock Operator" by Edwin Lefèvre / Jesse Livermore (The Big Sitting)
// 4. "Market Wizards" by Jack Schwager / Paul Tudor Jones (5:1 Asymmetry Edge)
// ============================================================================

export interface BatchTradeRecord {
  id: string;
  batchIndex: number; // 1 to 20
  asset: 'BTC' | 'SPY';
  outcome: 'WIN' | 'LOSS';
  rMultiple: number; // e.g. +1.62, -1.0, +3.0
  pnlUsd: number;
  followedRules: boolean;
  stopCompliant: boolean; // Hougaard check
  timestamp: number;
  notes?: string;
}

export interface DouglasBatchMetrics {
  currentBatchId: number;
  completedTrades: number; // 0 to 20
  wins: number;
  losses: number;
  winRate: number; // 0 - 100%
  avgWinR: number;
  avgLossR: number;
  expectancyR: number; // E = (W% * AvgWin) - (L% * AvgLoss)
  totalR: number;
  isComplete: boolean;
  statusLabel: string;
  ruleComplianceRate: number; // 0 - 100%
}

export interface HougaardDisciplineMetrics {
  stopComplianceRate: number; // 0 - 100%
  lossesLogged: number;
  cleanCuts: number;
  widenedStopsOrHoped: number;
  disciplineScore: number; // 0 - 100
  disciplineTier: 'MASTER_LOSER' | 'DISCIPLINED' | 'HOPE_ADDICT' | 'BLOWUP_RISK';
  feedback: string;
}

export interface LivermoreSittingMetrics {
  hoursInCashWaiting: number;
  daysInCashWaiting: number;
  lastTradeTimestamp: number;
  patienceTier: 'IMPULSIVE' | 'BUILDING' | 'DISCIPLINED_PATIENCE' | 'LIVERMORE_MASTER';
  pivotalPointStatus: 'PIVOTAL_BREAKOUT' | 'PIVOTAL_CAPITULATION' | 'CHOP_NO_MANS_LAND';
  quote: {
    quote: string;
    context: string;
  };
}

export interface PTJAsymmetryMetrics {
  currentPrice: number;
  stopPrice: number;
  targetPrice: number;
  riskAmount: number;
  rewardAmount: number;
  asymmetryRatio: number; // e.g. 3.5 = 3.5:1
  breakevenWinRateReq: number; // % needed to breakeven
  rating: 'REJECT_POOR_ASYMMETRY' | 'ACCEPTABLE' | 'EXCELLENT_3_1' | 'ELITE_PTJ_5_1';
  summary: string;
}

export interface IntegratedMindsetCockpitState {
  douglasBatch: DouglasBatchMetrics;
  hougaardDiscipline: HougaardDisciplineMetrics;
  livermoreSitting: LivermoreSittingMetrics;
  ptjAsymmetry: PTJAsymmetryMetrics;
  activeTradeRecords: BatchTradeRecord[];
}

// ----------------------------------------------------------------------------
// Curated Quote Archives from the 4 Masters
// ----------------------------------------------------------------------------

export const MINDSET_MASTER_QUOTES = {
  douglas: [
    {
      quote: "When you really accept risk, you won't be uncomfortable with any outcome.",
      principle: "Trading in the Zone — Chapter 2",
    },
    {
      quote: "There is a completely random distribution between wins and losses for any given set of variables that define an edge.",
      principle: "Trading in the Zone — 5 Fundamental Truths",
    },
    {
      quote: "You don't need to know what is going to happen next in order to make money.",
      principle: "Trading in the Zone — Chapter 7",
    },
    {
      quote: "An edge is nothing more than an indication of a higher probability of one thing happening over another.",
      principle: "Trading in the Zone — Probabilistic Thinking",
    },
    {
      quote: "Never evaluate the success of your system on a sample of 1 or 2 trades. You need at least 20 trades.",
      principle: "Trading in the Zone — The 20-Trade Rule",
    },
  ],
  hougaard: [
    {
      quote: "Normal people want to be right. Great traders want to be the best losers.",
      principle: "The Best Loser Wins — Chapter 1",
    },
    {
      quote: "The market is a mirror reflecting your inability to accept being wrong.",
      principle: "The Best Loser Wins — Pain Acceptance",
    },
    {
      quote: "If you add to a losing trade, you are not trading; you are gambling on hope.",
      principle: "The Best Loser Wins — Anti-Martingale Rule",
    },
    {
      quote: "Losing money quickly and calmly is the primary superpower of institutional longevity.",
      principle: "The Best Loser Wins — Frictionless Stop-Outs",
    },
    {
      quote: "Every single account blow-up starts with refusing to take a tiny, manageable loss.",
      principle: "The Best Loser Wins — Capital Preservation",
    },
  ],
  livermore: [
    {
      quote: "It never was my thinking that made the big money for me. It also was my sitting. Got that? My sitting tight!",
      principle: "Reminiscences of a Stock Operator — Chapter VIII",
    },
    {
      quote: "There is the plain fool, who does the wrong thing at all times everywhere, but there is the Wall Street fool, who thinks he must trade all the time.",
      principle: "Reminiscences of a Stock Operator — Chapter V",
    },
    {
      quote: "Do not anticipate the market. Wait until you see the market confirm before you enter.",
      principle: "Reminiscences of a Stock Operator — Pivotal Points",
    },
    {
      quote: "The market does not beat them. They beat themselves, because though they have brains they cannot sit tight.",
      principle: "Reminiscences of a Stock Operator — The Big Swing",
    },
    {
      quote: "The line of least resistance is the only master worth obeying.",
      principle: "Reminiscences of a Stock Operator — Tape Reading",
    },
  ],
  schwagerPTJ: [
    {
      quote: "I'm looking for 5:1 risk/reward. 5:1 means I can be wrong 80% of the time and still not lose a dime.",
      author: "Paul Tudor Jones",
      source: "Market Wizards",
    },
    {
      quote: "Don't focus on making money; focus on protecting what you have.",
      author: "Paul Tudor Jones",
      source: "Market Wizards",
    },
    {
      quote: "Win or lose, everybody gets what they want out of the market.",
      author: "Ed Seykota",
      source: "Market Wizards",
    },
    {
      quote: "If you have an approach that makes money, then don't try to change it to make even more money.",
      author: "Bruce Kovner",
      source: "Market Wizards",
    },
    {
      quote: "The elements of good trading are: 1. Cutting losses. 2. Cutting losses. 3. Cutting losses.",
      author: "Ed Seykota",
      source: "Market Wizards",
    },
  ],
};

// ----------------------------------------------------------------------------
// Mathematical Calculation Functions
// ----------------------------------------------------------------------------

/**
 * Computes Mark Douglas 20-Trade Batch Metrics
 */
export function calculateDouglasBatchMetrics(trades: BatchTradeRecord[], batchId = 1): DouglasBatchMetrics {
  const completed = trades.length;
  if (completed === 0) {
    return {
      currentBatchId: batchId,
      completedTrades: 0,
      wins: 0,
      losses: 0,
      winRate: 0,
      avgWinR: 0,
      avgLossR: 0,
      expectancyR: 0,
      totalR: 0,
      isComplete: false,
      statusLabel: 'Awaiting Trade #1 in 20-Trade Sample',
      ruleComplianceRate: 100,
    };
  }

  const wins = trades.filter((t) => t.outcome === 'WIN');
  const losses = trades.filter((t) => t.outcome === 'LOSS');
  const followed = trades.filter((t) => t.followedRules).length;

  const winCount = wins.length;
  const lossCount = losses.length;
  const winRate = (winCount / completed) * 100;

  const sumWinR = wins.reduce((acc, t) => acc + Math.abs(t.rMultiple), 0);
  const sumLossR = losses.reduce((acc, t) => acc + Math.abs(t.rMultiple), 0);

  const avgWinR = winCount > 0 ? sumWinR / winCount : 0;
  const avgLossR = lossCount > 0 ? sumLossR / lossCount : 1; // default 1R if no loss yet

  // Mark Douglas Expectancy: E = (Win% * AvgWinR) - (Loss% * AvgLossR)
  const pWin = winCount / completed;
  const pLoss = lossCount / completed;
  const expectancyR = pWin * avgWinR - pLoss * avgLossR;
  const totalR = sumWinR - sumLossR;

  const isComplete = completed >= 20;

  let statusLabel = '';
  if (!isComplete) {
    statusLabel = `Executing Batch: ${completed}/20 Trades Logged (${20 - completed} remaining before outcome evaluation)`;
  } else {
    statusLabel = expectancyR > 0
      ? `Batch #${batchId} Verified Positive Expectancy (+${expectancyR.toFixed(2)}R per trade)`
      : `Batch #${batchId} Evaluated: Negative Expectancy. Refine Rule Execution.`;
  }

  return {
    currentBatchId: batchId,
    completedTrades: completed,
    wins: winCount,
    losses: lossCount,
    winRate: Math.round(winRate * 10) / 10,
    avgWinR: Math.round(avgWinR * 100) / 100,
    avgLossR: Math.round(avgLossR * 100) / 100,
    expectancyR: Math.round(expectancyR * 100) / 100,
    totalR: Math.round(totalR * 100) / 100,
    isComplete,
    statusLabel,
    ruleComplianceRate: Math.round((followed / completed) * 100),
  };
}

/**
 * Computes Tom Hougaard "Best Loser" Discipline Metrics
 */
export function calculateHougaardDiscipline(trades: BatchTradeRecord[]): HougaardDisciplineMetrics {
  const losses = trades.filter((t) => t.outcome === 'LOSS');
  if (losses.length === 0) {
    return {
      stopComplianceRate: 100,
      lossesLogged: 0,
      cleanCuts: 0,
      widenedStopsOrHoped: 0,
      disciplineScore: 95,
      disciplineTier: 'MASTER_LOSER',
      feedback: 'Zero uncontrolled losses logged. Perfect stop discipline maintained.',
    };
  }

  const cleanCuts = losses.filter((t) => t.stopCompliant).length;
  const widenedOrHoped = losses.length - cleanCuts;
  const stopComplianceRate = Math.round((cleanCuts / losses.length) * 100);

  // Score is heavily weighted by stop compliance
  const disciplineScore = Math.max(10, Math.min(100, stopComplianceRate));

  let disciplineTier: HougaardDisciplineMetrics['disciplineTier'] = 'MASTER_LOSER';
  let feedback = '';

  if (disciplineScore >= 90) {
    disciplineTier = 'MASTER_LOSER';
    feedback = 'Hougaard Master Status: You cut losses like an emotionless predator. Zero hope, pure execution.';
  } else if (disciplineScore >= 75) {
    disciplineTier = 'DISCIPLINED';
    feedback = 'Disciplined Operator: Generally respecting stops, but watch for occasional hesitation before cutting.';
  } else if (disciplineScore >= 50) {
    disciplineTier = 'HOPE_ADDICT';
    feedback = 'Hope Addict Alert: You moved your stop or held losing trades hoping for a bounce. High drawdown risk.';
  } else {
    disciplineTier = 'BLOWUP_RISK';
    feedback = 'Critical Warning: You refuse to accept losses. This is the exact retail pattern that leads to account liquidation.';
  }

  return {
    stopComplianceRate,
    lossesLogged: losses.length,
    cleanCuts,
    widenedStopsOrHoped: widenedOrHoped,
    disciplineScore,
    disciplineTier,
    feedback,
  };
}

/**
 * Computes Jesse Livermore Sitting Clock & Patience Metrics
 */
export function calculateLivermoreSitting(
  lastTradeTimestamp: number,
  currentPrice: number,
  sma200: number,
  rsi: number
): LivermoreSittingMetrics {
  const now = Date.now();
  const elapsedMs = Math.max(0, now - lastTradeTimestamp);
  const hours = Math.round((elapsedMs / (1000 * 60 * 60)) * 10) / 10;
  const days = Math.round((hours / 24) * 10) / 10;

  let patienceTier: LivermoreSittingMetrics['patienceTier'] = 'IMPULSIVE';
  if (hours < 4) {
    patienceTier = 'IMPULSIVE';
  } else if (hours < 24) {
    patienceTier = 'BUILDING';
  } else if (hours < 72) {
    patienceTier = 'DISCIPLINED_PATIENCE';
  } else {
    patienceTier = 'LIVERMORE_MASTER';
  }

  // Pivotal Point status based on price relation to 200 SMA and RSI
  let pivotalPointStatus: LivermoreSittingMetrics['pivotalPointStatus'] = 'CHOP_NO_MANS_LAND';
  if (rsi <= 32 && currentPrice <= sma200 * 1.02) {
    pivotalPointStatus = 'PIVOTAL_CAPITULATION';
  } else if (currentPrice > sma200 * 1.05 && rsi >= 60) {
    pivotalPointStatus = 'PIVOTAL_BREAKOUT';
  } else {
    pivotalPointStatus = 'CHOP_NO_MANS_LAND';
  }

  // Livermore quote rotation
  const quoteIdx = Math.floor((now / (1000 * 60 * 60 * 24)) % MINDSET_MASTER_QUOTES.livermore.length);
  const quote = {
    quote: MINDSET_MASTER_QUOTES.livermore[quoteIdx].quote,
    context: MINDSET_MASTER_QUOTES.livermore[quoteIdx].principle,
  };

  return {
    hoursInCashWaiting: hours,
    daysInCashWaiting: days,
    lastTradeTimestamp,
    patienceTier,
    pivotalPointStatus,
    quote,
  };
}

/**
 * Computes Paul Tudor Jones 5:1 Asymmetry Edge Filter
 */
export function calculatePTJAsymmetry(
  entryPrice: number,
  stopPrice: number,
  targetPrice: number
): PTJAsymmetryMetrics {
  if (entryPrice <= 0 || stopPrice <= 0 || targetPrice <= 0) {
    return {
      currentPrice: entryPrice,
      stopPrice,
      targetPrice,
      riskAmount: 0,
      rewardAmount: 0,
      asymmetryRatio: 0,
      breakevenWinRateReq: 50,
      rating: 'REJECT_POOR_ASYMMETRY',
      summary: 'Set valid Entry, Stop, and Target prices to calculate Asymmetric Edge.',
    };
  }

  const isLong = targetPrice > entryPrice;
  const riskAmount = isLong ? entryPrice - stopPrice : stopPrice - entryPrice;
  const rewardAmount = isLong ? targetPrice - entryPrice : entryPrice - targetPrice;

  if (riskAmount <= 0 || rewardAmount <= 0) {
    return {
      currentPrice: entryPrice,
      stopPrice,
      targetPrice,
      riskAmount: Math.max(0, riskAmount),
      rewardAmount: Math.max(0, rewardAmount),
      asymmetryRatio: 0,
      breakevenWinRateReq: 100,
      rating: 'REJECT_POOR_ASYMMETRY',
      summary: 'Invalid setup: Stop or target is inverted relative to position direction.',
    };
  }

  const asymmetryRatio = Math.round((rewardAmount / riskAmount) * 100) / 100;
  // Breakeven Win Rate formula: BE% = 1 / (1 + RR)
  const breakevenWinRateReq = Math.round((1 / (1 + asymmetryRatio)) * 1000) / 10;

  let rating: PTJAsymmetryMetrics['rating'] = 'REJECT_POOR_ASYMMETRY';
  let summary = '';

  if (asymmetryRatio >= 5.0) {
    rating = 'ELITE_PTJ_5_1';
    summary = `Paul Tudor Jones Holy Grail: 5:1+ Asymmetry. You only need a ${breakevenWinRateReq}% win rate to breakeven!`;
  } else if (asymmetryRatio >= 3.0) {
    rating = 'EXCELLENT_3_1';
    summary = `High Institutional Quality: 3:1 Asymmetry. Breakeven threshold is just ${breakevenWinRateReq}%.`;
  } else if (asymmetryRatio >= 2.0) {
    rating = 'ACCEPTABLE';
    summary = `Standard 2:1 Asymmetry. Requires >${breakevenWinRateReq}% win rate for long-term expectancy.`;
  } else {
    rating = 'REJECT_POOR_ASYMMETRY';
    summary = `REJECTED: Sub-optimal R:R (${asymmetryRatio}:1). Market Wizards rule: Never risk $1 to make less than $2.`;
  }

  return {
    currentPrice: entryPrice,
    stopPrice,
    targetPrice,
    riskAmount: Math.round(riskAmount * 100) / 100,
    rewardAmount: Math.round(rewardAmount * 100) / 100,
    asymmetryRatio,
    breakevenWinRateReq,
    rating,
    summary,
  };
}
