import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Define paths that are public (accessible without login)
  // - /login: The login page
  // - /create_pharmacy: The registration flow
  // - /_next: Next.js system files
  // - /images, /libs, /js, /css: Static assets
  // - /favicon.ico: Favicon
  const isPublicPath =
    pathname === '/login' ||
    pathname.startsWith('/create_pharmacy') ||
    pathname.startsWith('/forgot-password') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/images') ||
    pathname.startsWith('/libs') ||
    pathname.startsWith('/js') ||
    pathname.startsWith('/css') ||
    pathname === '/favicon.ico' ||
    pathname.match(/\.(png|jpg|jpeg|svg|ico|webp|gif)$/) !== null;

  const token = request.cookies.get('accessToken')?.value;

  // If path is protected and no token, redirect to login
  if (!isPublicPath && !token) {
    const loginUrl = new URL('/login', request.url);
    // Optional: Add redirect param to return after login
    // loginUrl.searchParams.set('from', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // If path is login or register and user has token, redirect to dashboard (/)
  if ((pathname === '/login' || pathname === '/create_pharmacy') && token) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
