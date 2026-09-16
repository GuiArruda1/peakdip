import { NextResponse } from 'next/server';
import { getBubbleThermometerPayload } from '@/lib/engine/bubbleThermometer';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const forceSync = searchParams.get('sync') === 'true';

    const payload = await getBubbleThermometerPayload(forceSync);
    return NextResponse.json(payload);
  } catch (err: any) {
    console.error('[API /api/bubble-thermometer] Error evaluating bubble thermometer:', err);
    return NextResponse.json(
      { error: 'Failed to calculate S&P 500 Tech Bubble Thermometer' },
      { status: 500 }
    );
  }
}
