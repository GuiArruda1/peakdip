'use client';

import React, { useState, useMemo, useEffect } from 'react';
import {
  ShieldCheck,
  Zap,
  TrendingUp,
  TrendingDown,
  Layers,
  Sparkles,
  HelpCircle,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Play,
  Pause,
  RotateCcw,
  ChevronRight,
  ChevronLeft,
  Calculator,
  Compass,
  Award,
  Eye,
  Crosshair,
  Maximize2,
  MessageSquare,
  ArrowRight,
  Sliders,
  Target,
  BarChart2,
} from 'lucide-react';

// ============================================================================
// SIMULATOR TYPES & DATA
// ============================================================================

export interface Candle {
  index: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  annotation?: string;
  isSweep?: boolean;
  isRetest?: boolean;
  isBreakout?: boolean;
}

export interface SimulatorScenario {
  id: string;
  title: string;
  subtitle: string;
  badge: string;
  badgeColor: string;
  description: string;
  supportZone: { high: number; low: number; label: string };
  resistanceZone: { high: number; low: number; label: string };
  dynamicEma?: number[];
  dynamicVwap?: number[];
  tradeSetup: {
    type: 'LONG' | 'SHORT';
    entry: number;
    stopLoss: number;
    tp1: number;
    tp2: number;
    riskReward: string;
    rationale: string;
  };
  candles: Candle[];
}

