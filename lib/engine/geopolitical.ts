import { fetchYahooFinanceCandles } from '../ingestion/yahoo';

export interface PolymarketConflictEvent {
  question: string;
  probabilityPct: number;
  volumeUsd: number;
  category: 'nuclear' | 'direct_conflict' | 'regional_war' | 'diplomacy';
  urgency: 'critical' | 'high' | 'moderate' | 'low';
}

export interface FinancialWarBarometer {
  symbol: string;
  name: string;
  currentPrice: number;
  change5dPct: number;
  change1dPct: number;
  status: 'critical' | 'elevated' | 'normal';
  description: string;
}

export interface GeopoliticalRiskState {
  timestamp: string;
  defconLevel: 1 | 2 | 3 | 4 | 5;
  defconTitle: string;
  defconScore: number; // 0 to 100 (100 = Maximum WW3 / Black Swan Risk)
  killSwitchActive: boolean; // True when DEFCON <= 2 (Score >= 66)
  tacticalVerdict: string;
  recommendation: string;
  polymarketOdds: PolymarketConflictEvent[];
  financialBarometers: {
    crudeOil: FinancialWarBarometer;
    gold: FinancialWarBarometer;
    defenseEtf: FinancialWarBarometer;
    vix: FinancialWarBarometer;
  };
  flashpoints: Array<{
    id: string;
    region: string;
    coordinates: { x: number; y: number }; // Relative radar coordinates (0-100)
    threatLevel: 'critical' | 'high' | 'medium' | 'low';
    summary: string;
  }>;
}

// Fallback data if live APIs are rate-limited or unavailable
const FALLBACK_POLYMARKET_EVENTS: PolymarketConflictEvent[] = [
  {
    question: 'Will China invade Taiwan by end of 2026?',
    probabilityPct: 4,
    volumeUsd: 41122000,
    category: 'direct_conflict',
    urgency: 'high',
  },
  {
    question: 'NATO Article 5 collective defense triggered before 2027?',
    probabilityPct: 5,
    volumeUsd: 224000,
    category: 'direct_conflict',
    urgency: 'critical',
  },
  {
    question: 'Will the Iranian regime fall or enter direct war before 2027?',
    probabilityPct: 7,
    volumeUsd: 25700000,
    category: 'regional_war',
    urgency: 'high',
  },
  {
    question: 'Ukraine signs ceasefire or peace deal with Russia before 2027?',
    probabilityPct: 11,
    volumeUsd: 2713000,
    category: 'diplomacy',
    urgency: 'low',
  },
  {
    question: 'Nuclear weapon detonated in military conflict before 2027?',
    probabilityPct: 3,
    volumeUsd: 14850000,
    category: 'nuclear',
    urgency: 'critical',
  },
];

async function fetchPolymarketConflictOdds(): Promise<PolymarketConflictEvent[]> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);

    const res = await fetch(
      'https://gamma-api.polymarket.com/markets?limit=100&active=true&closed=false&tag_id=100265',
      {
        headers: { Accept: 'application/json' },
        signal: controller.signal,
        next: { revalidate: 300 },
      }
    );

    clearTimeout(timeout);

    if (!res.ok) {
      return FALLBACK_POLYMARKET_EVENTS;
    }

    const data = await res.json();
    if (!Array.isArray(data) || data.length === 0) {
      return FALLBACK_POLYMARKET_EVENTS;
    }

    const keywords = [
      'invade',
      'taiwan',
      'nato',
      'nuclear',
      'strike',
      'war',
      'iran',
      'russia',
      'ukraine',
      'israel',
      'article 5',
      'ceasefire',
      'peace deal',
    ];

    const matched = data
      .filter((m: any) => {
        const q = (m.question || '').toLowerCase();
        return keywords.some((k) => q.includes(k));
      })
      .map((m: any): PolymarketConflictEvent | null => {
        try {
          const prices = JSON.parse(m.outcomePrices || '["0.05", "0.95"]');
          const yesProb = Math.round(parseFloat(prices[0] || '0') * 100);
          const vol = Math.round(parseFloat(m.volume || '0'));
          const q = m.question;
          const qLower = q.toLowerCase();

          let category: PolymarketConflictEvent['category'] = 'regional_war';
          let urgency: PolymarketConflictEvent['urgency'] = 'moderate';

          if (qLower.includes('nuclear')) {
            category = 'nuclear';
            urgency = 'critical';
          } else if (qLower.includes('nato') || qLower.includes('article 5')) {
            category = 'direct_conflict';
            urgency = 'critical';
          } else if (qLower.includes('taiwan') || qLower.includes('invade')) {
            category = 'direct_conflict';
            urgency = 'high';
          } else if (qLower.includes('ceasefire') || qLower.includes('peace')) {
            category = 'diplomacy';
            urgency = 'low';
          }

          return {
            question: q,
            probabilityPct: Math.max(0, Math.min(100, yesProb)),
            volumeUsd: vol,
            category,
            urgency,
          };
        } catch {
          return null;
        }
      })
      .filter((item): item is PolymarketConflictEvent => item !== null)
      .sort((a, b) => b.volumeUsd - a.volumeUsd)
      .slice(0, 6);

    return matched.length > 0 ? matched : FALLBACK_POLYMARKET_EVENTS;
  } catch (err) {
    console.warn('Polymarket fetch error, using fallback:', err);
    return FALLBACK_POLYMARKET_EVENTS;
  }
}

