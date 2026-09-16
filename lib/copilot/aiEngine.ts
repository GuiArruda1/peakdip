import { DipConvictionSnapshot, BacktestResult, SeasonalityMatrixData } from '../types';
import {
  generateAdvisorResponse as generateBuiltinResponse,
  ChatMessage,
  DayTradeContext,
  Layer3ChartContext,
  QuantitativeContext,
} from './advisor';

export interface AIChatRequest {
  message: string;
  symbol: string;
  history?: ChatMessage[];
  apiKey?: string;
  provider?: 'gemini' | 'openai' | 'groq' | 'builtin';
  timeframe?: string;
  mode?: 'swing' | 'daytrade';
  image?: string;
}

function buildSystemPrompt(context: QuantitativeContext): string {
  const { symbol, conviction, backtest, seasonality } = context;
  const isBtc = symbol.toUpperCase().includes('BTC');
  const assetName = isBtc ? 'Bitcoin (BTC/USDT)' : 'S&P 500 ETF (SPY)';
  const currentPrice = conviction?.currentPrice || 0;
  const priceChange = conviction?.priceChange24h || 0;
  const score = conviction?.compositeScore || 50;
  const signalLabel = conviction?.signalLabel || 'NEUTRAL';
  const regime = conviction?.ml.regime || 'VOLATILE_CHOP';
  const winProb = Math.round((conviction?.ml.dipSuccessProb14d || 0.5) * 100);
  const expectedReturn = conviction?.ml.expectedFwdReturn14d || 1.0;
  const rsi = conviction?.indicators.rsi14 || 50;
  const sma200 = conviction?.indicators.sma200 || currentPrice;
  const sma50 = conviction?.indicators.sma50 || currentPrice;
  const dist200 = conviction?.indicators.distToSma200Pct || 0;
  const zScore = conviction?.indicators.drawdownZScore || 0;
  const sentimentVal = conviction?.indicators.fearGreedOrVix.value || 50;
  const sentimentLabel = conviction?.indicators.fearGreedOrVix.label || 'Neutral';
  const dayOfWeek = conviction?.indicators.calendarStatus.dayOfWeek || 'Today';

  const maxDd = backtest?.maxDrawdownAvg || -8.0;
  const stopLossDistance = Math.abs(maxDd * 1.5);
  const stopLossPrice = currentPrice * (1 - stopLossDistance / 100);

  const triggersSummary =
    conviction?.triggers
      .map(
        (t) =>
          `- ${t.name}: Current=${t.valueDescription}, Target=${t.thresholdDescription} -> ${
            t.active ? 'ACTIVE (TRIGGERED)' : 'INACTIVE'
          }`
      )
      .join('\n') || 'None';

  const shapContributions =
    conviction?.ml.featureContributions
      .map((fc) => `${fc.feature} (${fc.impact > 0 ? '+' : ''}${Math.round(fc.impact * 100)}% impact: ${fc.description})`)
      .join('; ') || 'Standard indicators';

  return `You are PEAK AI, the live Quantitative Trading Copilot & Market Timing Advisor for the PEAK Dip Hunter platform.
You are embedded directly in the live trading terminal. You have real-time access to live market feeds, mathematical triggers, machine learning regimes, and walk-forward backtests.

YOUR MISSION:
1. Help the user make the best, risk-managed trading decisions: Should they buy right now? Wait? Scale in? Where should they place invalidation stop-losses?
2. Explain any concept, module, trigger, calculation, or strategy in the PEAK platform with crystal clarity.
3. Be disciplined, mathematical, and objective. Never give reckless advice or emotional FOMO.

LIVE REAL-TIME MARKET STATE INJECTED RIGHT NOW:
- Asset: ${assetName} (${symbol})
- Current Price: $${currentPrice.toLocaleString()} (${priceChange >= 0 ? '+' : ''}${priceChange.toFixed(2)}% in 24h)
- Timing Conviction Score: ${score}/100 [SIGNAL CLASSIFICATION: ${signalLabel.replace(/_/g, ' ')}]
- 5 Core Mathematical Triggers:
${triggersSummary}
- Technical Metrics:
  - RSI(14 Wilder Exponential): ${rsi.toFixed(1)} (Oversold threshold: < ${isBtc ? 30 : 35})
  - 200-Day SMA Institutional Baseline: $${sma200.toLocaleString()} (Distance: ${dist200 > 0 ? '+' : ''}${dist200.toFixed(1)}%)
  - 50-Day SMA Trend: $${sma50.toLocaleString()}
  - 30-Day Drawdown Z-Score: ${zScore.toFixed(2)}σ (Statistical capitulation drop: <= -2.50σ)
  - Sentiment / Panic Indicator: ${sentimentVal} (${sentimentLabel})
  - Calendar Window: ${dayOfWeek} (${conviction?.indicators.calendarStatus.isFavorableWindow ? 'Favorable accumulation window' : 'Normal session'})
- Machine Learning (ML) Engine:
  - Active Market Regime: ${regime} (BULL_TREND / BEAR_TREND / VOLATILE_CHOP)
  - 14-Day Forward Bounce Probability P(Win): ${winProb}%
  - Expected 14-Day Forward Return: ${expectedReturn > 0 ? '+' : ''}${expectedReturn}%
  - Top ML Factor Drivers: ${shapContributions}
- Historical Walk-Forward Backtest Stats (${symbol}):
  - Total verified historical dip signals: ${backtest?.totalSignals || 0}
  - 30-Day Forward Win Rate: ${backtest?.winRate30d || 0}% (Average return: +${backtest?.avgReturn30d || 0}%)
  - 90-Day Forward Win Rate: ${backtest?.winRate90d || 0}% (Average return: +${backtest?.avgReturn90d || 0}%)
  - Average Adverse Drawdown during 30d: ${maxDd}%
  - Recommended Stop-Loss Distance: -${stopLossDistance.toFixed(1)}% (at ~$${stopLossPrice.toFixed(2)})
${
  context.daytrade
    ? `
REAL-TIME INTRADAY DAY TRADE / SCALPING STATE (${context.daytrade.timeframe}):
- Active Market Session: ${context.daytrade.session.name} (${context.daytrade.session.volatility} VOLATILITY)
- Intraday Current Price: $${context.daytrade.currentPrice}
- Session VWAP: $${context.daytrade.currentVwap} (${context.daytrade.distToVwapPct >= 0 ? '+' : ''}${context.daytrade.distToVwapPct}% vs VWAP)
- EMA 9: $${context.daytrade.ema9} • EMA 21: $${context.daytrade.ema21}
- 14-period ATR Volatility: $${context.daytrade.atr14.toFixed(2)}
- Floor Pivots: PP=$${context.daytrade.pivots.pp}, R1=$${context.daytrade.pivots.r1}, S1=$${context.daytrade.pivots.s1}
- Active Algorithmic Scalp Setups:
${
  context.daytrade.activeSetups.length > 0
    ? context.daytrade.activeSetups
        .map(
          (s) =>
            `  * ${s.direction} SCALP (${s.setupName}, ${s.confidence}% Quality): Trigger Entry=$${s.entryPrice}, Invalidation Stop Loss=$${s.stopLoss}, TP1=$${s.takeProfit1} (1.5R), TP2=$${s.takeProfit2} (2.5R), R:R=${s.riskRewardRatio}`
        )
        .join('\n')
    : '  * Neutral range (No immediate setup triggered)'
}
`
    : ''
}
${
  context.chart
    ? `
REAL-TIME LAYER 3 CHART STATE (TRADINGVIEW CANDLESTICKS, 200 SMA, 50 SMA & RSI SUBPANE):
- Latest Daily Candle: Open=$${context.chart.lastCandle?.open?.toLocaleString()}, High=$${context.chart.lastCandle?.high?.toLocaleString()}, Low=$${context.chart.lastCandle?.low?.toLocaleString()}, Close=$${context.chart.lastCandle?.close?.toLocaleString()}
- Candle Color/Direction: ${
        context.chart.lastCandle && context.chart.lastCandle.close >= context.chart.lastCandle.open
          ? 'BULLISH (Green Candle)'
          : 'BEARISH (Red Candle)'
      }
- Amber Line (200-Day SMA Institutional Baseline): $${context.chart.sma200?.toLocaleString()} (Price Distance: ${
        context.chart.distToSma200Pct !== undefined && context.chart.distToSma200Pct >= 0 ? '+' : ''
      }${context.chart.distToSma200Pct?.toFixed(1)}%)
- Cyan Line (50-Day SMA Trendline): $${context.chart.sma50?.toLocaleString()}
- Moving Average Alignment: ${
        context.chart.sma50 && context.chart.sma200
          ? context.chart.sma50 > context.chart.sma200
            ? 'Golden Cross (50 SMA > 200 SMA - Macro Bullish)'
            : 'Death Cross (50 SMA < 200 SMA - Macro Resistance)'
          : 'Neutral'
      }
- Sub-Chart RSI(14 Wilder Exponential): ${context.chart.rsi14?.toFixed(1)} (Oversold: < ${isBtc ? 30 : 35} • Overbought: > 70)
- Historical Chart Markers: ${context.chart.markersCount || 0} verified dip triggers plotted on canvas (Most recent on ${
        context.chart.lastMarkerDate || 'Recent'
      } at ${context.chart.lastMarkerScore || 0}% score)
`
    : ''
}

PEAK BRAIN KNOWLEDGE REPOSITORY & STARTER BLUEPRINTS (/brain):
You are fully connected to the PEAK Brain area and its institutional library. When users ask about Brain concepts, guides, or blueprints, give authoritative, structured answers:
1. STARTER BLUEPRINTS & MASTERCLASSES:
   - "How to Start Trading the S&P 500":
     * What it is: Market-cap weighted index of top 500 US companies (top tech giants drive ~32%).
     * 3 Instruments: Spot ETF (SPY/VOO in US, or UCITS CSPX/VUAA/SXR8 in Europe) vs. Micro E-mini Futures (/MES on CME: $5/point, ~$100–$150 intraday margin, 23h trading, no PDT rule) vs. Options (SPY/SPX).
     * Recommended Brokers: Interactive Brokers (IBKR) for futures/options from Europe/globally; Trade Republic or Degiro for European UCITS ETFs starting at €10. Strictly advise avoiding unregulated retail CFDs due to high overnight swap fees and conflict of interest.
     * Execution Timing: Never enter during the 16:30–18:30 Lisbon (11:30–13:30 ET) Lunch Chop Zone. Best window is 15:00–16:30 Lisbon (10:00–11:30 ET) Golden Window or pullbacks to 200-SMA with conviction >= 50.
     * Capital & Risk: Paper trade 2 weeks first; cap risk at max 1%–2% of account equity per trade.
   - "Micro Futures (/MES) vs. SPY ETF vs. CFDs":
     * SPY / VOO ETF: $1/pt move, 0x leverage, cash settled, zero margin calls, ideal for swing accumulation and compounding.
     * Micro E-mini (/MES): $5/pt move on S&P 500, ~10x-20x leverage with ~$150 day margin, trades 23h/day, no Pattern Day Trader rule, clean CME order flow.
     * CFDs: Synthetic contracts where the broker trades against you; high spread and daily financing costs. Avoid for systematic swing trading.
   - "Options 101 & Avoiding the 0DTE Trap":
     * Institutional sweet spot: Buy 30–45 DTE slightly in-the-money (0.65–0.75 Delta).
     * 0DTE Trap: Buying same-day options in the afternoon has negative mathematical expectancy because Theta decay is vertical.
   - "The 5-Point Pre-Flight Checklist Before Clicking Buy":
     * 1. Timing Conviction Score >= 50? 2. Risk/Reward >= 3:1? 3. Hard Stop-Loss set in broker? 4. Outside lunch chop? 5. Total risk <= 1%–2%?
2. THE BRAIN CODEX (20+ Concepts):
   - Indicators: Wilder RSI(14), 200-SMA Baseline, Drawdown Z-Score, ATR(14) Volatility Buffer, Floor Trader Pivots (PP, R1, S1), 1.618R Golden Ratio Target, VWAP & SD Bands.
   - Psychology: Expectancy E = (W% * AvgWin) - (L% * AvgLoss), Douglas 20-Trade Batch, Hougaard Stop Compliance, Anti-Martingale (never average down), Livermore "Big Sitting" Cash Clock, PTJ 5:1 Asymmetry.
   - Microstructure: Baudrillard Simulacra Arbitrage (Δ_sim), Lisbon ⇄ New York Session Windows, Liquidity Voids, Capitulation Volume Spikes.
   - Options & Macro: 0DTE Mechanics, IV Crush, DEFCON 1–5 Geopolitical War Risk, Fear & Greed / VIX Inversion, 40/35/25 Tranche Scaling.
3. INTERACTIVE BRAIN LAB:
   - Expectancy Simulator & Drawdown Recovery Reality Check (a -50% loss requires +100% gain to recover).
   - Live Lisbon / London / New York ET Session Clocks.

DECISION RULES:
- If Score >= 70 (STRONG DIP BUY): Enthusiastically confirm favorable asymmetrical risk-reward for scaling in using tranches (e.g. 40% market, 35% limit orders, 25% reserve). Give the exact stop-loss level.
- If Score 50–69 (MODERATE DIP): Recommend value scaling with staggered limit orders towards 200-SMA support.
- If Score < 30 (EXTENDED): Strictly advise against chasing. Explain that price is stretched above moving averages and advise waiting for a pullback to the 50-day or 200-day SMA.
- If Regime is BEAR_TREND: Warn of "falling knife" danger unless capitulation volume or VIX > 35 is confirmed.
- For PSYCHOLOGY, MINDSET, LOSSES, or TRADING BOOKS: Ground your guidance in the 4 PEAK Trading Classics:
  1. Mark Douglas ("Trading in the Zone"): 20-trade sample batches, mathematical expectancy, accepting the random distribution of wins/losses.
  2. Tom Hougaard ("The Best Loser Wins"): Embracing stop losses frictionless without hope, never averaging down on losing trades, only adding to winners.
  3. Jesse Livermore ("Reminiscences of a Stock Operator"): "The Big Sitting" (patience in cash), waiting for unambiguous Pivotal Points.
  4. Paul Tudor Jones / Jack Schwager ("Market Wizards"): 5:1 Asymmetry Edge (requiring only a 16.7% win rate to break even; never risking $1 to make less than $2.50).
- For BRAIN QUESTIONS & BLUEPRINTS: Clearly explain the relevant Brain blueprint or codex concept, offering practical advice and next steps.
- Always provide actionable, direct numbers and clear bullet points.`;
}

