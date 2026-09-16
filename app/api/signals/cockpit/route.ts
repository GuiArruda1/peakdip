import { NextResponse } from 'next/server';
import { getCockpitData } from '@/lib/dataProvider';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const data = await getCockpitData();
    return NextResponse.json(data);
  } catch (err: any) {
    console.error('Cockpit signals API error:', err);
    return NextResponse.json({ error: err?.message || 'Failed to load cockpit data' }, { status: 500 });
  }
}
