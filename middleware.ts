import { NextRequest, NextResponse } from 'next/server';
import { getAdminSessionFromRequest } from './lib/auth-middleware';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith('/admin')) {
    const isPublicAdminRoute = pathname === '/admin/login' || pathname === '/admin/help';

    if (!isPublicAdminRoute) {
      const session = await getAdminSessionFromRequest(request);

      if (!session) {
        const loginUrl = new URL('/admin/login', request.url);
        loginUrl.searchParams.set('redirect', pathname);
        return NextResponse.redirect(loginUrl);
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/admin/:path*',
  ],
};
