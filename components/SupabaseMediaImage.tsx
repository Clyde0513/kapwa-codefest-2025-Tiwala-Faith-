import Image from 'next/image';
import { supabaseMediaUrl, TRANSFORMS } from '../lib/supabase-media';

interface SupabaseMediaImageProps {
  publicId: string;
  alt: string;
  width?: number;
  height?: number;
  transforms?: string;
  className?: string;
  priority?: boolean;
  sizes?: string;
  fill?: boolean;
}

export default function SupabaseMediaImage({
  publicId,
  alt,
  width,
  height,
  transforms = TRANSFORMS.AUTO,
  className,
  priority = false,
  sizes,
  fill = false,
}: SupabaseMediaImageProps) {
  const src = supabaseMediaUrl(publicId, transforms);

  if (fill) {
    return (
      <Image
        src={src}
        alt={alt}
        fill
        className={className}
        priority={priority}
        sizes={sizes || '100vw'}
      />
    );
  }

  if (!width || !height) {
    throw new Error('SupabaseMediaImage requires width and height when fill is false');
  }

  return (
    <Image
      src={src}
      alt={alt}
      width={width}
      height={height}
      className={className}
      priority={priority}
      sizes={sizes}
    />
  );
}

// Convenience components for common use cases
export function PhotoThumbnail({ publicId, alt, className }: { publicId: string; alt: string; className?: string }) {
  return (
    <SupabaseMediaImage
      publicId={publicId}
      alt={alt}
      width={150}
      height={150}
      transforms={TRANSFORMS.THUMB}
      className={className}
    />
  );
}

export function PhotoCard({ publicId, alt, className }: { publicId: string; alt: string; className?: string }) {
  return (
    <SupabaseMediaImage
      publicId={publicId}
      alt={alt}
      width={400}
      height={300}
      transforms={TRANSFORMS.SMALL}
      className={className}
    />
  );
}

export function PhotoHero({ publicId, alt, className }: { publicId: string; alt: string; className?: string }) {
  return (
    <SupabaseMediaImage
      publicId={publicId}
      alt={alt}
      width={1200}
      height={630}
      transforms={TRANSFORMS.WIDE}
      className={className}
      priority
    />
  );
}

