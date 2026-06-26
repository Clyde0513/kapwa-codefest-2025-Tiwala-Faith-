import { NextRequest } from 'next/server';


const CHURCH_ADMIN_EMAILS = (
  process.env.ADMIN_EMAIL_ALLOWLIST
    ? process.env.ADMIN_EMAIL_ALLOWLIST.split(',').map((email) => email.trim().toLowerCase())
    : []
).filter(Boolean);

const ACCESS_COOKIE = 'sb-access-token';

function isAuthorizedEmail(email: string): boolean {
  return CHURCH_ADMIN_EMAILS.includes(email.toLowerCase());
}

function decodeJwtPayload(token: string): Record<string, any> | null {
  try {
    const payload = token.split('.')[1];
    if (!payload) {
      return null;
    }
    return JSON.parse(Buffer.from(payload, 'base64url').toString('utf-8'));
  } catch {
    return null;
  }
}

export async function getAdminSessionFromRequest(req: NextRequest): Promise<{ email: string } | null> {
  const accessToken = req.cookies.get(ACCESS_COOKIE)?.value;
  if (!accessToken) {
    return null;
  }

  const payload = decodeJwtPayload(accessToken);
  if (!payload) {
    return null;
  }

  const email = String(payload.email || '').toLowerCase();
  if (!email || !isAuthorizedEmail(email)) {
    return null;
  }

  const exp = Number(payload.exp || 0);
  if (!exp || Date.now() >= exp * 1000) {
    return null;
  }

  return { email };
}
