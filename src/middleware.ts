import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Get the pathname of the request
  const path = request.nextUrl.pathname;
  
  // Define public paths
  const publicPaths = ['/', '/login', '/register', '/auth/callback'];
  const isPublicPath = publicPaths.includes(path);
  
  // Get the token from cookies
  const token = request.cookies.get('auth_token')?.value || '';
  const isAuthenticated = !!token;
  
  // If the user is on a public path and authenticated
  if (isPublicPath && isAuthenticated) {
    // Don't redirect auth callback
    if (path === '/auth/callback') {
      return NextResponse.next();
    }
    return NextResponse.redirect(new URL('/home', request.url));
  }
  
  // If the user is on a protected path and not authenticated
  if (!isPublicPath && !isAuthenticated) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  
  return NextResponse.next();
}

// Configure which paths the middleware runs on
export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (e.g. robots.txt)
     * - images (public image files)
     * - logo directory (for app logos)
     * - uploads directory (for user uploaded files)
     */
    '/((?!_next/static|_next/image|favicon.ico|images/|public|logo/|uploads/).*)',
  ],
}; 