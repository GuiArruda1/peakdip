/**
 * Baudrillard Simulacra & Hyperreality Arbitrage Engine
 *
 * Grounded in Jean Baudrillard's 4th-Order Simulacrum:
 * Modern financial markets trade representations of representations (news, sentiment loops,
 * algorithmic front-running, options delta hedging).
 *
 * This engine quantifies the mathematical divergence between:
 * 1. Narrative Simulation Score (N_t): Manufactured media dread / euphoria
 * 2. Mechanical Liquidity Reality (M_t): Institutional order absorption & structural support
 *
 * Simulacrum Gap (Δ_sim) = M_t - N_t
 * - Δ_sim >= +35: RED_PILL_GLITCH (Simulation manufactures panic, but mechanical order flow is accumulating dips)
 * - Δ_sim <= -35: MATRIX_MIRAGE (Simulation broadcasts euphoria, but smart money is distributing)
 */

import { DipConvictionSnapshot } from '../types';
import { GeopoliticalRiskState } from './geopolitical';

export type HyperrealityState = 'RED_PILL_GLITCH' | 'MATRIX_MIRAGE' | 'SIMULATION_COHERENT';

export interface BaudrillardQuote {
  quote: string;
  context: string;
  category?: 'glitch' | 'mirage' | 'simulation' | 'general';
}

export const BAUDRILLARD_QUOTES: BaudrillardQuote[] = [
  {
    quote: "It is no longer a question of imitation, nor duplication, nor even parody. It is a question of substituting the signs of the real for the real.",
    context: "The Precession of Simulacra",
    category: 'mirage'
  },
  {
    quote: "The simulacrum is never what hides the truth—it is truth that hides that there is none. The simulacrum is true.",
    context: "Ecclesiastes / Simulacra and Simulation",
    category: 'glitch'
  },
  {
    quote: "We live in a world where there is more and more information, and less and less meaning.",
    context: "The Implosion of Meaning in the Media",
    category: 'simulation'
  },
  {
    quote: "The territory no longer precedes the map, nor does it survive it. It is nevertheless the map that precedes the territory.",
    context: "The Precession of Simulacra",
    category: 'glitch'
  },
  {
    quote: "Illusion is no longer possible, because the real is no longer possible.",
    context: "Simulacra and Simulation",
    category: 'simulation'
  },
  {
    quote: "Information devours its own contents; it exhausts and devours the communication itself.",
    context: "The Implosion of Meaning",
    category: 'mirage'
  },
  {
    quote: "The real does not efface itself in favor of the imaginary; it effaces itself in favor of the more real than real: the hyperreal.",
    context: "Hyperrealism and the Imaginary",
    category: 'general'
  },
  {
    quote: "It is the generation by models of a real without origin or reality: a hyperreal.",
    context: "The Divine Irreference of Images",
    category: 'glitch'
  },
  {
    quote: "Power itself has for a long time produced nothing but the signs of its resemblance.",
    context: "Simulacra and Simulation",
    category: 'mirage'
  },
  {
    quote: "When the real is no longer what it was, nostalgia assumes its full meaning.",
    context: "The Order of Simulacra",
    category: 'simulation'
  },
  {
    quote: "Everything is destined to reappear as simulation. People who cannot cope with reality invent a simulation.",
    context: "Simulacra and Simulation",
    category: 'general'
  },
  {
    quote: "Disneyland exists in order to hide that it is the 'real' country, all of 'real' America that is Disneyland.",
    context: "Hypermarket and Hypercommodity",
    category: 'simulation'
  },
  {
    quote: "Fascinated by the mirror of its own image, the market system produces an operational void.",
    context: "Simulacra and Simulation",
    category: 'mirage'
  },
  {
    quote: "The secret of simulation is that it possesses no secret: it is transparent to itself.",
    context: "Simulacra and Simulation",
    category: 'glitch'
  },
  {
    quote: "All of Western faith was pledged in this wager: that a sign could refer to the depth of meaning.",
    context: "The Divine Irreference",
    category: 'general'
  }
];

export function getDailyBaudrillardQuote(offset = 0): BaudrillardQuote & { dayIndex: number } {
  const now = new Date();
  const startOfYear = new Date(now.getFullYear(), 0, 0);
  const diff = now.getTime() - startOfYear.getTime();
  const oneDay = 1000 * 60 * 60 * 24;
  const dayOfYear = Math.floor(diff / oneDay);
  const total = BAUDRILLARD_QUOTES.length;
  const index = Math.abs((dayOfYear + offset) % total);
  return {
    ...BAUDRILLARD_QUOTES[index],
    dayIndex: (index % total) + 1,
  };
}

