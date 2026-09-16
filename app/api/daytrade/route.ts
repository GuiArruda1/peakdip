import { NextRequest, NextResponse } from 'next/server';
import { fetchIntradayCandles } from '@/lib/ingestion/daytrade';
import { analyzeDayTradeState } from '@/lib/engine/daytrade';
import { DayTradeTimeframe, DayTradePayload } from '@/lib/types';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const rawSymbol = searchParams.get('symbol') || 'BTCUSDT';
    const symbol = rawSymbol.toUpperCase();

    const rawTf = searchParams.get('timeframe') || '5m';
    const timeframe: DayTradeTimeframe = ['1m', '5m', '15m', '1h'].includes(rawTf)
      ? (rawTf as DayTradeTimeframe)
      : '5m';

    // Ingest intraday candles
    const candles = await fetchIntradayCandles(symbol, timeframe, 180);

    if (candles.length === 0) {
      return NextResponse.json({ error: 'No intraday data available' }, { status: 404 });
    }

    // Run day trade analytics
    const { indicators, setups, session } = analyzeDayTradeState(symbol, timeframe, candles);

    const latestCandle = candles[candles.length - 1];
    const firstCandle = candles[0];
    const high24h = Math.max(...candles.map((c) => c.high));
    const low24h = Math.min(...candles.map((c) => c.low));
    const volume24h = candles.reduce((acc, c) => acc + c.volume, 0);

    const priceChangePct = Number(
      (((latestCandle.close - firstCandle.open) / firstCandle.open) * 100).toFixed(2)
    );

    const payload: DayTradePayload = {
      symbol,
      timeframe,
      currentPrice: latestCandle.close,
      priceChangePct,
      high24h: Number(high24h.toFixed(2)),
      low24h: Number(low24h.toFixed(2)),
      volume24h: Math.round(volume24h),
      candles,
      indicators,
      setups,
      session,
      lastUpdated: Date.now(),
    };

    return NextResponse.json(payload);
  } catch (err: any) {
    console.error('DayTrade API route error:', err);
    return NextResponse.json(
      { error: err?.message || 'Failed to process day trade data' },
      { status: 500 }
    );
  }
}