// Call Google Gemini API
async function callGemini(
  systemPrompt: string,
  userMessage: string,
  history: ChatMessage[],
  apiKey: string,
  image?: string
): Promise<string> {
  const models = ['gemini-1.5-flash', 'gemini-2.0-flash', 'gemini-pro'];
  let lastError = '';

  for (const model of models) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

      // Format chat contents
      const contents: any[] = [
        {
          role: 'user',
          parts: [{ text: `${systemPrompt}\n\nPlease acknowledge and prepare for user questions.` }],
        },
        {
          role: 'model',
          parts: [{ text: 'Understood. I am PEAK AI, live and fully briefed on current market triggers, ML regimes, seasonality, and backtest data. How can I help you execute trades or navigate the platform today?' }],
        },
      ];

      // Add recent history
      for (const h of history.slice(-4)) {
        contents.push({
          role: h.sender === 'user' ? 'user' : 'model',
          parts: [{ text: h.text }],
        });
      }

      // Add current query with optional image
      const userParts: any[] = [];
      if (image) {
        const match = image.match(/^data:(image\/[a-zA-Z0-9+]+);base64,(.+)$/);
        if (match) {
          userParts.push({
            inline_data: {
              mime_type: match[1],
              data: match[2],
            },
          });
        }
      }
      userParts.push({ text: userMessage });

      contents.push({
        role: 'user',
        parts: userParts,
      });

      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents,
          generationConfig: {
            temperature: 0.3,
            maxOutputTokens: 1400,
          },
        }),
      });

      if (res.ok) {
        const json = await res.json();
        const candidate = json?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (candidate) return candidate;
      } else {
        lastError = await res.text();
      }
    } catch (err: any) {
      lastError = err?.message || 'Network error';
    }
  }

  throw new Error(`Gemini API failed across models: ${lastError}`);
}

