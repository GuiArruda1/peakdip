import { NextResponse } from 'next/server';
import { sendMarketDigestEmail } from '@/lib/notifications/emailService';
import { getEmailConfig, saveEmailConfig } from '@/lib/notifications/config';

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const recipientEmail = body.email || (await getEmailConfig()).recipientEmail;

    if (!recipientEmail) {
      return NextResponse.json(
        { error: 'Recipient email is required to dispatch Jarvis briefing.' },
        { status: 400 }
      );
    }

    // Save email if updated
    if (body.email) {
      await saveEmailConfig({ recipientEmail: body.email });
    }

    const result = await sendMarketDigestEmail({
      recipientEmail,
      provider: body.provider || undefined,
    });

    return NextResponse.json({
      success: true,
      message: `Jarvis daily briefing dispatched to ${recipientEmail}`,
      log: result.log,
    });
  } catch (error: any) {
    console.error('Error dispatching Jarvis briefing email:', error);
    return NextResponse.json(
      { error: 'Dispatch failed', message: error?.message },
      { status: 500 }
    );
  }
}
