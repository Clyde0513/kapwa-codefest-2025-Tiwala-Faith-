import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin, SUPABASE_MEDIA_BUCKET } from '../../../../lib/supabase';

export const runtime = 'nodejs';

const CACHE_SECONDS = 60 * 60 * 24 * 30; // 30 days

export async function GET(req: NextRequest) {
  const path = req.nextUrl.searchParams.get('path');

  if (!path || path.includes('..')) {
    return NextResponse.json({ error: 'Invalid media path' }, { status: 400 });
  }

  try {
    const { data, error } = await getSupabaseAdmin()
      .storage
      .from(SUPABASE_MEDIA_BUCKET)
      .download(path);

    if (error || !data) {
      return NextResponse.json({ error: 'Media not found' }, { status: 404 });
    }

    const headers = new Headers();
    headers.set('Cache-Control', `public, max-age=${CACHE_SECONDS}, immutable`);

    if (data.type) {
      headers.set('Content-Type', data.type);
    }

    return new NextResponse(data, { headers });
  } catch (error) {
    console.error('Media proxy error:', error);
    return NextResponse.json({ error: 'Failed to proxy media' }, { status: 500 });
  }
}