async function fetchAssetChange(symbol: string, defaultPrice: number): Promise<{
  price: number;
  change1d: number;
  change5d: number;
}> {
  try {
    const candles = await fetchYahooFinanceCandles(symbol, '10d', '1d');
    if (candles && candles.length >= 2) {
      const latest = candles[candles.length - 1].close;
      const prev1d = candles[candles.length - 2].close;
      const prev5d = candles[Math.max(0, candles.length - 6)].close;

      const change1d = ((latest - prev1d) / prev1d) * 100;
      const change5d = ((latest - prev5d) / prev5d) * 100;

      return {
        price: Number(latest.toFixed(2)),
        change1d: Number(change1d.toFixed(2)),
        change5d: Number(change5d.toFixed(2)),
      };
    }
  } catch (err) {
    console.warn(`Error fetching ${symbol} for war barometer:`, err);
  }

  return { price: defaultPrice, change1d: 0, change5d: 0 };
}

export async function calculateGeopoliticalRisk(): Promise<GeopoliticalRiskState> {
  // 1. Fetch Polymarket Prediction Odds
  const polymarketOddsPromise = fetchPolymarketConflictOdds();

  // 2. Fetch Financial War Proxies concurrently
  const [polymarketOdds, oilData, goldData, defenseData, vixData] = await Promise.all([
    polymarketOddsPromise,
    fetchAssetChange('CL=F', 78.5),
    fetchAssetChange('GC=F', 2650.0),
    fetchAssetChange('ITA', 145.2),
    fetchAssetChange('^VIX', 16.4),
  ]);

  // Evaluate Barometer Statuses
  const crudeOil: FinancialWarBarometer = {
    symbol: 'CL=F',
    name: 'Crude Oil (WTI)',
    currentPrice: oilData.price,
    change1dPct: oilData.change1d,
    change5dPct: oilData.change5d,
    status: oilData.change5d > 8 || oilData.change1d > 4 ? 'critical' : oilData.change5d > 4 ? 'elevated' : 'normal',
    description:
      oilData.change5d > 6
        ? 'Energy supply disruption / Middle East shipping lane risk active'
        : 'Global petroleum flows operating without immediate war blockade',
  };

  const gold: FinancialWarBarometer = {
    symbol: 'GC=F',
    name: 'Gold (XAU)',
    currentPrice: goldData.price,
    change1dPct: goldData.change1d,
    change5dPct: goldData.change5d,
    status: goldData.change5d > 4 || goldData.change1d > 2 ? 'critical' : goldData.change5d > 2 ? 'elevated' : 'normal',
    description:
      goldData.change5d > 3
        ? 'Sovereign & institutional flight to physical safe havens detected'
        : 'Orderly bullion flows; no panic capital flight',
  };

  const defenseEtf: FinancialWarBarometer = {
    symbol: 'ITA',
    name: 'Aerospace & Defense ETF',
    currentPrice: defenseData.price,
    change1dPct: defenseData.change1d,
    change5dPct: defenseData.change5d,
    status: defenseData.change5d > 5 ? 'critical' : defenseData.change5d > 2.5 ? 'elevated' : 'normal',
    description:
      defenseData.change5d > 4
        ? 'Defense contractors outperforming market; wartime procurement pricing in'
        : 'Defense equities trading at baseline industrial multiples',
  };

  const vix: FinancialWarBarometer = {
    symbol: '^VIX',
    name: 'CBOE Volatility Index',
    currentPrice: vixData.price,
    change1dPct: vixData.change1d,
    change5dPct: vixData.change5d,
    status: vixData.price > 30 ? 'critical' : vixData.price > 22 ? 'elevated' : 'normal',
    description:
      vixData.price > 28
        ? 'Systemic macro panic / extreme hedging against global shock'
        : 'Implied volatility at calm peacetime levels',
  };

  // 3. Compute Composite DEFCON Score (0 to 100)
  // Higher score = HIGHER WAR RISK
  let rawScore = 15; // Baseline peacetime geopolitical friction

  // Prediction market contribution (max 40 pts)
  const maxConflictProb = Math.max(
    ...polymarketOdds.map((o) => (o.category === 'diplomacy' ? 0 : o.probabilityPct)),
    5
  );
  if (maxConflictProb >= 35) rawScore += 40;
  else if (maxConflictProb >= 20) rawScore += 25;
  else if (maxConflictProb >= 10) rawScore += 15;
  else rawScore += Math.round(maxConflictProb * 1.2);

  // Financial war proxy contribution (max 45 pts)
  if (crudeOil.status === 'critical') rawScore += 15;
  else if (crudeOil.status === 'elevated') rawScore += 8;

  if (gold.status === 'critical') rawScore += 15;
  else if (gold.status === 'elevated') rawScore += 8;

  if (defenseEtf.status === 'critical') rawScore += 10;
  else if (defenseEtf.status === 'elevated') rawScore += 5;

  if (vix.status === 'critical') rawScore += 15;
  else if (vix.status === 'elevated') rawScore += 7;

  const defconScore = Math.max(5, Math.min(100, rawScore));

  // Determine DEFCON Level:
  let defconLevel: 1 | 2 | 3 | 4 | 5 = 5;
  let defconTitle = 'DEFCON 5 — PEACETIME ACCUMULATION';
  let tacticalVerdict = 'Geopolitical background risk is subdued. Systematic dip accumulation rules are fully greenlit.';
  let recommendation = 'Execute standard DCA tranches when technical capitulation scores (≥70) trigger.';

  if (defconScore >= 81) {
    defconLevel = 1;
    defconTitle = 'DEFCON 1 — MAXIMUM WW3 / NUCLEAR ALERT';
    tacticalVerdict = 'CRITICAL BLACK SWAN ACTIVE: Superpower confrontation or nuclear threshold event detected.';
    recommendation = 'EMERGENCY KILL-SWITCH: Halt all equity & crypto dip accumulation. Reallocate to Physical Gold, Cash & Treasuries.';
  } else if (defconScore >= 66) {
    defconLevel = 2;
    defconTitle = 'DEFCON 2 — ARMED SUPERPOWER ESCALATION';
    tacticalVerdict = 'SEVERE GEOPOLITICAL RISK: Direct military engagement between major sovereign powers imminent or ongoing.';
    recommendation = 'DEFENSIVE LOCKDOWN: Pause speculative dip-buying. Tighten trailing stops by 50%. Hedge with Energy and Gold.';
  } else if (defconScore >= 46) {
    defconLevel = 3;
    defconTitle = 'DEFCON 3 — ELEVATED REGIONAL WARFARE';
    tacticalVerdict = 'REGIONAL SHOCK ACTIVE: Middle East or Eastern Europe kinetic escalation impacting trade routes.';
    recommendation = 'REDUCE POSITION SIZING: Limit dip tranches to 50% standard capital. Avoid high-beta leverage.';
  } else if (defconScore >= 26) {
    defconLevel = 4;
    defconTitle = 'DEFCON 4 — GUARDED REGIONAL TENSIONS';
    tacticalVerdict = 'DIPLOMATIC STRAIN: Geopolitical sabre-rattling present but contained below financial contagion thresholds.';
    recommendation = 'STANDARD PROTOCOL: Dip signals operational. Monitor Crude Oil and Defense ETFs for sudden divergences.';
  }

  const killSwitchActive = defconLevel <= 2;

  // Radar conflict flashpoints
  const flashpoints = [
    {
      id: 'taiwan',
      region: 'Taiwan Strait',
      coordinates: { x: 78, y: 52 },
      threatLevel: maxConflictProb > 15 ? ('high' as const) : ('medium' as const),
      summary: 'Semiconductor supply chokepoint; PLAN naval exercises monitoring.',
    },
    {
      id: 'eastern_europe',
      region: 'Eastern Europe / Ukraine',
      coordinates: { x: 58, y: 32 },
      threatLevel: 'high' as const,
      summary: 'Active frontline attrition; NATO airspace intercept protocols in effect.',
    },
    {
      id: 'middle_east',
      region: 'Strait of Hormuz / Levant',
      coordinates: { x: 62, y: 48 },
      threatLevel: crudeOil.status === 'critical' ? ('critical' as const) : ('high' as const),
      summary: 'Energy transit corridor vulnerability; regional missile defense alert.',
    },
    {
      id: 'korean_peninsula',
      region: 'Korean Peninsula',
      coordinates: { x: 82, y: 40 },
      threatLevel: 'low' as const,
      summary: 'Sub-surface missile tests; DMZ baseline deterrence posture.',
    },
  ];

  return {
    timestamp: new Date().toISOString(),
    defconLevel,
    defconTitle,
    defconScore,
    killSwitchActive,
    tacticalVerdict,
    recommendation,
    polymarketOdds,
    financialBarometers: {
      crudeOil,
      gold,
      defenseEtf,
      vix,
    },
    flashpoints,
  };
}