export interface SimulacrumAnalysis {
  asset: 'BTC' | 'SPY';
  simulacrumGap: number; // -100 to +100
  state: HyperrealityState;
  narrativeScore: number; // -100 (Peak Panic) to +100 (Peak Euphoria)
  mechanicalScore: number; // -100 (Liquidity Breakdown) to +100 (Deep Absorption)
  glitchIntensityPct: number; // 0 to 100%
  headlineEchoChamber: {
    status: string;
    fearGreedValue: number;
    fearGreedLabel: string;
    mediaBias: 'PANIC_LOOP' | 'EUPHORIA_LOOP' | 'NEUTRAL';
  };
  mechanicalGroundTruth: {
    institutionalAbsorption: boolean;
    elderRayState: 'ACCUMULATION' | 'DISTRIBUTION' | 'NEUTRAL';
    sma200DistancePct: number;
    capitulationZScore: number;
  };
  tacticalDirective: {
    title: string;
    action: 'AGGRESSIVE_LONG' | 'SCALE_TRANCHES' | 'CAPITAL_SHIELD' | 'PATIENCE';
    summary: string;
    baudrillardQuote: {
      quote: string;
      context: string;
      dayIndex: number;
    };
  };
}

export function calculateSimulacrumDivergence(
  asset: 'BTC' | 'SPY',
  conviction: DipConvictionSnapshot | null,
  defconData?: GeopoliticalRiskState | null,
  quoteOffset = 0
): SimulacrumAnalysis {
  // Default values if data stream is loading
  const compScore = conviction?.compositeScore ?? 50;
  const fearGreed = conviction?.indicators.fearGreedOrVix?.value ?? 50;
  const rsi14 = conviction?.indicators.rsi14 ?? 50;
  const distSma200 = conviction?.indicators.distToSma200Pct ?? 0;
  const drawdownZ = conviction?.indicators.drawdownZScore ?? 0;
  const defconLevel = defconData?.defconLevel ?? 5; // 1 = Critical War, 5 = Normal

  // ─── 1. NARRATIVE SIMULATION SCORE (N_t: -100 to +100) ───
  // Negative = Simulated Panic/Apocalypse, Positive = Simulated Euphoria/FOMO
  // Normalize Fear & Greed from [0, 100] to [-100, +100]
  let narrativeBase = (fearGreed - 50) * 2;

  // If Geopolitical DEFCON is elevated (DEFCON 1-3), the simulation amplifies panic
  if (defconLevel <= 2) {
    narrativeBase -= 35; // Severe panic narrative
  } else if (defconLevel === 3) {
    narrativeBase -= 15;
  }

  const narrativeScore = Math.max(-100, Math.min(100, Math.round(narrativeBase)));

  // ─── 2. MECHANICAL LIQUIDITY REALITY (M_t: -100 to +100) ───
  // Institutional order flow, capitulation volume, distance to structural 200-SMA floor
  let mechanicalBase = 0;

  // High conviction dip score indicates smart money absorption
  mechanicalBase += (compScore - 50) * 1.5;

  // Statistical drawdown Z-score: if < -2.0 sigma, mechanical capitulation floor is reached
  if (drawdownZ < -2.0) {
    mechanicalBase += 25;
  } else if (drawdownZ < -1.0) {
    mechanicalBase += 12;
  }

  // RSI oversold bounce potential
  if (rsi14 < 30) {
    mechanicalBase += 25;
  } else if (rsi14 < 40) {
    mechanicalBase += 10;
  } else if (rsi14 > 70) {
    mechanicalBase -= 25;
  }

  // 200 SMA proximity (structural institutional support)
  if (distSma200 < 2 && distSma200 > -8) {
    mechanicalBase += 20; // Prime support zone
  } else if (distSma200 < -15) {
    mechanicalBase -= 20; // Structural breakdown
  }

  const mechanicalScore = Math.max(-100, Math.min(100, Math.round(mechanicalBase)));

  // ─── 3. SIMULACRUM GAP (Δ_sim = Mechanical - Narrative) ───
  const rawGap = mechanicalScore - narrativeScore;
  const simulacrumGap = Math.max(-100, Math.min(100, Math.round(rawGap)));

  // ─── 4. HYPERREALITY CLASSIFICATION ───
  let state: HyperrealityState = 'SIMULATION_COHERENT';
  let glitchIntensityPct = 0;

  if (simulacrumGap >= 35) {
    state = 'RED_PILL_GLITCH';
    glitchIntensityPct = Math.min(100, Math.round(((simulacrumGap - 35) / 65) * 100) + 35);
  } else if (simulacrumGap <= -35) {
    state = 'MATRIX_MIRAGE';
    glitchIntensityPct = Math.min(100, Math.round(((Math.abs(simulacrumGap) - 35) / 65) * 100) + 35);
  } else {
    state = 'SIMULATION_COHERENT';
    glitchIntensityPct = Math.round((Math.abs(simulacrumGap) / 35) * 100);
  }

  // Media Echo Chamber Breakdown
  const fearGreedLabel =
    fearGreed <= 25 ? 'Extreme Fear' : fearGreed <= 45 ? 'Fear' : fearGreed <= 55 ? 'Neutral' : fearGreed <= 75 ? 'Greed' : 'Extreme Greed';

  const mediaBias =
    narrativeScore <= -30 ? 'PANIC_LOOP' : narrativeScore >= 30 ? 'EUPHORIA_LOOP' : 'NEUTRAL';

  // Mechanical Ground Truth Breakdown
  const institutionalAbsorption = compScore >= 65 || (rsi14 <= 35 && drawdownZ <= -1.5);
  const elderRayState = compScore >= 65 ? 'ACCUMULATION' : compScore <= 35 ? 'DISTRIBUTION' : 'NEUTRAL';

  // Tactical Directives with Daily Rotating Baudrillard Philosophy
  const dailyQuote = getDailyBaudrillardQuote(quoteOffset);
  let tacticalDirective: SimulacrumAnalysis['tacticalDirective'];

  if (state === 'RED_PILL_GLITCH') {
    tacticalDirective = {
      title: '🔴 RED PILL GLITCH: PURE SIMULATED CAPITULATION',
      action: 'AGGRESSIVE_LONG',
      summary: `The media echo chamber is broadcasting maximum dread (Narrative: ${narrativeScore}), but institutional mechanical order flow (Reality: +${mechanicalScore}) is quietly absorbing volume at the 200-SMA. The panic is a 4th-order simulacrum designed to harvest retail liquidity.`,
      baudrillardQuote: {
        quote: dailyQuote.quote,
        context: dailyQuote.context,
        dayIndex: dailyQuote.dayIndex,
      },
    };
  } else if (state === 'MATRIX_MIRAGE') {
    tacticalDirective = {
      title: '⚠️ MATRIX MIRAGE: HYPERREAL EUPHORIA TRAP',
      action: 'CAPITAL_SHIELD',
      summary: `Retail sentiment is in extreme unhedged greed (Narrative: +${narrativeScore}), while smart money is quietly distributing into liquidity (Reality: ${mechanicalScore}). The upward momentum is self-referential hyperreality vulnerable to sudden cascade.`,
      baudrillardQuote: {
        quote: dailyQuote.quote,
        context: dailyQuote.context,
        dayIndex: dailyQuote.dayIndex,
      },
    };
  } else {
    tacticalDirective = {
      title: '⚖️ SIMULATION COHERENT: EQUILIBRIUM',
      action: compScore >= 60 ? 'SCALE_TRANCHES' : 'PATIENCE',
      summary: `Narrative perception (${narrativeScore}) roughly aligns with mechanical liquidity conditions (${mechanicalScore}). Maintain disciplined golden ratio parameters and execute according to standard conviction levels.`,
      baudrillardQuote: {
        quote: dailyQuote.quote,
        context: dailyQuote.context,
        dayIndex: dailyQuote.dayIndex,
      },
    };
  }

  return {
    asset,
    simulacrumGap,
    state,
    narrativeScore,
    mechanicalScore,
    glitchIntensityPct,
    headlineEchoChamber: {
      status: mediaBias === 'PANIC_LOOP' ? 'Sensationalist Panic Echo' : mediaBias === 'EUPHORIA_LOOP' ? 'Euphoric FOMO Echo' : 'Subdued Consensus',
      fearGreedValue: fearGreed,
      fearGreedLabel,
      mediaBias,
    },
    mechanicalGroundTruth: {
      institutionalAbsorption,
      elderRayState,
      sma200DistancePct: distSma200,
      capitulationZScore: drawdownZ,
    },
    tacticalDirective,
  };
}
