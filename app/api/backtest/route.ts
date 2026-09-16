import { NextRequest, NextResponse } from 'next/server';
import { getBacktestData } from '@/lib/dataProvider';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const symbolParam = (searchParams.get('symbol') || 'BTCUSDT').toUpperCase();
    const symbol = symbolParam.includes('SPY') ? 'SPY' : 'BTCUSDT';

    const data = await getBacktestData(symbol);
    return NextResponse.json(data);
  } catch (err: any) {
    console.error('Backtest API error:', err);
    return NextResponse.json({ error: err?.message || 'Failed to load backtest data' }, { status: 500 });
  }
}
