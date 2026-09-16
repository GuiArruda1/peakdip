import { NextResponse } from 'next/server';
import { syncAllData } from '@/lib/dataProvider';

export const dynamic = 'force-dynamic';

export async function POST() {
  try {
    const result = await syncAllData();
    return NextResponse.json(result);
  } catch (err: any) {
    console.error('Data sync API error:', err);
    return NextResponse.json({ error: err?.message || 'Sync failed' }, { status: 500 });
  }
}
