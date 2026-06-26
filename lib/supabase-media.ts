export type SupabaseUploadReceipt = {
  ok: boolean;
  publicId: string;
  url: string;
  bucket: string;
};

export type SupabaseUploadResult = {
  publicId: string;
  url: string;
  width: number;
  height: number;
  format: string;
  bytes: number;
  duration?: number;
  blurDataUrl?: string;
};

export function proxiedSupabaseMediaUrl(publicId: string): string {
  return `/api/media/proxy?path=${encodeURIComponent(publicId)}`;
}

export function normalizeMediaUrl(value: string): string {
  if (!value) {
    return value;
  }

  if (value.startsWith('/api/media/proxy') || value.startsWith('/images/')) {
    return value;
  }

  try {
    const url = new URL(value);
    const marker = '/storage/v1/object/public/';
    const markerIndex = url.pathname.indexOf(marker);

    if (markerIndex === -1) {
      return value;
    }

    const pathWithBucket = decodeURIComponent(url.pathname.slice(markerIndex + marker.length));
    const pathParts = pathWithBucket.split('/');
    pathParts.shift();
    const objectPath = pathParts.join('/');

    return objectPath ? proxiedSupabaseMediaUrl(objectPath) : value;
  } catch {
    return value;
  }
}

// Supabase media URL transform helpers
export function supabaseMediaUrl(publicId: string, transforms = 'f_auto,q_auto'): string {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const bucket =
    process.env.NEXT_PUBLIC_SUPABASE_MEDIA_BUCKET ||
    process.env.SUPABASE_MEDIA_BUCKET ||
    'media';

  if (!supabaseUrl) {
    throw new Error('Supabase URL is not configured');
  }

  const params = new URLSearchParams();
  const parts = transforms.split(',').map((part) => part.trim()).filter(Boolean);

  for (const part of parts) {
    if (part === 'c_fill') {
      params.set('resize', 'cover');
      continue;
    }
    if (part === 'c_fit') {
      params.set('resize', 'contain');
      continue;
    }
    if (part === 'f_auto') {
      params.set('format', 'webp');
      continue;
    }
    if (part === 'q_auto') {
      params.set('quality', '75');
      continue;
    }
    if (part.startsWith('w_')) {
      params.set('width', part.slice(2));
      continue;
    }
    if (part.startsWith('h_')) {
      params.set('height', part.slice(2));
      continue;
    }
    if (part.startsWith('q_')) {
      params.set('quality', part.slice(2));
      continue;
    }
    if (part.startsWith('f_')) {
      params.set('format', part.slice(2));
    }
  }

  const normalizedPath = publicId
    .split('/')
    .map((segment) => encodeURIComponent(segment))
    .join('/');

  const url = proxiedSupabaseMediaUrl(publicId);
  const query = params.toString();
  return query ? `${url}&${query}` : url;
}

// Common transform presets
export const TRANSFORMS = {
  // Auto format and quality
  AUTO: 'f_auto,q_auto',

  // Responsive sizes
  THUMB: 'f_auto,q_auto,c_fill,w_150,h_150',
  SMALL: 'f_auto,q_auto,c_fill,w_400,h_300',
  MEDIUM: 'f_auto,q_auto,c_fill,w_800,h_600',
  LARGE: 'f_auto,q_auto,c_fill,w_1200,h_800',

  // Aspect ratios
  SQUARE: 'f_auto,q_auto,c_fill,w_400,h_400',
  WIDE: 'f_auto,q_auto,c_fill,w_1200,h_630', // 1.91:1 for social
  PORTRAIT: 'f_auto,q_auto,c_fill,w_400,h_600', // 2:3 portrait

  // Special effects
  BLUR: 'f_auto,q_auto,e_blur:1000',
  GRAYSCALE: 'f_auto,q_auto,e_grayscale',

  // WebP optimization
  WEBP: 'f_webp,q_auto',
  AVIF: 'f_avif,q_auto',
} as const;

// Backward-compatible alias for older imports.
export const clUrl = supabaseMediaUrl;

async function getImageDimensions(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve) => {
    const image = new Image();
    const objectUrl = URL.createObjectURL(file);

    image.onload = () => {
      resolve({ width: image.width || 0, height: image.height || 0 });
      URL.revokeObjectURL(objectUrl);
    };

    image.onerror = () => {
      resolve({ width: 0, height: 0 });
      URL.revokeObjectURL(objectUrl);
    };

    image.src = objectUrl;
  });
}

async function getVideoMetadata(file: File): Promise<{ width: number; height: number; duration?: number }> {
  return new Promise((resolve) => {
    const video = document.createElement('video');
    const objectUrl = URL.createObjectURL(file);

    video.preload = 'metadata';
    video.onloadedmetadata = () => {
      resolve({
        width: video.videoWidth || 0,
        height: video.videoHeight || 0,
        duration: Number.isFinite(video.duration) ? video.duration : undefined,
      });
      URL.revokeObjectURL(objectUrl);
    };

    video.onerror = () => {
      resolve({ width: 0, height: 0 });
      URL.revokeObjectURL(objectUrl);
    };

    video.src = objectUrl;
  });
}

export async function uploadToSupabaseStorage(
  file: File,
  resourceType: 'image' | 'video' = 'image'
): Promise<SupabaseUploadResult> {
  const metadata =
    resourceType === 'video'
      ? await getVideoMetadata(file)
      : await getImageDimensions(file);

  const form = new FormData();
  form.append('file', file);
  form.append('resourceType', resourceType);

  const upRes = await fetch('/api/uploads/sign', {
    method: 'POST',
    body: form,
  });

  if (!upRes.ok) {
    const errorText = await upRes.text();
    throw new Error(`Media upload failed: ${errorText}`);
  }

  const payload: SupabaseUploadReceipt = await upRes.json();
  const format = file.type.split('/')[1] || file.name.split('.').pop() || 'bin';

  return {
    publicId: payload.publicId,
    url: normalizeMediaUrl(payload.url || proxiedSupabaseMediaUrl(payload.publicId)),
    width: metadata.width,
    height: metadata.height,
    format,
    bytes: file.size,
    duration: resourceType === 'video' ? (metadata as { duration?: number }).duration : undefined,
  };
}

// Backward-compatible alias for older imports.
export const uploadToCloudinary = uploadToSupabaseStorage;

// Helper function to create a photo record in the database
export async function savePhotoToDatabase(photoData: {
  publicId: string;
  url: string;
  width: number;
  height: number;
  format: string;
  bytes: number;
  caption?: string;
  postId?: string;
  uploaderId?: string;
}) {
  const res = await fetch('/api/photos', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(photoData),
  });

  if (!res.ok) {
    throw new Error('Failed to save photo to database');
  }

  return res.json();
}

// Helper function to create a video record in the database
export async function saveVideoToDatabase(videoData: {
  publicId: string;
  url: string;
  width: number;
  height: number;
  format: string;
  bytes: number;
  duration?: number;
  caption?: string;
  postId?: string;
  uploaderId?: string;
}) {
  const res = await fetch('/api/videos', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(videoData),
  });

  if (!res.ok) {
    throw new Error('Failed to save video to database');
  }

  return res.json();
}
