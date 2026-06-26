// @ts-ignore
import { createClient } from '@supabase/supabase-js';

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  process.env.SUPABASE_URL ||
  '';

const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.SUPABASE_ANON_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  process.env.SUPABASE_PUBLISHABLE_KEY ||
  '';

const supabaseServiceRoleKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.SUPABASE_SERVICE_KEY ||
  '';

function assertEnv(name: string, value: string): void {
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
}

let adminClient: any = null;
let anonClient: any = null;

export function getSupabaseAdmin(): any {
  assertEnv('NEXT_PUBLIC_SUPABASE_URL or SUPABASE_URL', supabaseUrl);
  assertEnv('SUPABASE_SERVICE_ROLE_KEY or SUPABASE_SERVICE_KEY', supabaseServiceRoleKey);

  if (!adminClient) {
    adminClient = createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    }) as any;
  }

  return adminClient;
}

export function getSupabaseAnon(): any {
  assertEnv('NEXT_PUBLIC_SUPABASE_URL or SUPABASE_URL', supabaseUrl);
  assertEnv(
    'NEXT_PUBLIC_SUPABASE_ANON_KEY or SUPABASE_ANON_KEY or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY',
    supabaseAnonKey
  );

  if (!anonClient) {
    anonClient = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    }) as any;
  }

  return anonClient;
}

export const SUPABASE_URL = supabaseUrl;
export const SUPABASE_MEDIA_BUCKET =
  process.env.NEXT_PUBLIC_SUPABASE_MEDIA_BUCKET ||
  process.env.SUPABASE_MEDIA_BUCKET ||
  'media';
