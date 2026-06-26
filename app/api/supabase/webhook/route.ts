import { NextRequest, NextResponse } from 'next/server';

export async function POST(_req: NextRequest) {
  return NextResponse.json(
    {
      error: 'Cloudinary webhook is retired. Media now uses Supabase Storage.',
    },
    { status: 410 }
  );
}

export async function GET(_req: NextRequest) {
  return NextResponse.json({
    status: 'retired',
    provider: 'supabase-storage',
    timestamp: new Date().toISOString(),
  });
}