export const SCENARIOS: SimulatorScenario[] = [
  {
    id: 'bounce_confluence',
    title: '1. Clean Support Zone Bounce (Confluence Play)',
    subtitle: 'Horizontal Demand Zone + 200 EMA + Bullish Wick Rejection',
    badge: 'HIGH WIN-RATE',
    badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    description:
      'Price descends into a pre-established demand zone. Notice how the candle wicks deeply into the zone to test liquidity and touches the rising 200 EMA before buyers aggressively step in, closing the candle near its high. This is the gold-standard institutional long entry.',
    supportZone: { high: 62400, low: 61800, label: 'Institutional Demand Zone ($61.8k - $62.4k)' },
    resistanceZone: { high: 66200, low: 65800, label: 'Range High Resistance ($65.8k - $66.2k)' },
    dynamicEma: [62800, 62600, 62450, 62300, 62200, 62250, 62350, 62500, 62700, 62900],
    tradeSetup: {
      type: 'LONG',
      entry: 62550,
      stopLoss: 61650,
      tp1: 64200,
      tp2: 65900,
      riskReward: '3.7 : 1',
      rationale:
        'Entry placed on confirmation close above the support band. Stop Loss placed safely 150 points beneath the wick extreme ($61,800).',
    },
    candles: [
      { index: 0, open: 64800, high: 65100, low: 64400, close: 64500, volume: 420, annotation: 'Approaching from mid-range' },
      { index: 1, open: 64500, high: 64650, low: 63800, close: 63900, volume: 510, annotation: 'Bearish momentum push' },
      { index: 2, open: 63900, high: 64050, low: 63100, close: 63200, volume: 680, annotation: 'Entering zone threshold' },
      { index: 3, open: 63200, high: 63300, low: 62400, close: 62500, volume: 820, annotation: 'Touching upper demand boundary' },
      {
        index: 4,
        open: 62500,
        high: 62650,
        low: 61820,
        close: 62520,
        volume: 1350,
        annotation: '⚡ Confluence Wick Rejection: Touches 200 EMA & rebounds violently!',
        isSweep: true,
      },
      {
        index: 5,
        open: 62520,
        high: 63300,
        low: 62480,
        close: 63250,
        volume: 1100,
        annotation: '🟢 Bullish Engulfing Confirmation: Institutional buying confirmed',
      },
      { index: 6, open: 63250, high: 63900, low: 63150, close: 63850, volume: 940, annotation: 'Expansion phase begins' },
      { index: 7, open: 63850, high: 64500, low: 63700, close: 64300, volume: 890, annotation: '🎯 TP1 Target ($64.2k) reached!' },
      { index: 8, open: 64300, high: 65200, low: 64200, close: 65100, volume: 760, annotation: 'Climbing toward ceiling' },
      { index: 9, open: 65100, high: 66050, low: 64950, close: 65950, volume: 980, annotation: '🎯 TP2 Major Resistance reached!' },
    ],
  },
  {
    id: 'breakdown_retest',
    title: '2. Support Breakdown & Retest Flip (Role Reversal)',
    subtitle: 'Old Floor Becomes New Ceiling via Trapped Buyer Liquidation',
    badge: 'HIGH PROBABILITY SHORT',
    badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
    description:
      'Support does not last forever. When price decisively closes below a key support floor on high volume, buyers who accumulated are trapped in underwater positions. On the first relief bounce back to that exact line, trapped longs sell at breakeven, converting the level into overhead resistance.',
    supportZone: { high: 63500, low: 63000, label: 'Broken Support Flipped to Overhead Resistance' },
    resistanceZone: { high: 66500, low: 66000, label: 'Prior Macro High' },
    dynamicVwap: [64200, 64000, 63800, 63500, 63200, 63000, 62800, 62600, 62300, 61900],
    tradeSetup: {
      type: 'SHORT',
      entry: 63150,
      stopLoss: 63750,
      tp1: 61800,
      tp2: 60200,
      riskReward: '4.2 : 1',
      rationale:
        'Short entered on retest rejection wick beneath $63,500. Stop Loss placed above the retest high ($63,750). Target lower liquidity.',
    },
    candles: [
      { index: 0, open: 64200, high: 64400, low: 63800, close: 63900, volume: 540, annotation: 'Consolidation above support' },
      { index: 1, open: 63900, high: 64100, low: 63300, close: 63400, volume: 620, annotation: 'Testing support floor' },
      {
        index: 2,
        open: 63400,
        high: 63500,
        low: 62100,
        close: 62200,
        volume: 1650,
        annotation: '🚨 Clean Breakdown Candle: Heavy volume slices through floor!',
        isBreakout: true,
      },
      { index: 3, open: 62200, high: 62450, low: 61900, close: 62350, volume: 720, annotation: 'Temporary selling pause' },
      { index: 4, open: 62350, high: 62900, low: 62200, close: 62800, volume: 580, annotation: 'Weak relief rally (Low volume)' },
      {
        index: 5,
        open: 62800,
        high: 63480,
        low: 62750,
        close: 62950,
        volume: 890,
        annotation: '⚡ The Retest Rejection: Long upper wick fails at old support! Trapped longs dump.',
        isRetest: true,
      },
      { index: 6, open: 62950, high: 63050, low: 62100, close: 62150, volume: 1120, annotation: 'Bearish confirmation close: Short activated' },
      { index: 7, open: 62150, high: 62250, low: 61600, close: 61750, volume: 930, annotation: '🎯 TP1 ($61.8k) hit swiftly' },
      { index: 8, open: 61750, high: 61900, low: 60900, close: 61000, volume: 850, annotation: 'Free fall cascading stops' },
      { index: 9, open: 61000, high: 61150, low: 60100, close: 60150, volume: 1400, annotation: '🎯 TP2 ($60.2k) hit at lower target!' },
    ],
  },
  {
    id: 'liquidity_sweep',
    title: '3. The Liquidity Sweep / Wyckoff Spring (Stop Hunt Trap)',
    subtitle: 'Institutional Manipulation to Trigger Stops Before the Real Move',
    badge: 'INSTITUTIONAL SPECIAL',
    badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
    description:
      'Retail traders place their stop-loss orders directly beneath obvious support. Institutions intentionally engineer a flash drop beneath the level to trigger these stop-loss sell orders, filling their massive limit buy orders without driving the price up. Once retail stops are consumed, the market explodes upward.',
    supportZone: { high: 60500, low: 60000, label: 'Retail Equal Lows Support Zone ($60k)' },
    resistanceZone: { high: 64000, low: 63500, label: 'Range High Resistance' },
    tradeSetup: {
      type: 'LONG',
      entry: 60600,
      stopLoss: 59350,
      tp1: 62200,
      tp2: 63800,
      riskReward: '3.8 : 1',
      rationale:
        'Entry taken immediately when candle closes back ABOVE the support floor ($60.5k). Stop Loss placed under the sweep spike low ($59,400).',
    },
    candles: [
      { index: 0, open: 61200, high: 61500, low: 60800, close: 60950, volume: 480, annotation: 'Ranging above equal lows' },
      { index: 1, open: 60950, high: 61100, low: 60400, close: 60500, volume: 550, annotation: 'Testing the obvious floor' },
      { index: 2, open: 60500, high: 60900, low: 60350, close: 60600, volume: 610, annotation: 'Forming textbook double bottom' },
      { index: 3, open: 60600, high: 60750, low: 60200, close: 60300, volume: 730, annotation: 'Retail clustering stops at $59.9k' },
      {
        index: 4,
        open: 60300,
        high: 60400,
        low: 59420,
        close: 60580,
        volume: 2450,
        annotation: '⚡ THE SPRING / STOP HUNT: Flash dump to $59.4k liquidates retail, absorbs volume & snaps back!',
        isSweep: true,
      },
      {
        index: 5,
        open: 60580,
        high: 61400,
        low: 60550,
        close: 61350,
        volume: 1600,
        annotation: '🟢 Short Squeeze Kickoff: Trapped breakout shorts caught offside',
      },
      { index: 6, open: 61350, high: 62300, low: 61250, close: 62250, volume: 1250, annotation: '🎯 TP1 ($62.2k) reached' },
      { index: 7, open: 62250, high: 62800, low: 62100, close: 62700, volume: 910, annotation: 'Momentum expansion continuation' },
      { index: 8, open: 62700, high: 63400, low: 62600, close: 63350, volume: 880, annotation: 'Approaching ceiling' },
      { index: 9, open: 63350, high: 64100, low: 63200, close: 63900, volume: 1100, annotation: '🎯 TP2 ($63.8k) fully captured!' },
    ],
  },
  {
    id: 'dynamic_sr',
    title: '4. Dynamic S&R Trend Ride (20 EMA & Anchored VWAP)',
    subtitle: 'How Algorithms Use Mathematical Curves as Dynamic Bounces',
    badge: 'TREND CONTINUATION',
    badgeColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
    description:
      'In strong trending markets, horizontal support levels are rarely revisited because price moves too fast. Instead, institutional execution algos (TWAP & VWAP) step in at dynamic curves like the 20 Exponential Moving Average and Anchored VWAP.',
    supportZone: { high: 52000, low: 51200, label: 'Base Support Level' },
    resistanceZone: { high: 58000, low: 57500, label: 'Expansion Target' },
    dynamicEma: [52000, 52600, 53200, 53800, 54400, 55000, 55600, 56200, 56800, 57400],
    dynamicVwap: [51800, 52300, 52900, 53500, 54100, 54700, 55200, 55800, 56300, 56900],
    tradeSetup: {
      type: 'LONG',
      entry: 54600,
      stopLoss: 53950,
      tp1: 56200,
      tp2: 57800,
      riskReward: '4.1 : 1',
      rationale:
        'Entry on shallow pullback wick testing the 20 EMA in a confirmed trend. Stop loss placed 2 candles below dynamic curve.',
    },
    candles: [
      { index: 0, open: 52000, high: 52800, low: 51950, close: 52700, volume: 600, annotation: 'Trend inception off base' },
      { index: 1, open: 52700, high: 53500, low: 52650, close: 53400, volume: 650, annotation: 'Push above 20 EMA' },
      { index: 2, open: 53400, high: 54200, low: 53300, close: 54100, volume: 720, annotation: 'Strong trending candles' },
      { index: 3, open: 54100, high: 54300, low: 53750, close: 53900, volume: 510, annotation: 'Healthy shallow pullback' },
      {
        index: 4,
        open: 53900,
        high: 54600,
        low: 53820,
        close: 54550,
        volume: 980,
        annotation: '⚡ 20-EMA Dynamic Touch: Wick tests 20 EMA curve and buyers absorb immediately!',
      },
      { index: 5, open: 54550, high: 55400, low: 54500, close: 55300, volume: 840, annotation: 'Continuation high established' },
      { index: 6, open: 55300, high: 56350, low: 55200, close: 56250, volume: 920, annotation: '🎯 TP1 ($56.2k) captured' },
      { index: 7, open: 56250, high: 56700, low: 55900, close: 56100, volume: 610, annotation: 'Minor pause' },
      { index: 8, open: 56100, high: 57200, low: 56000, close: 57100, volume: 780, annotation: 'Third wave extension' },
      { index: 9, open: 57100, high: 58100, low: 57000, close: 57950, volume: 1050, annotation: '🎯 TP2 ($57.8k) captured!' },
    ],
  },
  {
    id: 'volume_profile',
    title: '5. Volume Profile Auction (VAH Rejection to POC Magnet)',
    subtitle: 'Trading the Value Area: POC, Value Area High (VAH) & Value Area Low (VAL)',
    badge: 'AUCTION THEORY',
    badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    description:
      'The market is an auction seeking fair value. In a balanced market, the Point of Control (POC) represents the fairest price with the highest volume traded. When price pokes outside the Value Area High (VAH) but fails to find new buying volume, it gets aggressively rejected back toward the magnetic POC.',
    supportZone: { high: 47200, low: 46800, label: 'Value Area Low (VAL) Support' },
    resistanceZone: { high: 51200, low: 50800, label: 'Value Area High (VAH) Overhead Resistance' },
    tradeSetup: {
      type: 'SHORT',
      entry: 50700,
      stopLoss: 51500,
      tp1: 49000,
      tp2: 47400,
      riskReward: '3.6 : 1',
      rationale:
        'Short taken when price fails auction above VAH and closes back inside the Value Area. Target POC ($49,000) then VAL ($47,400).',
    },
    candles: [
      { index: 0, open: 48600, high: 49200, low: 48500, close: 49000, volume: 1200, annotation: 'Trading at fair value POC ($49k)' },
      { index: 1, open: 49000, high: 49800, low: 48900, close: 49700, volume: 850, annotation: 'Auction rotates upward' },
      { index: 2, open: 49700, high: 50500, low: 49600, close: 50400, volume: 720, annotation: 'Approaching VAH boundary' },
      {
        index: 3,
        open: 50400,
        high: 51350,
        low: 50350,
        close: 50750,
        volume: 590,
        annotation: '⚡ Low Volume VAH Rejection: Buyers refuse to bid higher! Weakness confirmed.',
        isSweep: true,
      },
      { index: 4, open: 50750, high: 50850, low: 50100, close: 50150, volume: 810, annotation: 'Re-entering Value Area: Short initiated' },
      { index: 5, open: 50150, high: 50250, low: 49500, close: 49600, volume: 940, annotation: 'Rotating downward toward center' },
      { index: 6, open: 49600, high: 49700, low: 48950, close: 49000, volume: 1450, annotation: '🎯 TP1: Magnetic POC ($49.0k) hit with high volume' },
      { index: 7, open: 49000, high: 49100, low: 48400, close: 48500, volume: 890, annotation: 'Auction expansion through POC' },
      { index: 8, open: 48500, high: 48650, low: 47700, close: 47800, volume: 760, annotation: 'Heading toward VAL floor' },
      { index: 9, open: 47800, high: 47900, low: 47250, close: 47350, volume: 1100, annotation: '🎯 TP2: Value Area Low ($47.4k) reached!' },
    ],
  },
];

// ============================================================================
// PRACTICE DRILL (QUIZ) QUESTIONS
// ============================================================================

interface QuizQuestion {
  id: number;
  title: string;
  context: string;
  chartDescription: string;
  options: { id: string; text: string; isCorrect: boolean }[];
  explanation: string;
  amateurMistake: string;
}

