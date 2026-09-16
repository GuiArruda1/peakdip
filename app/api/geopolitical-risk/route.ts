import { NextResponse } from 'next/server';
import { calculateGeopoliticalRisk, GeopoliticalRiskState } from '@/lib/engine/geopolitical';

export const dynamic = 'force-dynamic';

// 60-second in-memory cache to prevent rate-limiting on Polymarket / Yahoo
let cachedRiskState: GeopoliticalRiskState | null = null;
let lastFetchedAt = 0;
const CACHE_TTL_MS = 60 * 1000;

export async function GET() {
  try {
    const now = Date.now();
    if (cachedRiskState && now - lastFetchedAt < CACHE_TTL_MS) {
      return NextResponse.json(cachedRiskState, {
        headers: {
          'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
        },
      });
    }

    const freshState = await calculateGeopoliticalRisk();
    cachedRiskState = freshState;
    lastFetchedAt = now;

    return NextResponse.json(freshState, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
      },
    });
  } catch (error: any) {
    console.error('Error calculating geopolitical risk:', error);
    if (cachedRiskState) {
      return NextResponse.json(cachedRiskState);
    }
    return NextResponse.json(
      { error: 'Failed to calculate geopolitical risk', details: error?.message },
      { status: 500 }
    );
  }
}
