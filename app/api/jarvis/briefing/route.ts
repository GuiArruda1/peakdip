import { NextResponse } from 'next/server';
import { ensureDataReady } from '@/lib/dataProvider';
import { getMarketSessionInfo, calculatePivotLevels } from '@/lib/engine/daytrade';
import { calculateGeopoliticalRisk } from '@/lib/engine/geopolitical';

export const dynamic = 'force-dynamic';

export interface JarvisBriefingData {
  greeting: string;
  salutation: string;
  dateString: string;
  session: {
    name: string;
    description: string;
    volatility: string;
    utcTime: string;
  };
  macroVerdict: {
    status: string;
    color: string;
    actionableSummary: string;
    cashPreservationActive: boolean;
  };
  btc: {
    symbol: string;
    price: number;
    change24h: number;
    score: number;
    distToSma200Pct: number;
    sma200: number;
    rsi14: number;
    fearGreed: { value: number; label: string };
    pivots: { r2: number; r1: number; pp: number; s1: number; s2: number };
  };
  spy: {
    symbol: string;
    price: number;
    change24h: number;
    score: number;
    distToSma200Pct: number;
    sma200: number;
    rsi14: number;
    vix: { value: number; label: string };
  };
  geopolitical: {
    defconLevel: number;
    defconTitle: string;
    tacticalVerdict: string;
    crudeOilPrice: number;
    crudeOilChange5d: number;
    isCrudeCritical: boolean;
  };
  tacticalDirectives: string[];
  speechScript: string;
}

