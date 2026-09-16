import { NextRequest, NextResponse } from 'next/server';
import { ensureDataReady } from '@/lib/dataProvider';
import { processAIChat, AIChatRequest } from '@/lib/copilot/aiEngine';
import { ChatMessage, DayTradeContext } from '@/lib/copilot/advisor';
import { fetchIntradayCandles } from '@/lib/ingestion/daytrade';
import { analyzeDayTradeState } from '@/lib/engine/daytrade';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      message,
      symbol = 'BTCUSDT',
      history = [],
      apiKey,
      provider = 'builtin',
      timeframe = '5m',
      mode = 'swing',
      image,
    } = body;

    const userMessage =
      typeof message === 'string' && message.trim()
        ? message.trim()
        : image
        ? 'Analyze this chart screenshot and give me tactical probabilities, trend, key levels, and trade advice.'
        : '';

    if (!userMessage) {
      return NextResponse.json({ error: 'Message or image is required' }, { status: 400 });
    }

    const lowerMsg = userMessage.toLowerCase();
    const cleanSymbol: 'BTCUSDT' | 'SPY' =
      lowerMsg.includes('sp500') || lowerMsg.includes('s&p') || lowerMsg.includes('spy') || lowerMsg.includes('spx')
        ? 'SPY'
        : lowerMsg.includes('btc') || lowerMsg.includes('bitcoin') || lowerMsg.includes('crypto')
        ? 'BTCUSDT'
        : symbol.toUpperCase().includes('SPY')
        ? 'SPY'
        : 'BTCUSDT';

    // Ingest latest live swing context
    const assetData = await ensureDataReady(cleanSymbol);

    // Ingest latest live intraday day trade context
    let dayTradeContext: DayTradeContext | null = null;
    try {
      const intradayCandles = await fetchIntradayCandles(cleanSymbol, (timeframe as any) || '5m', 120);
      if (intradayCandles && intradayCandles.length > 0) {
        const { indicators, setups, session } = analyzeDayTradeState(
          cleanSymbol,
          (timeframe as any) || '5m',
          intradayCandles
        );
        const lastCandle = intradayCandles[intradayCandles.length - 1];
        dayTradeContext = {
          timeframe: (timeframe as any) || '5m',
          currentPrice: lastCandle.close,
          currentVwap: indicators.currentVwap,
          distToVwapPct: indicators.distToVwapPct,
          ema9: indicators.ema9[indicators.ema9.length - 1]?.value ?? lastCandle.close,
          ema21: indicators.ema21[indicators.ema21.length - 1]?.value ?? lastCandle.close,
          atr14: indicators.atr14,
          rsi14: indicators.rsi14[indicators.rsi14.length - 1]?.value ?? 50,
          pivots: indicators.pivots,
          session: {
            name: session.sessionName,
            volatility: session.volatilityTier,
            description: session.description,
            utcTime: session.utcTime,
          },
          activeSetups: setups.map((s) => ({
            direction: s.direction,
            setupName: s.setupName,
            confidence: s.confidence,
            entryPrice: s.entryPrice,
            stopLoss: s.stopLoss,
            takeProfit1: s.takeProfit1,
            takeProfit2: s.takeProfit2,
            riskRewardRatio: s.riskRewardRatio,
            rationale: s.rationale,
          })),
        };
      }
    } catch (err) {
      console.warn('Could not compute intraday day trade context for chat:', err);
    }

    // Check headers for API key / provider if not in body
    const effectiveApiKey =
      apiKey ||
      request.headers.get('x-ai-key') ||
      process.env.GEMINI_API_KEY ||
      process.env.OPENAI_API_KEY ||
      process.env.GROQ_API_KEY;

    const effectiveProvider =
      provider ||
      (request.headers.get('x-ai-provider') as any) ||
      (process.env.GEMINI_API_KEY ? 'gemini' : process.env.OPENAI_API_KEY ? 'openai' : 'builtin');

    const chatReq: AIChatRequest = {
      message: userMessage,
      symbol: cleanSymbol,
      history,
      apiKey: effectiveApiKey || undefined,
      provider: effectiveProvider,
      timeframe,
      mode,
      image,
    };

    // Extract Layer 3 Chart Context (Candlesticks, 200/50 SMA, RSI Subpane, Markers)
    const candles = assetData.candles || [];
    const lastCandle = candles.length > 0 ? candles[candles.length - 1] : undefined;
    const prevCandle = candles.length > 1 ? candles[candles.length - 2] : undefined;
    const sma200Val =
      assetData.conviction?.indicators.sma200 ??
      (assetData.indicators.sma200[assetData.indicators.sma200.length - 1]?.value || undefined);
    const sma50Val =
      assetData.conviction?.indicators.sma50 ??
      (assetData.indicators.sma50[assetData.indicators.sma50.length - 1]?.value || undefined);
    const rsi14Val =
      assetData.conviction?.indicators.rsi14 ??
      (assetData.indicators.rsi14[assetData.indicators.rsi14.length - 1]?.value || undefined);
    const dist200Pct = assetData.conviction?.indicators.distToSma200Pct ?? 0;
    const recentTriggers = assetData.backtest?.recentTriggers || [];
    const lastTrigger = recentTriggers[recentTriggers.length - 1];

    const chartContext = {
      lastCandle: lastCandle
        ? {
            time: lastCandle.time,
            open: lastCandle.open,
            high: lastCandle.high,
            low: lastCandle.low,
            close: lastCandle.close,
            volume: lastCandle.volume,
          }
        : undefined,
      previousCandle: prevCandle
        ? {
            time: prevCandle.time,
            open: prevCandle.open,
            high: prevCandle.high,
            low: prevCandle.low,
            close: prevCandle.close,
          }
        : undefined,
      sma200: sma200Val,
      sma50: sma50Val,
      rsi14: rsi14Val,
      distToSma200Pct: dist200Pct,
      markersCount: recentTriggers.length,
      lastMarkerDate: lastTrigger?.date,
      lastMarkerScore: lastTrigger?.compositeScore,
    };

    // Process chat with Live AI Copilot
    const response: ChatMessage = await processAIChat(chatReq, {
      symbol: cleanSymbol,
      conviction: assetData.conviction,
      backtest: assetData.backtest,
      seasonality: assetData.seasonality,
      daytrade: dayTradeContext,
      chart: chartContext,
    });

    return NextResponse.json({ response, provider: effectiveProvider });
  } catch (err: any) {
    console.error('Copilot API error:', err);
    return NextResponse.json({ error: err?.message || 'Advisor error' }, { status: 500 });
  }
}
