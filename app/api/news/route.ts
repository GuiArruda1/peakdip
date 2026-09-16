import { NextResponse } from 'next/server';
import { fetchLiveMarketNews } from '@/lib/ingestion/news';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const news = await fetchLiveMarketNews();
    return NextResponse.json({
      success: true,
      count: news.length,
      news,
      lastUpdated: new Date().toLocaleTimeString(undefined, {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      }),
    });
  } catch (err: any) {
    console.error('[API /api/news] Error:', err);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch live market news wire' },
      { status: 500 }
    );
  }
}
