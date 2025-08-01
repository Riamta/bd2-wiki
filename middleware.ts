import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Routes that require authentication
const protectedRoutes = ['/dashboard'];

// Routes that require admin role
const adminRoutes = ['/dashboard'];

// Routes that authenticated users should not access
const authRoutes = ['/login'];

interface JWTPayload {
  userId: string;
  username: string;
  role: 'admin' | 'user';
  iat: number;
  exp: number;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('auth-token')?.value;

  // Check if user is authenticated
  let user: JWTPayload | null = null;
  if (token) {
    try {
      user = jwt.verify(token, JWT_SECRET) as JWTPayload;
    } catch (error) {
      // Invalid token, treat as unauthenticated
      user = null;
    }
  }

  // Redirect authenticated users away from auth pages
  if (authRoutes.some(route => pathname.startsWith(route))) {
    if (user) {
      return NextResponse.redirect(new URL('/', request.url));
    }
    return NextResponse.next();
  }

  // Check if route requires authentication
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));
  
  if (isProtectedRoute) {
    if (!user) {
      // Redirect to login if not authenticated
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Check if route requires admin role
    const isAdminRoute = adminRoutes.some(route => pathname.startsWith(route));
    if (isAdminRoute && user.role !== 'admin') {
      // Redirect to home if not admin
      return NextResponse.redirect(new URL('/', request.url));
    }
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
     * - public folder
     */
    '/((?!api|_next/static|_next/image|favicon.ico|public).*)',
  ],
};
