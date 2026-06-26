import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';
import { getSupabaseAnon } from './supabase';



const CHURCH_ADMIN_EMAILS = (
  process.env.ADMIN_EMAIL_ALLOWLIST
    ? process.env.ADMIN_EMAIL_ALLOWLIST.split(',').map((email) => email.trim().toLowerCase())
    : []
).filter(Boolean);

const ACCESS_COOKIE = 'sb-access-token';
const REFRESH_COOKIE = 'sb-refresh-token';
const COOKIE_MAX_AGE_SECONDS = 7 * 24 * 60 * 60;

export interface AdminSession {
  email: string;
  name: string;
  isAdmin: boolean;
  expiresAt: Date;
  userId?: string;
}

function decodeJwtExpiry(token: string): Date {
  try {
    const payload = token.split('.')[1];
    const decoded = JSON.parse(Buffer.from(payload, 'base64url').toString('utf-8'));
    if (decoded?.exp) {
      return new Date(decoded.exp * 1000);
    }
  } catch {
    // Fallback handled below.
  }
  return new Date(Date.now() + COOKIE_MAX_AGE_SECONDS * 1000);
}

function getDisplayName(user: any): string {
  const metadataName =
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    user?.email?.split('@')?.[0] ||
    'Admin';

  if (typeof metadataName !== 'string' || metadataName.trim().length === 0) {
    return 'Admin';
  }

  return metadataName;
}

function createSessionFromUser(user: any, accessToken: string): AdminSession {
  return {
    email: (user.email || '').toLowerCase(),
    name: getDisplayName(user),
    isAdmin: true,
    expiresAt: decodeJwtExpiry(accessToken),
    userId: user.id,
  };
}

async function setSessionCookies(accessToken: string, refreshToken: string): Promise<void> {
  const cookieStore = await cookies();

  cookieStore.set(ACCESS_COOKIE, accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: COOKIE_MAX_AGE_SECONDS,
    path: '/',
  });

  cookieStore.set(REFRESH_COOKIE, refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: COOKIE_MAX_AGE_SECONDS,
    path: '/',
  });
}

export function isAuthorizedEmail(email: string): boolean {
  return CHURCH_ADMIN_EMAILS.includes(email.toLowerCase());
}

export async function loginAdmin(email: string, password: string): Promise<AdminSession> {
  const normalizedEmail = email.toLowerCase();

  if (!isAuthorizedEmail(normalizedEmail)) {
    throw new Error('Access denied. This email is not authorized for admin access.');
  }

  const supabase = getSupabaseAnon();
  const { data, error } = await supabase.auth.signInWithPassword({
    email: normalizedEmail,
    password,
  });

  if (error || !data.session || !data.user) {
    throw new Error('Invalid credentials');
  }

  if (!isAuthorizedEmail(data.user.email || '')) {
    await clearAdminSession();
    throw new Error('Access denied. This email is not authorized for admin access.');
  }

  await setSessionCookies(data.session.access_token, data.session.refresh_token);

  return createSessionFromUser(data.user, data.session.access_token);
}

export async function getAdminSession(): Promise<AdminSession | null> {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(ACCESS_COOKIE)?.value;
  const refreshToken = cookieStore.get(REFRESH_COOKIE)?.value;

  if (!accessToken && !refreshToken) {
    return null;
  }

  const supabase = getSupabaseAnon();
  let tokenToUse = accessToken;

  if (!tokenToUse && refreshToken) {
    const { data: refreshed, error: refreshError } = await supabase.auth.refreshSession({
      refresh_token: refreshToken,
    });

    if (refreshError || !refreshed.session || !refreshed.user) {
      return null;
    }

    tokenToUse = refreshed.session.access_token;
    await setSessionCookies(refreshed.session.access_token, refreshed.session.refresh_token);
  }

  if (!tokenToUse) {
    return null;
  }

  let { data: userResult, error } = await supabase.auth.getUser(tokenToUse);

  if ((error || !userResult.user) && refreshToken) {
    const { data: refreshed, error: refreshError } = await supabase.auth.refreshSession({
      refresh_token: refreshToken,
    });

    if (!refreshError && refreshed.session && refreshed.user) {
      tokenToUse = refreshed.session.access_token;
      await setSessionCookies(refreshed.session.access_token, refreshed.session.refresh_token);
      const retry = await supabase.auth.getUser(tokenToUse);
      userResult = retry.data;
      error = retry.error;
    }
  }

  if (error || !userResult.user || !isAuthorizedEmail(userResult.user.email || '')) {
    return null;
  }

  if (!tokenToUse) {
    return null;
  }

  return createSessionFromUser(userResult.user, tokenToUse);
}

export async function clearAdminSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(ACCESS_COOKIE);
  cookieStore.delete(REFRESH_COOKIE);
}

export async function requireAdminAuth(): Promise<AdminSession> {
  const session = await getAdminSession();

  if (!session || !session.isAdmin) {
    throw new Error('Unauthorized access to admin area');
  }

  return session;
}

export async function getAdminSessionFromRequest(req: NextRequest): Promise<AdminSession | null> {
  const accessToken = req.cookies.get(ACCESS_COOKIE)?.value;
  if (!accessToken) {
    return null;
  }

  const { data, error } = await getSupabaseAnon().auth.getUser(accessToken);
  if (error || !data.user || !isAuthorizedEmail(data.user.email || '')) {
    return null;
  }

  return createSessionFromUser(data.user, accessToken);
}
