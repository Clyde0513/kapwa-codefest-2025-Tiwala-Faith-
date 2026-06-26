import { getSupabaseAdmin } from './supabase';

type RateLimitResult = {
  allowed: boolean;
  remaining: number;
  resetAt: number;
  source: 'supabase' | 'memory';
};

type RateLimitOptions = {
  key: string;
  action: string;
  limit: number;
  windowMs: number;
};

const memoryStore = new Map<string, { count: number; resetAt: number }>();

function checkWithMemoryFallback(options: RateLimitOptions): RateLimitResult {
  const now = Date.now();
  const bucketStart = now - (now % options.windowMs);
  const bucketKey = `${options.action}:${options.key}:${bucketStart}`;
  const resetAt = bucketStart + options.windowMs;

  const existing = memoryStore.get(bucketKey);
  if (!existing) {
    memoryStore.set(bucketKey, { count: 1, resetAt });
    return {
      allowed: true,
      remaining: Math.max(options.limit - 1, 0),
      resetAt,
      source: 'memory',
    };
  }

  if (existing.count >= options.limit) {
    return {
      allowed: false,
      remaining: 0,
      resetAt: existing.resetAt,
      source: 'memory',
    };
  }

  existing.count += 1;
  return {
    allowed: true,
    remaining: Math.max(options.limit - existing.count, 0),
    resetAt: existing.resetAt,
    source: 'memory',
  };
}

function isMissingTableError(error: any): boolean {
  const message = String(error?.message || '').toLowerCase();
  return message.includes('ratelimit') && message.includes('does not exist');
}

export async function checkRateLimit(options: RateLimitOptions): Promise<RateLimitResult> {
  const now = Date.now();
  const bucketStart = now - (now % options.windowMs);
  const resetAt = bucketStart + options.windowMs;
  const windowStartIso = new Date(bucketStart).toISOString();
  const resetAtIso = new Date(resetAt).toISOString();

  try {
    const supabase = getSupabaseAdmin();

    const { data: existing, error: lookupError } = await supabase
      .from('RateLimit')
      .select('id, count')
      .eq('key', options.key)
      .eq('action', options.action)
      .eq('windowStart', windowStartIso)
      .maybeSingle();

    if (lookupError) {
      throw lookupError;
    }

    if (!existing) {
      const { error: insertError } = await supabase.from('RateLimit').insert({
        key: options.key,
        action: options.action,
        windowStart: windowStartIso,
        resetTime: resetAtIso,
        count: 1,
      });

      if (insertError) {
        throw insertError;
      }

      return {
        allowed: true,
        remaining: Math.max(options.limit - 1, 0),
        resetAt,
        source: 'supabase',
      };
    }

    if (existing.count >= options.limit) {
      return {
        allowed: false,
        remaining: 0,
        resetAt,
        source: 'supabase',
      };
    }

    const nextCount = existing.count + 1;
    const { error: updateError } = await supabase
      .from('RateLimit')
      .update({ count: nextCount, resetTime: resetAtIso })
      .eq('id', existing.id);

    if (updateError) {
      throw updateError;
    }

    return {
      allowed: true,
      remaining: Math.max(options.limit - nextCount, 0),
      resetAt,
      source: 'supabase',
    };
  } catch (error) {
    if (!isMissingTableError(error)) {
      console.warn('Supabase rate limit check failed, using memory fallback:', error);
    }
    return checkWithMemoryFallback(options);
  }
}