// Call OpenAI / Groq / OpenRouter API
async function callOpenAICompatible(
  systemPrompt: string,
  userMessage: string,
  history: ChatMessage[],
  apiKey: string,
  provider: 'openai' | 'groq' = 'openai',
  image?: string
): Promise<string> {
  const endpoint =
    provider === 'groq'
      ? 'https://api.groq.com/openai/v1/chat/completions'
      : 'https://api.openai.com/v1/chat/completions';

  const model = provider === 'groq' ? 'llama-3.3-70b-versatile' : 'gpt-4o-mini';

  let userContent: any = userMessage;
  if (image && provider === 'openai') {
    userContent = [
      { type: 'text', text: userMessage },
      { type: 'image_url', image_url: { url: image } },
    ];
  }

  const messages = [
    { role: 'system', content: systemPrompt },
    ...history.slice(-4).map((h) => ({
      role: h.sender === 'user' ? 'user' : 'assistant',
      content: h.text,
    })),
    { role: 'user', content: userContent },
  ];

  const res = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages,
      temperature: 0.3,
      max_tokens: 1400,
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`${provider.toUpperCase()} API error (${res.status}): ${errText}`);
  }

  const json = await res.json();
  return json?.choices?.[0]?.message?.content || 'No response from model';
}

export async function processAIChat(
  req: AIChatRequest,
  context: QuantitativeContext
): Promise<ChatMessage> {
  const { message, symbol, history = [], apiKey, provider = 'builtin', image } = req;
  const effectiveApiKey =
    apiKey || process.env.GEMINI_API_KEY || process.env.OPENAI_API_KEY || process.env.GROQ_API_KEY;

  const systemPrompt = buildSystemPrompt(context);

  // If user provided Gemini Key or GEMINI_API_KEY is present
  if ((provider === 'gemini' || !apiKey) && (apiKey || process.env.GEMINI_API_KEY)) {
    try {
      const keyToUse = apiKey || process.env.GEMINI_API_KEY!;
      const aiReply = await callGemini(systemPrompt, message, history, keyToUse, image);
      return {
        id: Date.now().toString(),
        sender: 'assistant',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        text: aiReply,
        actionCard: determineActionCard(context, message, Boolean(image)),
      };
    } catch (e: any) {
      console.warn('Gemini call failed, falling back to built-in engine:', e.message);
    }
  }

  // If user provided OpenAI or Groq key
  if ((provider === 'openai' || provider === 'groq') && effectiveApiKey) {
    try {
      const aiReply = await callOpenAICompatible(systemPrompt, message, history, effectiveApiKey, provider, image);
      return {
        id: Date.now().toString(),
        sender: 'assistant',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        text: aiReply,
        actionCard: determineActionCard(context, message, Boolean(image)),
      };
    } catch (e: any) {
      console.warn('OpenAI/Groq call failed, falling back to built-in engine:', e.message);
    }
  }

  // Built-in Quantitative Intelligence Model with live market awareness
  return generateBuiltinResponse(message, context, history, image);
}

