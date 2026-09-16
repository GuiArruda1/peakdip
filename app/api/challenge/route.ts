import { NextRequest, NextResponse } from 'next/server';
import { getChallengeProfile, saveChallengeProfile } from '@/lib/challenge/storage';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const profile = await getChallengeProfile();
    return NextResponse.json({ success: true, profile });
  } catch (err: any) {
    console.error('Failed to get challenge profile:', err);
    return NextResponse.json(
      { success: false, error: err?.message || 'Server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const updated = await saveChallengeProfile(body);
    return NextResponse.json({ success: true, profile: updated });
  } catch (err: any) {
    console.error('Failed to save challenge profile:', err);
    return NextResponse.json(
      { success: false, error: err?.message || 'Server error' },
      { status: 500 }
    );
  }
}