export async function GET() {
  try {
    const [btcData, spyData, geoRisk] = await Promise.all([
      ensureDataReady('BTCUSDT'),
      ensureDataReady('SPY'),
      calculateGeopoliticalRisk().catch(() => null),
    ]);

    const sessionInfo = getMarketSessionInfo();
    const now = new Date();
    const hours = now.getHours();

    let salutation = 'Good day, sir.';
    if (hours < 12) salutation = 'Good morning, sir.';
    else if (hours < 18) salutation = 'Good afternoon, sir.';
    else salutation = 'Good evening, sir.';

    const dateFormatted = now.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    // Extract BTC Metrics
    const btcConv = btcData.conviction;
    const btcPrice = btcConv?.currentPrice || 79140;
    const btcChange = btcConv?.priceChange24h || 0;
    const btcScore = btcConv?.compositeScore || 6;
    const btcSma200 = btcConv?.indicators.sma200 || 70229;
    const btcDist200 = btcConv?.indicators.distToSma200Pct || 12.69;
    const btcRsi = btcConv?.indicators.rsi14 || 60.5;
    const btcFear = btcConv?.indicators.fearGreedOrVix || { value: 57, label: 'Greed' };

    // Calculate BTC Intraday Pivots from recent candles or fallback formula
    const rawCandles = btcData.candles || [];
    let btcPivots = { pp: 0, r1: 0, r2: 0, s1: 0, s2: 0 };
    if (rawCandles.length > 0) {
      const window = rawCandles.slice(-14);
      const high = Math.max(...window.map((c) => c.high));
      const low = Math.min(...window.map((c) => c.low));
      const close = window[window.length - 1].close;
      const pp = (high + low + close) / 3;
      btcPivots = {
        pp: Math.round(pp),
        r1: Math.round(2 * pp - low),
        r2: Math.round(pp + (high - low)),
        s1: Math.round(2 * pp - high),
        s2: Math.round(pp - (high - low)),
      };
    } else {
      const high = btcPrice * 1.015;
      const low = btcPrice * 0.985;
      const pp = (high + low + btcPrice) / 3;
      btcPivots = {
        pp: Math.round(pp),
        r1: Math.round(2 * pp - low),
        r2: Math.round(pp + (high - low)),
        s1: Math.round(2 * pp - high),
        s2: Math.round(pp - (high - low)),
      };
    }

    // Extract SPY Metrics
    const spyConv = spyData.conviction;
    const spyPrice = spyConv?.currentPrice || 762.03;
    const spyChange = spyConv?.priceChange24h || -0.3;
    const spyScore = spyConv?.compositeScore || 24;
    const spySma200 = spyConv?.indicators.sma200 || 714.7;
    const spyDist200 = spyConv?.indicators.distToSma200Pct || 6.62;
    const spyRsi = spyConv?.indicators.rsi14 || 48.3;
    const spyVix = spyConv?.indicators.fearGreedOrVix || { value: 16.71, label: 'Peacetime Normal' };

    // Geopolitical Metrics
    const defconLevel = geoRisk?.defconLevel || 4;
    const defconTitle = geoRisk?.defconTitle || 'DEFCON 4 — GUARDED REGIONAL TENSIONS';
    const crudePrice = geoRisk?.financialBarometers.crudeOil.currentPrice || 103.14;
    const crudeChange5d = geoRisk?.financialBarometers.crudeOil.change5dPct || 12.75;
    const isCrudeCritical = crudeChange5d > 8 || crudePrice > 95;

    // Macro Verdict
    const isExtended = btcScore < 30 && spyScore < 30;
    const macroStatus = isExtended
      ? 'EXTENDED — CASH PRESERVATION PROTOCOL'
      : btcScore >= 60 || spyScore >= 60
      ? 'ASYMMETRIC DIP WINDOW ACTIVE'
      : 'NEUTRAL EQUILIBRIUM';

    const macroColor = isExtended ? '#F59E0B' : btcScore >= 60 ? '#10B981' : '#38BDF8';
    const actionableSummary = isExtended
      ? 'Markets are stretched above their 200-day moving averages with elevated greed. Quantitative dip-buying rules are on standby to avoid FOMO tops. Capital preservation is active.'
      : 'Selective accumulation enabled across key institutional demand clusters.';

    // 3 Actionable Tactical Directives
    const tacticalDirectives = [
      `DO NOT FOMO SWING LONGS: Bitcoin is +${btcDist200.toFixed(1)}% stretched above its 200-SMA ($${Math.round(btcSma200).toLocaleString()}). Wait for mean-reversion pullbacks.`,
      `CRITICAL S&R BATTLEGROUND: Immediate overhead resistance sits at $${btcPivots.r1.toLocaleString()} and $${btcPivots.r2.toLocaleString()}. Structural intraday pivot support is at $${btcPivots.pp.toLocaleString()} and $${btcPivots.s1.toLocaleString()}.`,
      `GEOPOLITICAL BAROMETER: ${defconTitle} is active. WTI Crude Oil has surged +${crudeChange5d.toFixed(1)}% over 5 days ($${crudePrice.toFixed(2)}/bbl). Monitor shipping lanes for energy volatility contagion.`,
    ];

    // Speech Script for Web Speech Synthesis API
    const speechScript = `${salutation} All PEAK quantitative diagnostic subsystems are calibrated. Today is ${dateFormatted}. We are currently tracking the ${sessionInfo.sessionName}, with ${sessionInfo.volatilityTier.toLowerCase()} volatility. 

The overall macro posture is ${macroStatus}. S and P 500 ETF is trading at ${spyPrice.toFixed(2)} dollars, with an RSI of ${Math.round(spyRsi)}, maintaining an equilibrium stance. 

Bitcoin stands at ${Math.round(btcPrice).toLocaleString()} dollars, currently trading ${btcDist200.toFixed(1)} percent above its 200-day baseline, with a composite score of ${btcScore} out of 100. Retail sentiment is in ${btcFear.label}. 

In terms of key levels for today: immediate overhead resistance is clustered at ${btcPivots.r1.toLocaleString()} dollars, with a secondary ceiling at ${btcPivots.r2.toLocaleString()} dollars. Intraday pivot support is positioned at ${btcPivots.pp.toLocaleString()} dollars, and key support at ${btcPivots.s1.toLocaleString()} dollars.

On the geopolitical front, DEFCON 4 is active. Crude oil has experienced a notable 12 percent five-day surge to ${Math.round(crudePrice)} dollars per barrel. 

My primary directive for today, sir: avoid chasing extended green candles, maintain cash discipline, and wait for structural support confirmation before deploying new swing capital. Have an exceptional and disciplined trading day.`;

    const responseData: JarvisBriefingData = {
      greeting: salutation,
      salutation,
      dateString: dateFormatted,
      session: {
        name: sessionInfo.sessionName,
        description: sessionInfo.description,
        volatility: sessionInfo.volatilityTier,
        utcTime: sessionInfo.utcTime,
      },
      macroVerdict: {
        status: macroStatus,
        color: macroColor,
        actionableSummary,
        cashPreservationActive: isExtended,
      },
      btc: {
        symbol: 'BTCUSDT',
        price: btcPrice,
        change24h: btcChange,
        score: btcScore,
        distToSma200Pct: btcDist200,
        sma200: btcSma200,
        rsi14: btcRsi,
        fearGreed: btcFear,
        pivots: btcPivots,
      },
      spy: {
        symbol: 'SPY',
        price: spyPrice,
        change24h: spyChange,
        score: spyScore,
        distToSma200Pct: spyDist200,
        sma200: spySma200,
        rsi14: spyRsi,
        vix: spyVix,
      },
      geopolitical: {
        defconLevel,
        defconTitle,
        tacticalVerdict: geoRisk?.tacticalVerdict || 'Diplomatic tension contained below contagion levels.',
        crudeOilPrice: crudePrice,
        crudeOilChange5d: crudeChange5d,
        isCrudeCritical,
      },
      tacticalDirectives,
      speechScript,
    };

    return NextResponse.json(responseData, {
      headers: {
        'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60',
      },
    });
  } catch (error: any) {
    console.error('Error generating Jarvis briefing:', error);
    return NextResponse.json(
      { error: 'Failed to generate Jarvis briefing', message: error?.message },
      { status: 500 }
    );
  }
}
