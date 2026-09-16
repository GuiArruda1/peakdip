import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { text, voice = 'onyx', speed = 1.0, apiKey: clientKey } = body;

    if (!text || typeof text !== 'string') {
      return NextResponse.json({ error: 'Text prompt is required' }, { status: 400 });
    }

    const key = clientKey?.trim() || process.env.OPENAI_API_KEY;
    if (!key) {
      return NextResponse.json(
        {
          error: 'NO_KEY',
          message: 'OpenAI API key not found. Please provide an API key in settings to unlock Studio Neural Voice.',
        },
        { status: 400 }
      );
    }

    // Call OpenAI TTS Endpoint
    const response = await fetch('https://api.openai.com/v1/audio/speech', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${key}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'tts-1',
        voice: voice || 'onyx', // 'onyx' gives a deep, authoritative Jarvis tone; 'echo' gives smooth British cadence
        input: text.slice(0, 4096),
        speed: Math.max(0.75, Math.min(1.25, speed || 1.0)),
      }),
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      return NextResponse.json(
        {
          error: 'OPENAI_TTS_FAILED',
          message: errData?.error?.message || `OpenAI speech generation failed with status ${response.status}`,
        },
        { status: response.status }
      );
    }

    const audioBuffer = await response.arrayBuffer();

    return new NextResponse(audioBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Length': audioBuffer.byteLength.toString(),
        'Cache-Control': 'public, max-age=3600',
      },
    });
  } catch (error: any) {
    console.error('Failed to generate studio voice:', error);
    return NextResponse.json(
      { error: 'SERVER_ERROR', message: error?.message || 'Internal voice generation error' },
      { status: 500 }
    );
  }
}
