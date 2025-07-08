import { NextResponse } from 'next/server';
import { verifyToken } from '@/utils/auth';

// Protected routes that require authentication
const protectedRoutes = ['/dashboard', '/profile', '/settings'];

export async function middleware(request) {
  const { pathname } = request.nextUrl;
  
  // Check if the current route is protected
  const isProtectedRoute = protectedRoutes.some(route => 
    pathname.startsWith(route)
  );
  
  if (isProtectedRoute) {
    const token = request.cookies.get('token')?.value;
    
    if (!token) {
      // Redirect to login if no token
      return NextResponse.redirect(new URL('/login', request.url));
    }
    
    // Verify the token using existing utility
    const decoded = verifyToken(token);
    
    if (!decoded) {
      // Token is invalid, redirect to login
      return NextResponse.redirect(new URL('/login', request.url));
    }
    
    // Token is valid, continue
    return NextResponse.next();
  }
  
  // Allow access to non-protected routes
  return NextResponse.next();
}

export const config = {
  matcher: [
    // Match all request paths except for the ones starting with:
    // - api (API routes)
    // - _next/static (static files)
    // - _next/image (image optimization files)
    // - favicon.ico (favicon file)
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
