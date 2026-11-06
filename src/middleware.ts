import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export const SESSION_COOKIE_NAME = 'k2d_session';

// Public admin paths that do not require an active session
const PUBLIC_ADMIN_PATHS = [
  '/admin/login',
  '/api/admin/auth/login',
  '/api/admin/login',
  '/api/admin/auth/me',
  '/api/admin/me',
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Check if the request targets an admin route
  const isAdminPage = pathname.startsWith('/admin');
  const isAdminApi = pathname.startsWith('/api/admin');

  if (isAdminPage || isAdminApi) {
    const isPublic = PUBLIC_ADMIN_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`));

    if (!isPublic) {
      const authHeader = request.headers.get('authorization');
      const bearerToken = authHeader?.startsWith('Bearer ') ? authHeader.slice(7).trim() : undefined;
      const sessionCookie =
        request.cookies.get(SESSION_COOKIE_NAME)?.value ||
        request.cookies.get('key2drive_admin_session')?.value ||
        bearerToken;

      // If session cookie is missing or invalid format
      if (!sessionCookie || sessionCookie.trim().length === 0) {
        if (isAdminApi) {
          return NextResponse.json(
            { success: false, error: 'Unauthorized. Valid administrative session required.' },
            { status: 401 }
          );
        }

        // For admin UI pages, redirect to login
        const loginUrl = new URL('/admin/login', request.url);
        loginUrl.searchParams.set('redirect', pathname);
        return NextResponse.redirect(loginUrl);
      }
    }
  }

  // 2. Add Security Headers to all responses
  const response = NextResponse.next();
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=(), payment=()'
  );

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};

