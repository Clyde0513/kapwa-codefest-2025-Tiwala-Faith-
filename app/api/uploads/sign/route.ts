import { NextRequest, NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import { checkRateLimit } from '../../../../lib/rate-limit';
import { getSupabaseAdmin, SUPABASE_MEDIA_BUCKET } from '../../../../lib/supabase';
import { proxiedSupabaseMediaUrl } from '../../../../lib/supabase-media';

export const runtime = 'nodejs';

const MAX_IMAGE_BYTES = 10 * 1024 * 1024;
const MAX_VIDEO_BYTES = 100 * 1024 * 1024;

function sanitizeFileName(name: string): string {
  return name
    .replace(/\.[^/.]+$/, '')
    .toLowerCase()
    .replace(/[^a-z0-9-_]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);
}

function getExtension(file: File, resourceType: 'image' | 'video'): string {
  const fromName = file.name.split('.').pop()?.toLowerCase();
  if (fromName) {
    return fromName;
  }

  if (resourceType === 'video') {
    return 'mp4';
  }

  return 'jpg';
}

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
    const rateLimit = await checkRateLimit({
      key: ip,
      action: 'media-upload',
      limit: 50,
      windowMs: 60 * 1000,
    });

    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          error: 'Rate limit exceeded',
          resetAt: new Date(rateLimit.resetAt).toISOString(),
        },
        { status: 429 }
      );
    }

    const formData = await req.formData();
    const file = formData.get('file');
    const resourceTypeRaw = formData.get('resourceType');

    if (!(file instanceof File)) {
      return NextResponse.json(
        { error: 'File is required' },
        { status: 400 }
      );
    }

    const resourceType: 'image' | 'video' =
      resourceTypeRaw?.toString() === 'video' ? 'video' : 'image';

    if (resourceType === 'image' && !file.type.startsWith('image/')) {
      return NextResponse.json(
        { error: 'Expected an image file' },
        { status: 400 }
      );
    }

    if (resourceType === 'video' && !file.type.startsWith('video/')) {
      return NextResponse.json(
        { error: 'Expected a video file' },
        { status: 400 }
      );
    }

    const maxBytes = resourceType === 'video' ? MAX_VIDEO_BYTES : MAX_IMAGE_BYTES;
    if (file.size > maxBytes) {
      return NextResponse.json(
        { error: `File too large. Max size is ${resourceType === 'video' ? '100MB' : '10MB'}.` },
        { status: 400 }
      );
    }

    const extension = getExtension(file, resourceType);
    const safeName = sanitizeFileName(file.name || `${resourceType}-${Date.now()}`);
    const folder = `${resourceType}s/${new Date().toISOString().slice(0, 10)}`;
    const publicId = `${folder}/${Date.now()}-${randomUUID()}-${safeName}.${extension}`;

    const supabase = getSupabaseAdmin();
    const { error: uploadError } = await supabase.storage
      .from(SUPABASE_MEDIA_BUCKET)
      .upload(publicId, file, {
        cacheControl: '3600',
        upsert: false,
        contentType: file.type || undefined,
      });

    if (uploadError) {
      console.error('Supabase upload failed:', uploadError);
      return NextResponse.json(
        { error: 'Failed to upload media file' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      publicId,
      url: proxiedSupabaseMediaUrl(publicId),
      bucket: SUPABASE_MEDIA_BUCKET,
      format: extension,
      bytes: file.size,
      contentType: file.type,
      rateLimitSource: rateLimit.source,
    });
  } catch (error) {
    console.error('Error proxying Supabase upload:', error);
    return NextResponse.json(
      { error: 'Failed to process upload' },
      { status: 500 }
    );
  }
}