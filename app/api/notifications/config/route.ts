import { NextRequest, NextResponse } from 'next/server';
import { getEmailConfig, saveEmailConfig, getDispatchLogs } from '@/lib/notifications/config';
import { initHourlyScheduler } from '@/lib/notifications/scheduler';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    initHourlyScheduler();
    const [config, logs] = await Promise.all([
      getEmailConfig(),
      getDispatchLogs(),
    ]);

    return NextResponse.json({ config, logs });
  } catch (err: any) {
    console.error('Failed to get email config:', err);
    return NextResponse.json({ error: err?.message || 'Server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    initHourlyScheduler();
    const body = await request.json();
    const updated = await saveEmailConfig(body);
    return NextResponse.json({ success: true, config: updated });
  } catch (err: any) {
    console.error('Failed to save email config:', err);
    return NextResponse.json({ error: err?.message || 'Server error' }, { status: 500 });
  }
}
