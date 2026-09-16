import { NextRequest, NextResponse } from 'next/server';
import { sendMarketDigestEmail } from '@/lib/notifications/emailService';
import { initHourlyScheduler } from '@/lib/notifications/scheduler';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    initHourlyScheduler();
    const body = await request.json().catch(() => ({}));
    const result = await sendMarketDigestEmail(body);

    return NextResponse.json(result);
  } catch (err: any) {
    console.error('Email dispatch route error:', err);
    return NextResponse.json({ error: err?.message || 'Dispatch error' }, { status: 500 });
  }
}
