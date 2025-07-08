import { NextResponse } from 'next/server';
import { verifyToken } from '@/utils/auth';

// Protected routes that require authentication
const protectedRoutes = ['/dashboard', '/profile', '/settings', '/add-skill'];

export async function middleware(request) {
  const { pathname } = request.nextUrl;
  
  // Check if the current route is protected
  const isProtectedRoute = protectedRoutes.some(route => 
    pathname.startsWith(route)
  );
  
  if (isProtectedRoute) {
    const token = request.cookies.get('token')?.value;
    
    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    
    // Verify the token using existing utility
    const decoded = verifyToken(token);
    
    if (!decoded) {
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
    // Only match specific protected routes to avoid interference
    '/dashboard/:path*',
    '/profile/:path*', 
    '/settings/:path*',
    '/add-skill/:path*'
  ],
};