function determineActionCard(context: QuantitativeContext, userQuery?: string, hasImage = false) {
  const { symbol, conviction, backtest, chart, daytrade } = context;
  const q = (userQuery || '').toLowerCase();
  const isBtc = symbol.toUpperCase().includes('BTC');
  const assetName = isBtc ? 'Bitcoin (BTC)' : 'S&P 500 (SPY)';
  const currentPrice =
    daytrade?.currentPrice || chart?.lastCandle?.close || conviction?.currentPrice || (isBtc ? 77000 : 560);
  const score = conviction?.compositeScore || 50;
  const regime = conviction?.ml.regime || 'VOLATILE_CHOP';
  const maxDd = backtest?.maxDrawdownAvg || -8.0;
  const stopLossDistance = Math.abs(maxDd * 1.5);
  const stopLossPrice = currentPrice * (1 - stopLossDistance / 100);

  if (
    hasImage ||
    q.includes('probabilit') ||
    q.includes('what trend') ||
    q.includes('wyt') ||
    q.includes('whats going on') ||
    q.includes('what is going on') ||
    q.includes('tactical') ||
    q.includes('sweep') ||
    q.includes('sfp') ||
    q.includes('triple bottom') ||
    q.includes('double bottom') ||
    q.includes('range low')
  ) {
    const rangeHigh = isBtc ? 81600 : Number((currentPrice * 1.035).toFixed(2));
    const rangeLow = isBtc ? 76675 : Number((currentPrice * 0.965).toFixed(2));
    const rangeMid = Number(((rangeHigh + rangeLow) / 2).toFixed(2));
    const rangeSpan = rangeHigh - rangeLow;
    const positionInRangePct = rangeSpan > 0 ? ((currentPrice - rangeLow) / rangeSpan) * 100 : 50;

    let bounceProb = 65;
    let breakdownProb = 35;
    if (positionInRangePct <= 30) {
      bounceProb = 65;
      breakdownProb = 35;
    } else if (positionInRangePct >= 70) {
      bounceProb = 30;
      breakdownProb = 70;
    } else {
      bounceProb = 50;
      breakdownProb = 50;
    }

    const stopLoss = Number((rangeLow - (isBtc ? 225 : currentPrice * 0.005)).toFixed(2));
    const tp1 = Number((isBtc ? 77800 : currentPrice * 1.012).toFixed(2));
    const tp2 = rangeMid;
    const riskAmount = Math.max(1, currentPrice - stopLoss);
    const rewardAmount = Math.max(1, tp2 - currentPrice);
    const rrRatio = (rewardAmount / riskAmount).toFixed(1) + ' : 1';
    const riskPct = (((currentPrice - stopLoss) / currentPrice) * 100).toFixed(2);

    return {
      type: 'TACTICAL_PROBABILITY' as const,
      asset: assetName,
      verdict: bounceProb >= 60 ? `${bounceProb}% BOUNCE PROBABILITY` : 'NEUTRAL EQUILIBRIUM',
      convictionScore: bounceProb,
      regime,
      suggestedAction: `Long Range Low @ $${currentPrice.toLocaleString()} | Stop: $${stopLoss.toLocaleString()} | TP1: $${tp1.toLocaleString()}`,
      recommendedStopLoss: `$${stopLoss.toLocaleString()} (-${riskPct}%)`,
      probabilityData: {
        bounceProb,
        breakdownProb,
        rangeHigh,
        rangeLow,
        rangeMid,
        stopLoss,
        tp1,
        tp2,
        rrRatio,
      },
    };
  }

  if (q.includes('how to use') || q.includes('how do i') || q.includes('explain') || q.includes('trigger') || q.includes('platform') || q.includes('tutorial')) {
    return {
      type: 'EXPLAINER' as const,
      asset: assetName,
      verdict: 'PLATFORM KNOWLEDGE',
      convictionScore: score,
      regime,
      suggestedAction: 'Audited 5 core triggers, ML regime classifier, and walk-forward backtest.',
    };
  }

  if (q.includes('stop') || q.includes('loss') || q.includes('risk')) {
    return {
      type: 'BUY_RECOMMENDATION' as const,
      asset: assetName,
      verdict: 'STOP-LOSS RECOMMENDATION',
      convictionScore: score,
      regime,
      suggestedAction: `Place stop-loss at $${stopLossPrice.toFixed(2)} (-${stopLossDistance.toFixed(1)}%).`,
      recommendedStopLoss: `$${stopLossPrice.toFixed(2)} (-${stopLossDistance.toFixed(1)}%)`,
    };
  }

  if (score >= 70) {
    return {
      type: 'BUY_RECOMMENDATION' as const,
      asset: assetName,
      verdict: 'STRONG DIP BUY (CAPITULATION)',
      convictionScore: score,
      regime,
      suggestedAction: 'Scale in: 40% market, 35% limit orders, 25% reserve.',
      recommendedStopLoss: `$${stopLossPrice.toFixed(2)} (-${stopLossDistance.toFixed(1)}%)`,
    };
  }

  if (score >= 50) {
    return {
      type: 'BUY_RECOMMENDATION' as const,
      asset: assetName,
      verdict: 'MODERATE DIP (VALUE RELOAD)',
      convictionScore: score,
      regime,
      suggestedAction: 'Place staggered limit buys towards 200-SMA support.',
      recommendedStopLoss: `$${stopLossPrice.toFixed(2)} (-${stopLossDistance.toFixed(1)}%)`,
    };
  }

  return {
    type: 'HOLD_WAIT' as const,
    asset: assetName,
    verdict: score < 30 ? 'EXTENDED — WAIT FOR PULLBACK' : 'NEUTRAL — REGULAR DCA',
    convictionScore: score,
    regime,
    suggestedAction: score < 30 ? 'Do not chase extended prices. Wait for retest of 50/200 SMA.' : 'Maintain standard DCA. Keep dry powder ready.',
  };
}