const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 1,
    title: 'Question 1: The Wick Below Support',
    context: 'Bitcoin is hovering at $62,000, a key 4-hour horizontal support zone. The active 15m candle suddenly drops to $61,600 (-400 pts), but within 3 minutes snaps back up and closes at $62,150 with a long lower shadow and 3x average volume.',
    chartDescription: 'Hammer / Pinbar candle forming right below support on a massive volume spike, closing well inside the support band.',
    options: [
      { id: 'a', text: 'Panic sell or short immediately because the level broke by $400.', isCorrect: false },
      { id: 'b', text: 'Buy LONG on candle close, with a Stop Loss just beneath the $61,600 wick low (Wyckoff Spring setup).', isCorrect: true },
      { id: 'c', text: 'Wait for price to drop another 5% to confirm the bear trend.', isCorrect: false },
      { id: 'd', text: 'Open both a long and short simultaneously without a stop loss.', isCorrect: false },
    ],
    explanation:
      'Correct! This is a textbook Liquidity Sweep (Stop Hunt / Wyckoff Spring). The flash drop triggered clustered retail stops, which institutions absorbed as cheap limit buys. The candle close back inside the support zone with a long lower shadow is institutional accumulation confirmation.',
    amateurMistake:
      'Amateurs panic-sell or enter breakout shorts on the live red wick, getting chopped and trapped at the absolute bottom.',
  },
  {
    id: 2,
    title: 'Question 2: Broken Floor Retest',
    context: 'Ethereum broke down through a major $2,800 support floor with a full-bodied red candle. Two hours later, price stages a weak, low-volume rally back up to $2,795 and prints a spinning top with a long upper wick rejected by $2,800.',
    chartDescription: 'Clean breakdown followed by a low-volume retest of the broken level from underneath with upper wick rejection.',
    options: [
      { id: 'a', text: 'Buy aggressively because Ethereum is "cheap" and returning to $2,800.', isCorrect: false },
      { id: 'b', text: 'Ignore the chart and wait for the weekend.', isCorrect: false },
      { id: 'c', text: 'Enter a SHORT position at the retest rejection with a stop-loss above the wick high (~$2,815).', isCorrect: true },
      { id: 'd', text: 'Place a market buy order hoping for an immediate V-shaped all-time high.', isCorrect: false },
    ],
    explanation:
      'Correct! This is the Role Reversal principle. When support breaks, buyers trapped at $2,800 use the relief rally to dump at breakeven. That trapped supply converts the old floor into an iron ceiling. Shorting the retest rejection offers the highest statistical risk-reward.',
    amateurMistake:
      'Amateurs see green relief candles and assume "the dip is over," buying directly into trapped institutional selling pressure.',
  },
  {
    id: 3,
    title: 'Question 3: Stop-Loss Placement Anatomy',
    context: 'You are buying a valid support zone between $180.00 and $181.50 on SOL. The lowest wick in the recent cluster reached $179.40 before rebounding. Where should your protective Stop Loss be located?',
    chartDescription: 'Demand zone at $180-$181.50 with a structural sweep low at $179.40.',
    options: [
      { id: 'a', text: 'Right on the line at $180.00 exact.', isCorrect: false },
      { id: 'b', text: 'Structurally below the entire liquidity cluster at ~$178.90 (invalidation level).', isCorrect: true },
      { id: 'c', text: 'No stop loss at all; crypto always comes back.', isCorrect: false },
      { id: 'd', text: 'At $181.00 inside the support band.', isCorrect: false },
    ],
    explanation:
      'Correct! Never place your stop loss right on the round support line—market makers routinely wick 10 to 30 cents below obvious levels to harvest liquidity. Your stop loss must be placed below the structural invalidation wick ($179.40), where your thesis is mathematically proven wrong.',
    amateurMistake:
      'Amateurs put stops at $179.95, get wicked out to the exact cent, and then watch price rally 20% without them.',
  },
  {
    id: 4,
    title: 'Question 4: Multiple Confluence Rule',
    context: 'You spot a potential long setup. Which of the following scenarios provides institutional-grade confluence?',
    chartDescription: 'Multiple independent indicators aligning at the exact same price zone.',
    options: [
      { id: 'a', text: 'Only a random trendline drawn across two wicks on a 1-minute chart.', isCorrect: false },
      { id: 'b', text: 'Horizontal Demand Zone + Daily 200 EMA + Volume Profile POC + RSI Oversold (<30).', isCorrect: true },
      { id: 'c', text: 'A social media influencer posted a rocket emoji.', isCorrect: false },
      { id: 'd', text: 'Price is falling really fast so it has to bounce soon.', isCorrect: false },
    ],
    explanation:
      'Correct! Institutional quantitative desks look for multi-layered confluence. When a structural horizontal demand zone aligns with the 200 EMA, high-volume POC node, and momentum exhaustion, the probability of an asymmetric mean-reversion bounce rises above 70%.',
    amateurMistake:
      'Relying on a single subjective diagonal line and betting high leverage with zero confluence.',
  },
];

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function BrainSupportResistanceAcademy() {
  const [selectedScenarioIndex, setSelectedScenarioIndex] = useState<number>(0);
  const [currentStep, setCurrentStep] = useState<number>(4); // default to step 4 (the critical action candle)
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'simulator' | 'pillars' | 'quiz' | 'calculator'>('simulator');

  // Simulator Visual Toggles
  const [showZones, setShowZones] = useState<boolean>(true);
  const [showIndicators, setShowIndicators] = useState<boolean>(true);
  const [showLiquidity, setShowLiquidity] = useState<boolean>(true);
  const [showTradePlan, setShowTradePlan] = useState<boolean>(true);

  // Quiz State
  const [quizAnswers, setQuizAnswers] = useState<Record<number, string>>({});
  const [quizSubmitted, setQuizSubmitted] = useState<Record<number, boolean>>({});

  // Calculator State
  const [calcAsset, setCalcAsset] = useState<string>('BTCUSDT');
  const [calcPrice, setCalcPrice] = useState<number>(64000);
  const [calcResistance, setCalcResistance] = useState<number>(66000);
  const [calcSupport, setCalcSupport] = useState<number>(62000);
  const [calcAccountSize, setCalcAccountSize] = useState<number>(5000);
  const [calcRiskPct, setCalcRiskPct] = useState<number>(1.5); // 1.5% default risk

  const currentScenario = SCENARIOS[selectedScenarioIndex];
  const maxSteps = currentScenario.candles.length - 1;

  // Auto-play interval
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentStep((prev) => {
          if (prev >= maxSteps) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, 1400);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPlaying, maxSteps]);

  // When switching scenario, reset step to 4
  const handleSelectScenario = (idx: number) => {
    setSelectedScenarioIndex(idx);
    setCurrentStep(4);
    setIsPlaying(false);
  };

  // SVG Chart Dimensions & Scale calculations
  const chartWidth = 740;
  const chartHeight = 320;
  const paddingY = 40;
  const paddingX = 40;

  const visibleCandles = useMemo(() => {
    return currentScenario.candles.slice(0, currentStep + 1);
  }, [currentScenario, currentStep]);

  // Price range for vertical scaling
  const priceRange = useMemo(() => {
    const allPrices: number[] = [];
    currentScenario.candles.forEach((c) => {
      allPrices.push(c.high, c.low);
    });
    allPrices.push(
      currentScenario.supportZone.low,
      currentScenario.supportZone.high,
      currentScenario.resistanceZone.low,
      currentScenario.resistanceZone.high
    );
    if (currentScenario.dynamicEma) allPrices.push(...currentScenario.dynamicEma);
    if (currentScenario.dynamicVwap) allPrices.push(...currentScenario.dynamicVwap);

    const min = Math.min(...allPrices);
    const max = Math.max(...allPrices);
    const buffer = (max - min) * 0.08;
    return {
      min: min - buffer,
      max: max + buffer,
    };
  }, [currentScenario]);

  // Helper to map price to Y coordinate
  const getY = (price: number) => {
    const range = priceRange.max - priceRange.min;
    if (range <= 0) return chartHeight / 2;
    const norm = (price - priceRange.min) / range;
    return chartHeight - paddingY - norm * (chartHeight - paddingY * 2);
  };

  // Helper to map candle index to X coordinate
  const getX = (index: number) => {
    const total = currentScenario.candles.length;
    const stepX = (chartWidth - paddingX * 2) / (total - 1 || 1);
    return paddingX + index * stepX;
  };

  // Calculator outputs
  const calcResults = useMemo(() => {
    const bufferPct = 0.0075; // 0.75% zone buffer
    const supHigh = calcSupport * (1 + bufferPct);
    const supLow = calcSupport * (1 - bufferPct);
    const resHigh = calcResistance * (1 + bufferPct);
    const resLow = calcResistance * (1 - bufferPct);

    // Max dollar risk allowed
    const maxRiskDollars = (calcAccountSize * calcRiskPct) / 100;

    // Long Play: Buy at Support High, Stop below Support Low
    const longEntry = supHigh;
    const longStop = supLow * 0.995; // 0.5% below zone
    const longRiskPerUnit = Math.max(1, longEntry - longStop);
    const longUnits = maxRiskDollars / longRiskPerUnit;
    const longPositionNotional = longUnits * longEntry;
    const longTp1 = calcSupport + (calcResistance - calcSupport) * 0.5; // Mid-point
    const longTp2 = resLow;
    const longReward = longTp2 - longEntry;
    const longRR = (longReward / longRiskPerUnit).toFixed(2);

    // Short Play: Short at Resistance Low, Stop above Resistance High
    const shortEntry = resLow;
    const shortStop = resHigh * 1.005; // 0.5% above zone
    const shortRiskPerUnit = Math.max(1, shortStop - shortEntry);
    const shortUnits = maxRiskDollars / shortRiskPerUnit;
    const shortPositionNotional = shortUnits * shortEntry;
    const shortTp1 = calcResistance - (calcResistance - calcSupport) * 0.5;
    const shortTp2 = supHigh;
    const shortReward = shortEntry - shortTp2;
    const shortRR = (shortReward / shortRiskPerUnit).toFixed(2);

    return {
      supHigh,
      supLow,
      resHigh,
      resLow,
      maxRiskDollars,
      long: {
        entry: longEntry,
        stopLoss: longStop,
        tp1: longTp1,
        tp2: longTp2,
        units: longUnits,
        notional: longPositionNotional,
        riskReward: longRR,
      },
      short: {
        entry: shortEntry,
        stopLoss: shortStop,
        tp1: shortTp1,
        tp2: shortTp2,
        units: shortUnits,
        notional: shortPositionNotional,
        riskReward: shortRR,
      },
    };
  }, [calcResistance, calcSupport, calcAccountSize, calcRiskPct]);

  // Quiz Score Calculation
  const quizScore = useMemo(() => {
    let score = 0;
    QUIZ_QUESTIONS.forEach((q) => {
      const selected = quizAnswers[q.id];
      const correctOption = q.options.find((o) => o.isCorrect)?.id;
      if (selected && selected === correctOption) {
        score += 1;
      }
    });
    return score;
  }, [quizAnswers]);

  const handleSelectQuizOption = (qId: number, optId: string) => {
    setQuizAnswers((prev) => ({ ...prev, [qId]: optId }));
    setQuizSubmitted((prev) => ({ ...prev, [qId]: true }));
  };

  const handleAskCopilot = (prompt: string) => {
    window.dispatchEvent(
      new CustomEvent('open-copilot-query', {
        detail: { query: prompt },
      })
    );
  };

  return (
    <div className="w-full space-y-6">
      {/* Top Mastery Header */}
      <div className="bg-gradient-to-r from-amber-950/40 via-slate-900/80 to-purple-950/40 border border-amber-500/30 rounded-2xl p-5 sm:p-6 shadow-2xl backdrop-blur-md">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-2 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
              <span>THE INSTITUTIONAL S&R MATRIX</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black font-mono text-white tracking-tight flex items-center gap-2">
              <span>Master Support & Resistance Like a Market Maker</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Amateurs draw sharp single-dollar lines and get chopped by liquidity stop-hunts. Institutional quant desks trade <strong className="text-amber-300">Supply & Demand Liquidity Zones</strong>, <strong className="text-cyan-300">Dynamic Moving Averages</strong>, and <strong className="text-purple-300">Auction Market Profile Nodes</strong>.
            </p>
          </div>

          {/* Quick Tab Switcher */}
          <div className="flex flex-wrap items-center gap-1.5 bg-slate-950/70 p-1.5 rounded-xl border border-slate-800">
            <button
              onClick={() => setActiveTab('simulator')}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'simulator'
                  ? 'bg-amber-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Visual Simulator</span>
            </button>
            <button
              onClick={() => setActiveTab('pillars')}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'pillars'
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>The 5 Pillars</span>
            </button>
            <button
              onClick={() => setActiveTab('quiz')}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'quiz'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Award className="w-3.5 h-3.5" />
              <span>Practice Drill ({quizScore}/4)</span>
            </button>
            <button
              onClick={() => setActiveTab('calculator')}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'calculator'
                  ? 'bg-cyan-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Calculator className="w-3.5 h-3.5" />
              <span>Zone & Risk Calculator</span>
            </button>
          </div>
        </div>
      </div>

      {/* ==================================================================== */}
      {/* TAB 1: VISUAL CANDLESTICK S&R SIMULATOR */}
      {/* ==================================================================== */}
      {activeTab === 'simulator' && (
        <div className="space-y-6">
          {/* Scenario Selector Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {SCENARIOS.map((scen, idx) => (
              <button
                key={scen.id}
                onClick={() => handleSelectScenario(idx)}
                className={`px-3.5 py-2 rounded-xl text-xs font-mono font-bold transition-all whitespace-nowrap flex items-center gap-2 border ${
                  selectedScenarioIndex === idx
                    ? 'bg-slate-800 text-white border-amber-500/50 shadow-lg shadow-amber-950/40'
                    : 'bg-[#0B0F19]/80 text-slate-400 hover:text-slate-200 border-slate-800 hover:border-slate-700'
                }`}
              >
                <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold border ${scen.badgeColor}`}>
                  {scen.badge}
                </span>
                <span>{scen.title}</span>
              </button>
            ))}
          </div>

          {/* Active Scenario Banner */}
          <div className="bg-[#0B0F19]/90 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xl space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
              <div>
                <h3 className="text-base font-bold font-mono text-white flex items-center gap-2">
                  <span>{currentScenario.title}</span>
                </h3>
                <p className="text-xs text-amber-400 font-mono mt-0.5">{currentScenario.subtitle}</p>
                <p className="text-xs text-slate-300 mt-2 max-w-3xl leading-relaxed">
                  {currentScenario.description}
                </p>
              </div>

              {/* Visual Toggles */}
              <div className="flex flex-wrap items-center gap-1.5 self-start md:self-auto bg-slate-950/80 p-1.5 rounded-xl border border-slate-800 text-[11px] font-mono">
                <button
                  onClick={() => setShowZones(!showZones)}
                  className={`px-2 py-1 rounded transition-colors ${
                    showZones ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'text-slate-500'
                  }`}
                >
                  Zones {showZones ? 'ON' : 'OFF'}
                </button>
                <button
                  onClick={() => setShowIndicators(!showIndicators)}
                  className={`px-2 py-1 rounded transition-colors ${
                    showIndicators ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' : 'text-slate-500'
                  }`}
                >
                  Dynamic MAs {showIndicators ? 'ON' : 'OFF'}
                </button>
                <button
                  onClick={() => setShowLiquidity(!showLiquidity)}
                  className={`px-2 py-1 rounded transition-colors ${
                    showLiquidity ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' : 'text-slate-500'
                  }`}
                >
                  Liquidity Marks {showLiquidity ? 'ON' : 'OFF'}
                </button>
                <button
                  onClick={() => setShowTradePlan(!showTradePlan)}
                  className={`px-2 py-1 rounded transition-colors ${
                    showTradePlan ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'text-slate-500'
                  }`}
                >
                  Trade Plan {showTradePlan ? 'ON' : 'OFF'}
                </button>
              </div>
            </div>

            {/* Interactive Candlestick SVG Canvas */}
            <div className="relative w-full bg-[#080B11] border border-slate-800 rounded-xl overflow-hidden p-2 sm:p-4">
              <div className="w-full overflow-x-auto">
                <svg
                  viewBox={`0 0 ${chartWidth} ${chartHeight}`}
                  className="w-full h-auto max-h-[380px] select-none"
                >
                  {/* Grid Lines */}
                  <line x1={0} y1={getY(currentScenario.supportZone.high)} x2={chartWidth} y2={getY(currentScenario.supportZone.high)} stroke="#334155" strokeDasharray="3 3" strokeWidth="0.8" opacity="0.4" />
                  <line x1={0} y1={getY(currentScenario.resistanceZone.low)} x2={chartWidth} y2={getY(currentScenario.resistanceZone.low)} stroke="#334155" strokeDasharray="3 3" strokeWidth="0.8" opacity="0.4" />

                  {/* 1. SUPPORT DEMAND ZONE (Green Band) */}
                  {showZones && (
                    <g>
                      <rect
                        x={0}
                        y={getY(currentScenario.supportZone.high)}
                        width={chartWidth}
                        height={Math.max(12, getY(currentScenario.supportZone.low) - getY(currentScenario.supportZone.high))}
                        fill="rgba(16, 185, 129, 0.12)"
                        stroke="rgba(16, 185, 129, 0.4)"
                        strokeWidth="1"
                        strokeDasharray="4 2"
                      />
                      <text
                        x={10}
                        y={getY(currentScenario.supportZone.high) + 14}
                        fill="#34d399"
                        fontSize="10"
                        fontFamily="monospace"
                        fontWeight="bold"
                      >
                        {currentScenario.supportZone.label}
                      </text>
                    </g>
                  )}

                  {/* 2. RESISTANCE SUPPLY ZONE (Red Band) */}
                  {showZones && (
                    <g>
                      <rect
                        x={0}
                        y={getY(currentScenario.resistanceZone.high)}
                        width={chartWidth}
                        height={Math.max(12, getY(currentScenario.resistanceZone.low) - getY(currentScenario.resistanceZone.high))}
                        fill="rgba(244, 63, 94, 0.12)"
                        stroke="rgba(244, 63, 94, 0.4)"
                        strokeWidth="1"
                        strokeDasharray="4 2"
                      />
                      <text
                        x={10}
                        y={getY(currentScenario.resistanceZone.low) - 6}
                        fill="#fb7185"
                        fontSize="10"
                        fontFamily="monospace"
                        fontWeight="bold"
                      >
                        {currentScenario.resistanceZone.label}
                      </text>
                    </g>
                  )}

                  {/* 3. DYNAMIC 200 EMA or 20 EMA CURVE */}
                  {showIndicators && currentScenario.dynamicEma && (
                    <g>
                      <path
                        d={currentScenario.dynamicEma.reduce((acc, pt, i) => {
                          const x = getX(i);
                          const y = getY(pt);
                          return i === 0 ? `M ${x} ${y}` : `${acc} L ${x} ${y}`;
                        }, '')}
                        fill="none"
                        stroke="#f59e0b"
                        strokeWidth="2"
                        strokeDasharray="3 3"
                        opacity="0.8"
                      />
                      <text
                        x={getX(currentScenario.dynamicEma.length - 1) - 60}
                        y={getY(currentScenario.dynamicEma[currentScenario.dynamicEma.length - 1]) - 8}
                        fill="#fbbf24"
                        fontSize="9"
                        fontFamily="monospace"
                        fontWeight="bold"
                      >
                        Institutional EMA Curve
                      </text>
                    </g>
                  )}

                  {/* 4. DYNAMIC VWAP CURVE */}
                  {showIndicators && currentScenario.dynamicVwap && (
                    <g>
                      <path
                        d={currentScenario.dynamicVwap.reduce((acc, pt, i) => {
                          const x = getX(i);
                          const y = getY(pt);
                          return i === 0 ? `M ${x} ${y}` : `${acc} L ${x} ${y}`;
                        }, '')}
                        fill="none"
                        stroke="#06b6d4"
                        strokeWidth="2"
                        opacity="0.85"
                      />
                      <text
                        x={getX(currentScenario.dynamicVwap.length - 1) - 80}
                        y={getY(currentScenario.dynamicVwap[currentScenario.dynamicVwap.length - 1]) - 8}
                        fill="#22d3ee"
                        fontSize="9"
                        fontFamily="monospace"
                        fontWeight="bold"
                      >
                        Anchored VWAP
                      </text>
                    </g>
                  )}

                  {/* 5. TRADE SETUP BLUEPRINT OVERLAYS */}
                  {showTradePlan && (
                    <g opacity="0.9">
                      {/* Entry Line */}
                      <line
                        x1={0}
                        y1={getY(currentScenario.tradeSetup.entry)}
                        x2={chartWidth}
                        y2={getY(currentScenario.tradeSetup.entry)}
                        stroke="#38bdf8"
                        strokeWidth="1.5"
                        strokeDasharray="6 4"
                      />
                      <text
                        x={chartWidth - 140}
                        y={getY(currentScenario.tradeSetup.entry) - 5}
                        fill="#38bdf8"
                        fontSize="9"
                        fontFamily="monospace"
                        fontWeight="bold"
                      >
                        ENTRY: ${currentScenario.tradeSetup.entry.toLocaleString()}
                      </text>

                      {/* Stop Loss Line */}
                      <line
                        x1={0}
                        y1={getY(currentScenario.tradeSetup.stopLoss)}
                        x2={chartWidth}
                        y2={getY(currentScenario.tradeSetup.stopLoss)}
                        stroke="#ef4444"
                        strokeWidth="1.5"
                        strokeDasharray="4 4"
                      />
                      <text
                        x={chartWidth - 140}
                        y={getY(currentScenario.tradeSetup.stopLoss) - 5}
                        fill="#ef4444"
                        fontSize="9"
                        fontFamily="monospace"
                        fontWeight="bold"
                      >
                        STOP LOSS: ${currentScenario.tradeSetup.stopLoss.toLocaleString()}
                      </text>

                      {/* Take Profit 2 Line */}
                      <line
                        x1={0}
                        y1={getY(currentScenario.tradeSetup.tp2)}
                        x2={chartWidth}
                        y2={getY(currentScenario.tradeSetup.tp2)}
                        stroke="#10b981"
                        strokeWidth="1.5"
                        strokeDasharray="6 4"
                      />
                      <text
                        x={chartWidth - 140}
                        y={getY(currentScenario.tradeSetup.tp2) - 5}
                        fill="#10b981"
                        fontSize="9"
                        fontFamily="monospace"
                        fontWeight="bold"
                      >
                        TP2 TARGET: ${currentScenario.tradeSetup.tp2.toLocaleString()}
                      </text>
                    </g>
                  )}

                  {/* 6. CANDLESTICKS */}
                  {visibleCandles.map((c) => {
                    const cx = getX(c.index);
                    const isBullish = c.close >= c.open;
                    const candleColor = isBullish ? '#10b981' : '#f43f5e';
                    const topY = getY(Math.max(c.open, c.close));
                    const bottomY = getY(Math.min(c.open, c.close));
                    const highY = getY(c.high);
                    const lowY = getY(c.low);
                    const candleHeight = Math.max(2, bottomY - topY);
                    const isCurrent = c.index === currentStep;

                    return (
                      <g key={c.index} className="transition-all duration-300">
                        {/* Upper/Lower Wick */}
                        <line
                          x1={cx}
                          y1={highY}
                          x2={cx}
                          y2={lowY}
                          stroke={candleColor}
                          strokeWidth="1.5"
                        />

                        {/* Candle Body */}
                        <rect
                          x={cx - 8}
                          y={topY}
                          width={16}
                          height={candleHeight}
                          fill={candleColor}
                          stroke={isCurrent ? '#ffffff' : candleColor}
                          strokeWidth={isCurrent ? 2 : 1}
                          rx={1.5}
                        />

                        {/* Sweep / Highlight Pulse */}
                        {isCurrent && (
                          <circle
                            cx={cx}
                            cy={lowY}
                            r={6}
                            fill="none"
                            stroke="#38bdf8"
                            strokeWidth="2"
                            className="animate-ping"
                          />
                        )}

                        {/* Special Liquidity Markers */}
                        {showLiquidity && c.isSweep && (
                          <g>
                            <rect
                              x={cx - 45}
                              y={lowY + 12}
                              width={90}
                              height={18}
                              rx={4}
                              fill="rgba(168, 85, 247, 0.9)"
                              stroke="#c084fc"
                              strokeWidth="1"
                            />
                            <text
                              x={cx}
                              y={lowY + 24}
                              textAnchor="middle"
                              fill="#ffffff"
                              fontSize="8.5"
                              fontFamily="monospace"
                              fontWeight="bold"
                            >
                              LIQUIDITY SWEEP
                            </text>
                          </g>
                        )}

                        {showLiquidity && c.isRetest && (
                          <g>
                            <rect
                              x={cx - 45}
                              y={highY - 26}
                              width={90}
                              height={18}
                              rx={4}
                              fill="rgba(244, 63, 94, 0.9)"
                              stroke="#fb7185"
                              strokeWidth="1"
                            />
                            <text
                              x={cx}
                              y={highY - 14}
                              textAnchor="middle"
                              fill="#ffffff"
                              fontSize="8.5"
                              fontFamily="monospace"
                              fontWeight="bold"
                            >
                              RETEST REJECTION
                            </text>
                          </g>
                        )}
                      </g>
                    );
                  })}
                </svg>
              </div>

              {/* Candle Playback Controls */}
              <div className="mt-3 pt-3 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsPlaying(!isPlaying)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all flex items-center gap-1.5 ${
                      isPlaying
                        ? 'bg-rose-600 text-white'
                        : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg'
                    }`}
                  >
                    {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                    <span>{isPlaying ? 'Pause' : 'Play Simulation'}</span>
                  </button>

                  <button
                    onClick={() => {
                      setIsPlaying(false);
                      setCurrentStep((prev) => Math.max(0, prev - 1));
                    }}
                    disabled={currentStep <= 0}
                    className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white disabled:opacity-40 transition-colors"
                    title="Step Backward"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => {
                      setIsPlaying(false);
                      setCurrentStep((prev) => Math.min(maxSteps, prev + 1));
                    }}
                    disabled={currentStep >= maxSteps}
                    className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white disabled:opacity-40 transition-colors"
                    title="Step Forward"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => {
                      setIsPlaying(false);
                      setCurrentStep(4);
                    }}
                    className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors"
                    title="Reset to Critical Action Candle"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>

                  <span className="text-xs font-mono text-slate-400 ml-2">
                    Candle: <strong className="text-white">{currentStep + 1}</strong> / {currentScenario.candles.length}
                  </span>
                </div>

                {/* Progress bar slider */}
                <div className="flex items-center gap-2 w-full sm:w-64">
                  <span className="text-[10px] font-mono text-slate-500">T0</span>
                  <input
                    type="range"
                    min={0}
                    max={maxSteps}
                    value={currentStep}
                    onChange={(e) => {
                      setIsPlaying(false);
                      setCurrentStep(Number(e.target.value));
                    }}
                    className="w-full accent-amber-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
                  />
                  <span className="text-[10px] font-mono text-slate-500">END</span>
                </div>
              </div>
            </div>

            {/* Current Candle Narrative & Trade Blueprint Box */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono">
              {/* Box 1: Action Commentary */}
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
                <span className="text-[10px] uppercase text-amber-400 font-bold block">
                  🔍 Candle #{currentStep + 1} Microstructure Breakdown:
                </span>
                <p className="text-slate-200 text-xs leading-relaxed">
                  {currentScenario.candles[currentStep]?.annotation || 'Observing order flow around the zone boundary.'}
                </p>
                <div className="pt-2 text-[11px] text-slate-400 flex items-center justify-between">
                  <span>Price Close: <strong className="text-white">${currentScenario.candles[currentStep]?.close.toLocaleString()}</strong></span>
                  <span>Volume: <strong className="text-purple-400">{currentScenario.candles[currentStep]?.volume} lots</strong></span>
                </div>
              </div>

              {/* Box 2: Institutional Setup Blueprint */}
              <div className="p-3.5 rounded-xl bg-emerald-950/20 border border-emerald-500/30 space-y-1.5">
                <span className="text-[10px] uppercase text-emerald-400 font-bold block flex items-center justify-between">
                  <span>🎯 Institutional Execution Plan</span>
                  <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono text-[9px]">
                    R:R {currentScenario.tradeSetup.riskReward}
                  </span>
                </span>
                <div className="space-y-1 text-slate-300">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Direction:</span>
                    <strong className={currentScenario.tradeSetup.type === 'LONG' ? 'text-emerald-400' : 'text-rose-400'}>
                      {currentScenario.tradeSetup.type}
                    </strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Entry Trigger:</span>
                    <span className="text-white">${currentScenario.tradeSetup.entry.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Structural Stop:</span>
                    <span className="text-rose-400">${currentScenario.tradeSetup.stopLoss.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Take Profit 1 & 2:</span>
                    <span className="text-emerald-400">
                      ${currentScenario.tradeSetup.tp1.toLocaleString()} / ${currentScenario.tradeSetup.tp2.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Box 3: Why Amateurs Fail vs Pro Logic */}
              <div className="p-3.5 rounded-xl bg-purple-950/20 border border-purple-500/30 space-y-1.5 flex flex-col justify-between">
                <div>
                  <span className="text-[10px] uppercase text-purple-400 font-bold block">
                    ⚡ Why This Works (Order Flow Reality):
                  </span>
                  <p className="text-slate-300 text-[11px] leading-relaxed mt-1">
                    {currentScenario.tradeSetup.rationale}
                  </p>
                </div>

                <button
                  onClick={() =>
                    handleAskCopilot(
                      `Analyze the current chart of BTCUSDT for ${currentScenario.title.toLowerCase()} and show me the active S&R liquidity zones.`
                    )
                  }
                  className="w-full mt-2 py-1.5 px-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-purple-300 hover:text-white border border-purple-500/30 text-[11px] font-mono font-bold transition-all flex items-center justify-center gap-1.5"
                >
                  <MessageSquare className="w-3 h-3 text-purple-400" />
                  <span>Scan Live Market with Copilot</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* TAB 2: THE 5 INSTITUTIONAL S&R PILLARS */}
      {/* ==================================================================== */}
      {activeTab === 'pillars' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* PILLAR 1 */}
            <div className="bg-[#0B0F19]/90 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-amber-500/20 border border-amber-500/40 text-amber-400 font-mono font-bold text-xs flex items-center justify-center">
                  1
                </span>
                <h3 className="text-sm font-bold font-mono text-white">
                  Zone Over Line: The Liquidity Band Theorem
                </h3>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Prices in financial markets are matched in an auction. Large buyers and sellers do not sit at a single razor-thin dollar figure; their limit orders are dispersed across a spread.
              </p>
              <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-slate-400 space-y-1">
                <strong className="text-amber-300 block">📐 How to Draw Institutional Zones:</strong>
                <span>• Lower Bound: The lowest wick extreme of the pivot cluster.</span>
                <br />
                <span>• Upper Bound: The lowest body close of the pivot cluster.</span>
                <br />
                <span>• Result: A 0.5% – 1.5% buffer zone that absorbs wick volatility.</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div className="p-2 rounded-lg bg-rose-950/20 border border-rose-500/30 text-rose-300">
                  <strong className="block text-rose-400">❌ Retail Error:</strong>
                  Drawing a 1-pixel horizontal line at $60,000.00 and panicking when price drops to $59,850.
                </div>
                <div className="p-2 rounded-lg bg-emerald-950/20 border border-emerald-500/30 text-emerald-300">
                  <strong className="block text-emerald-400">✔️ Institutional Execution:</strong>
                  Marking $59,700–$60,200 as a demand pocket and looking for absorption wicks.
                </div>
              </div>
            </div>

            {/* PILLAR 2 */}
            <div className="bg-[#0B0F19]/90 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-purple-500/20 border border-purple-500/40 text-purple-400 font-mono font-bold text-xs flex items-center justify-center">
                  2
                </span>
                <h3 className="text-sm font-bold font-mono text-white">
                  The Role Reversal Principle (Polarity Flip)
                </h3>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                When a support zone breaks, it does not disappear. It undergoes a polarity inversion and transforms into heavy overhead resistance.
              </p>
              <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-slate-400 space-y-1">
                <strong className="text-purple-300 block">🧠 Trapped Trader Psychology:</strong>
                <span>1. Buyers accumulate at support expecting a bounce.</span>
                <br />
                <span>2. The floor collapses. Buyers are trapped in deep unrealized losses.</span>
                <br />
                <span>3. On the first relief bounce back to their entry, trapped buyers sell in relief at breakeven.</span>
                <br />
                <span>4. This flood of selling volume cements the level as unbreakable resistance.</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div className="p-2 rounded-lg bg-rose-950/20 border border-rose-500/30 text-rose-300">
                  <strong className="block text-rose-400">❌ Retail Error:</strong>
                  Buying the first green candle bouncing back into a newly broken support level.
                </div>
                <div className="p-2 rounded-lg bg-emerald-950/20 border border-emerald-500/30 text-emerald-300">
                  <strong className="block text-emerald-400">✔️ Institutional Execution:</strong>
                  Shorting the retest of the broken level with an invalidation stop above the retest wick.
                </div>
              </div>
            </div>

            {/* PILLAR 3 */}
            <div className="bg-[#0B0F19]/90 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-cyan-500/20 border border-cyan-500/40 text-cyan-400 font-mono font-bold text-xs flex items-center justify-center">
                  3
                </span>
                <h3 className="text-sm font-bold font-mono text-white">
                  Dynamic Support & Resistance (MAs & Anchored VWAP)
                </h3>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                In aggressive bull and bear trends, price rarely waits to touch old horizontal levels. Institutional algorithmic execution engines execute against continuous mathematical moving curves.
              </p>
              <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-slate-400 space-y-1">
                <strong className="text-cyan-300 block">📊 The 4 Sovereign Institutional Curves:</strong>
                <span>• 20 EMA: Short-term momentum highway in runaway breakouts.</span>
                <br />
                <span>• 50 SMA: Swing trader accumulation benchmark.</span>
                <br />
                <span>• 200 SMA: The macro bull/bear demarcation sovereign line.</span>
                <br />
                <span>• Anchored VWAP: True volume-weighted institutional average price since a major event.</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div className="p-2 rounded-lg bg-rose-950/20 border border-rose-500/30 text-rose-300">
                  <strong className="block text-rose-400">❌ Retail Error:</strong>
                  Trying to short strong trends because "price is too far from horizontal support."
                </div>
                <div className="p-2 rounded-lg bg-emerald-950/20 border border-emerald-500/30 text-emerald-300">
                  <strong className="block text-emerald-400">✔️ Institutional Execution:</strong>
                  Buying shallow pullbacks that wick into the rising 20 EMA and VWAP.
                </div>
              </div>
            </div>

            {/* PILLAR 4 */}
            <div className="bg-[#0B0F19]/90 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 font-mono font-bold text-xs flex items-center justify-center">
                  4
                </span>
                <h3 className="text-sm font-bold font-mono text-white">
                  Volume Profile & Auction Market Theory
                </h3>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Horizontal volume distribution reveals where millions of contracts were actually traded, completely overriding imaginary technical lines.
              </p>
              <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-slate-400 space-y-1">
                <strong className="text-emerald-300 block">🎯 The 3 Crucial Auction Nodes:</strong>
                <span>• Point of Control (POC): Price with the highest volume traded. Acts as a giant magnet.</span>
                <br />
                <span>• Value Area High (VAH): Upper boundary of 70% volume. Strong resistance to auction expansion.</span>
                <br />
                <span>• Value Area Low (VAL): Lower boundary of 70% volume. Strong support in balanced markets.</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div className="p-2 rounded-lg bg-rose-950/20 border border-rose-500/30 text-rose-300">
                  <strong className="block text-rose-400">❌ Retail Error:</strong>
                  Ignoring where volume traded and getting trapped in Low Volume Nodes (slippage zones).
                </div>
                <div className="p-2 rounded-lg bg-emerald-950/20 border border-emerald-500/30 text-emerald-300">
                  <strong className="block text-emerald-400">✔️ Institutional Execution:</strong>
                  Using VAH and VAL as mean-reversion triggers targeting the POC.
                </div>
              </div>
            </div>
          </div>

          {/* PILLAR 5 (Full Width Featured) */}
          <div className="bg-gradient-to-r from-purple-950/30 via-slate-900/90 to-amber-950/30 border border-purple-500/30 rounded-2xl p-5 sm:p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-300 font-bold font-mono text-sm">
                5
              </div>
              <div>
                <h3 className="text-base font-bold font-mono text-white">
                  Liquidity Sweeps, Wyckoff Springs & The Stop-Hunt Mechanism
                </h3>
                <p className="text-xs text-slate-400">The secret mechanic behind 80% of "failed breakouts"</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1.5">
                <span className="text-[10px] font-mono text-purple-400 font-bold uppercase">Phase 1: The Liquidity Pool</span>
                <p className="text-slate-300 leading-relaxed">
                  Retail traders cluster identical stop-loss orders 5–10 ticks beyond clean swing highs and lows. This creates a massive pool of resting stop-market orders.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1.5">
                <span className="text-[10px] font-mono text-amber-400 font-bold uppercase">Phase 2: The Engineered Sweep</span>
                <p className="text-slate-300 leading-relaxed">
                  Institutional desks push price momentarily through the level. This triggers millions in stop-sell orders, which institutions absorb at rock-bottom prices.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1.5">
                <span className="text-[10px] font-mono text-emerald-400 font-bold uppercase">Phase 3: The Spring & Markup</span>
                <p className="text-slate-300 leading-relaxed">
                  With retail stops flushed and institutional bags filled, price snaps aggressively back inside the zone. The breakout shorts are now squeezed, fueling a violent rally.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* TAB 3: INTERACTIVE PRACTICE DRILL (QUIZ) */}
      {/* ==================================================================== */}
      {activeTab === 'quiz' && (
        <div className="space-y-6">
          <div className="bg-[#0B0F19]/90 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold font-mono text-white flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-400" />
                <span>Test Your Market Eye: Institutional S&R Challenge</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Test your ability to differentiate retail traps from institutional execution.
              </p>
            </div>

            <div className="flex items-center gap-3 bg-slate-950 px-4 py-2 rounded-xl border border-slate-800">
              <span className="text-xs font-mono text-slate-400">Score:</span>
              <span className="text-lg font-mono font-black text-amber-400">
                {quizScore} / {QUIZ_QUESTIONS.length}
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/10 text-amber-300 border border-amber-500/30">
                {quizScore === 4
                  ? '🏆 QUANT MASTER'
                  : quizScore >= 2
                  ? '⚡ INSTITUTIONAL APPRENTICE'
                  : '🌱 NOVICE TRADER'}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {QUIZ_QUESTIONS.map((q) => {
              const selectedOption = quizAnswers[q.id];
              const isSubmitted = !!quizSubmitted[q.id];
              const correctOption = q.options.find((o) => o.isCorrect)?.id;
              const isUserCorrect = selectedOption === correctOption;

              return (
                <div
                  key={q.id}
                  className="bg-[#0B0F19]/90 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4"
                >
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="text-sm font-bold font-mono text-white flex items-center gap-2">
                      <span className="text-amber-400">{q.title}</span>
                    </h4>
                    {isSubmitted && (
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold flex items-center gap-1 border ${
                          isUserCorrect
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                            : 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                        }`}
                      >
                        {isUserCorrect ? (
                          <>
                            <CheckCircle2 className="w-3 h-3" />
                            <span>CORRECT</span>
                          </>
                        ) : (
                          <>
                            <XCircle className="w-3 h-3" />
                            <span>INCORRECT</span>
                          </>
                        )}
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed">{q.context}</p>

                  <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-[11px] font-mono text-purple-300">
                    <span className="text-slate-500 block text-[9px] uppercase">Chart Micro-Setup:</span>
                    {q.chartDescription}
                  </div>

                  {/* Options List */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {q.options.map((opt) => {
                      const isSelected = selectedOption === opt.id;
                      let btnStyle = 'bg-slate-900/90 text-slate-300 border-slate-800 hover:border-slate-700';

                      if (isSubmitted) {
                        if (opt.isCorrect) {
                          btnStyle = 'bg-emerald-950/40 text-emerald-200 border-emerald-500 shadow-md';
                        } else if (isSelected && !opt.isCorrect) {
                          btnStyle = 'bg-rose-950/40 text-rose-200 border-rose-500';
                        } else {
                          btnStyle = 'bg-slate-950 text-slate-600 border-slate-900';
                        }
                      } else if (isSelected) {
                        btnStyle = 'bg-amber-600 text-white border-amber-500 shadow-md';
                      }

                      return (
                        <button
                          key={opt.id}
                          onClick={() => handleSelectQuizOption(q.id, opt.id)}
                          className={`p-3 rounded-xl border text-left text-xs font-mono transition-all flex items-start gap-2.5 ${btnStyle}`}
                        >
                          <span className="font-bold text-amber-400 shrink-0 uppercase">
                            {opt.id}.
                          </span>
                          <span className="leading-relaxed">{opt.text}</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Explanation after answering */}
                  {isSubmitted && (
                    <div className="pt-3 border-t border-slate-800/80 space-y-2 animate-fadeIn text-xs">
                      <div className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-500/30 text-emerald-300 font-mono">
                        <strong className="block text-[10px] uppercase text-emerald-400 mb-0.5">
                          💡 Institutional Rationale:
                        </strong>
                        {q.explanation}
                      </div>
                      <div className="p-3 rounded-xl bg-rose-950/20 border border-rose-500/30 text-rose-300 font-mono">
                        <strong className="block text-[10px] uppercase text-rose-400 mb-0.5">
                          ⚠️ Amateur Trap to Avoid:
                        </strong>
                        {q.amateurMistake}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* TAB 4: LIVE S&R ZONE & POSITION SIZING CALCULATOR */}
      {/* ==================================================================== */}
      {activeTab === 'calculator' && (
        <div className="space-y-6">
          <div className="bg-[#0B0F19]/90 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-2xl space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800/80">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold font-mono text-white tracking-wide">
                    S&R ZONE BUFFER & ASYMMETRIC POSITION SIZING CALCULATOR
                  </h3>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
                    QUANT RISK ENGINE
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  Never trade a single line: calculate ±0.75% liquidity buffer zones and mathematical position sizes.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-slate-400">Target Risk/Trade:</span>
                <span className="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 font-mono font-bold text-xs border border-emerald-500/30">
                  {calcRiskPct}% (${calcResults.maxRiskDollars.toFixed(0)})
                </span>
              </div>
            </div>

            {/* Inputs Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
              <div className="space-y-1">
                <label className="text-[11px] font-mono text-slate-400 uppercase">Asset Symbol</label>
                <select
                  value={calcAsset}
                  onChange={(e) => {
                    setCalcAsset(e.target.value);
                    if (e.target.value === 'BTCUSDT') {
                      setCalcPrice(64000);
                      setCalcResistance(66000);
                      setCalcSupport(62000);
                    } else if (e.target.value === 'ETHUSDT') {
                      setCalcPrice(3200);
                      setCalcResistance(3400);
                      setCalcSupport(3000);
                    } else if (e.target.value === 'SPY') {
                      setCalcPrice(560);
                      setCalcResistance(575);
                      setCalcSupport(545);
                    }
                  }}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-cyan-500"
                >
                  <option value="BTCUSDT">BTC/USDT</option>
                  <option value="ETHUSDT">ETH/USDT</option>
                  <option value="SPY">SPY (S&P 500)</option>
                  <option value="CUSTOM">Custom Asset</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-mono text-slate-400 uppercase">Current Price ($)</label>
                <input
                  type="number"
                  value={calcPrice}
                  onChange={(e) => setCalcPrice(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-mono text-slate-400 uppercase">Major Resistance ($)</label>
                <input
                  type="number"
                  value={calcResistance}
                  onChange={(e) => setCalcResistance(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-rose-300 focus:outline-none focus:border-rose-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-mono text-slate-400 uppercase">Major Support ($)</label>
                <input
                  type="number"
                  value={calcSupport}
                  onChange={(e) => setCalcSupport(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-emerald-300 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-mono text-slate-400 uppercase">Portfolio Size ($)</label>
                <input
                  type="number"
                  value={calcAccountSize}
                  onChange={(e) => setCalcAccountSize(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-cyan-300 focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            {/* Computed Zones & Trade Blueprints Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* LONG BLUEPRINT (Support Zone Bounce) */}
              <div className="p-4 rounded-2xl bg-[#080B11] border border-emerald-500/30 space-y-3 shadow-lg">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-black text-emerald-400 flex items-center gap-1.5">
                    <TrendingUp className="w-4 h-4" />
                    <span>LONG STRATEGY: DEMAND ZONE BOUNCE</span>
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300">
                    R:R {calcResults.long.riskReward} : 1
                  </span>
                </div>

                <div className="p-2.5 rounded-xl bg-emerald-950/20 border border-emerald-500/20 text-xs font-mono text-slate-300 space-y-1">
                  <div className="text-[10px] text-emerald-400 font-bold uppercase">Institutional Demand Buffer Zone:</div>
                  <div className="text-white font-bold">
                    ${calcResults.supLow.toFixed(1)} — ${calcResults.supHigh.toFixed(1)}
                  </div>
                </div>

                <div className="space-y-1.5 text-xs font-mono">
                  <div className="flex justify-between py-1 border-b border-slate-800">
                    <span className="text-slate-400">Optimal Limit Entry:</span>
                    <strong className="text-white">${calcResults.long.entry.toFixed(1)}</strong>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-800">
                    <span className="text-slate-400">Structural Stop Loss:</span>
                    <strong className="text-rose-400">${calcResults.long.stopLoss.toFixed(1)}</strong>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-800">
                    <span className="text-slate-400">Take Profit 1 (Mid-Range/POC):</span>
                    <strong className="text-emerald-300">${calcResults.long.tp1.toFixed(1)}</strong>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-800">
                    <span className="text-slate-400">Take Profit 2 (Resistance Low):</span>
                    <strong className="text-emerald-400">${calcResults.long.tp2.toFixed(1)}</strong>
                  </div>
                  <div className="flex justify-between py-1 pt-2">
                    <span className="text-slate-400">Max Sized Position:</span>
                    <strong className="text-cyan-300">
                      ${calcResults.long.notional.toFixed(0)} ({calcResults.long.units.toFixed(4)} units)
                    </strong>
                  </div>
                </div>
              </div>

              {/* SHORT BLUEPRINT (Resistance Zone Fade) */}
              <div className="p-4 rounded-2xl bg-[#080B11] border border-rose-500/30 space-y-3 shadow-lg">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-black text-rose-400 flex items-center gap-1.5">
                    <TrendingDown className="w-4 h-4" />
                    <span>SHORT STRATEGY: SUPPLY ZONE FADE</span>
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-rose-500/20 text-rose-300">
                    R:R {calcResults.short.riskReward} : 1
                  </span>
                </div>

                <div className="p-2.5 rounded-xl bg-rose-950/20 border border-rose-500/20 text-xs font-mono text-slate-300 space-y-1">
                  <div className="text-[10px] text-rose-400 font-bold uppercase">Institutional Supply Buffer Zone:</div>
                  <div className="text-white font-bold">
                    ${calcResults.resLow.toFixed(1)} — ${calcResults.resHigh.toFixed(1)}
                  </div>
                </div>

                <div className="space-y-1.5 text-xs font-mono">
                  <div className="flex justify-between py-1 border-b border-slate-800">
                    <span className="text-slate-400">Optimal Limit Entry:</span>
                    <strong className="text-white">${calcResults.short.entry.toFixed(1)}</strong>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-800">
                    <span className="text-slate-400">Structural Stop Loss:</span>
                    <strong className="text-rose-400">${calcResults.short.stopLoss.toFixed(1)}</strong>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-800">
                    <span className="text-slate-400">Take Profit 1 (Mid-Range/POC):</span>
                    <strong className="text-emerald-300">${calcResults.short.tp1.toFixed(1)}</strong>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-800">
                    <span className="text-slate-400">Take Profit 2 (Support High):</span>
                    <strong className="text-emerald-400">${calcResults.short.tp2.toFixed(1)}</strong>
                  </div>
                  <div className="flex justify-between py-1 pt-2">
                    <span className="text-slate-400">Max Sized Position:</span>
                    <strong className="text-cyan-300">
                      ${calcResults.short.notional.toFixed(0)} ({calcResults.short.units.toFixed(4)} units)
                    </strong>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* 4 NON-NEGOTIABLE S&R LAWS CHECKLIST FOOTER */}
      {/* ==================================================================== */}
      <div className="bg-[#0B0F19]/90 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3">
        <h4 className="text-xs font-mono font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2">
          <ShieldCheck className="w-4 h-4" />
          <span>The 4 Non-Negotiable Institutional S&R Laws</span>
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs font-mono">
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
            <span className="text-emerald-400 font-bold block">1. Trade Zones, Not Lines</span>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Always allow a 0.5% – 1.5% buffer zone. Single tick lines will trigger your stops on harmless noise wicks.
            </p>
          </div>
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
            <span className="text-cyan-400 font-bold block">2. Confluence Multiplier</span>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Require at least two independent indicators (e.g. S&R Zone + 200 EMA or POC) before putting real capital at risk.
            </p>
          </div>
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
            <span className="text-purple-400 font-bold block">3. Candle Close Confirmation</span>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Never enter during an active wick. Wait for the candle to close to verify whether it was an absorption spring or real breakdown.
            </p>
          </div>
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
            <span className="text-rose-400 font-bold block">4. Structural Invalidation</span>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Place stops beyond the wick extremes of the entire liquidity cluster. Size your position so max loss is strictly 1–2%.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
