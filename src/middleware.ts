import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // 1. Skip static assets, favicon, and auth API routes to prevent loops
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api/auth/login') ||
    pathname.includes('favicon.ico')
  ) {
    return NextResponse.next();
  }

  // 2. Retrieve session token from cookies
  const sessionToken = request.cookies.get('session_token')?.value;
  
  let isAuthenticated = false;
  
  if (sessionToken) {
    try {
      // Query the Express.js backend to verify the token
      const verifyRes = await fetch('http://localhost:5000/api/auth/verify', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${sessionToken}`,
          'Cookie': `session_token=${sessionToken}`
        },
        // Set a short cache-control to prevent Next.js from caching verification status
        cache: 'no-store'
      });
      
      if (verifyRes.ok) {
        const authData = await verifyRes.json();
        isAuthenticated = !!authData.authenticated;
      }
    } catch (error) {
      console.error('Middleware verification connection failed:', error);
      // Fail closed (unauthorized) if the backend cannot be reached
      isAuthenticated = false;
    }
  }

  // 3. If authenticated and accessing login, redirect to dashboard (/)
  if (pathname === '/login' && isAuthenticated) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // 4. If NOT authenticated and accessing protected routes, redirect to login (/login)
  if (pathname !== '/login' && !isAuthenticated) {
    const loginUrl = new URL('/login', request.url);
    if (pathname !== '/') {
      loginUrl.searchParams.set('from', pathname);
    }
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - api/auth/login (the login api handler)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api/auth/login|_next/static|_next/image|favicon.ico).*)',
  ],
};
