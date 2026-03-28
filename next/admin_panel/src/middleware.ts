import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Middleware to protect dashboard routes
// Redirects unauthenticated users to login page
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Skip API routes, static files, images, favicon, and login page
  if (
    pathname.startsWith('/api') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon.ico') ||
    pathname === '/login'
  ) {
    return NextResponse.next()
  }

  // Check for auth session cookie
  // NextAuth sets a cookie called `__Secure-next-auth.session-token` in production
  // or `next-auth.session-token` in development
  const sessionCookie = request.cookies.get('__Secure-next-auth.session-token')?.value ||
    request.cookies.get('next-auth.session-token')?.value ||
    request.cookies.get('next-auth.session-token.json')?.value

  // If no session cookie and trying to access dashboard routes, redirect to login
  const isDashboardRoute =
    pathname === '/' ||
    pathname.startsWith('/dashboard') ||
    pathname.startsWith('/projects') ||
    pathname.startsWith('/builds')

  if (isDashboardRoute && !sessionCookie) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('callbackUrl', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // If already has session and trying to access login page, redirect to dashboard
  if (pathname === '/login' && sessionCookie) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
