// src/middleware.ts
import { NextRequest, NextResponse } from 'next/server';
import createIntlMiddleware from 'next-intl/middleware';
import { getToken } from 'next-auth/jwt';
import { locales, defaultLocale } from './i18n/config';

// Create the internationalization middleware
const intlMiddleware = createIntlMiddleware({
  locales,
  defaultLocale,
  localePrefix: 'always'
});

// Define protected routes that require authentication
const protectedPaths = [
  '/dashboard',
  '/admin',
  '/profile',
  '/settings',
  // Add more protected routes as needed
];

// Define public routes that should always be accessible
const publicPaths = [
  '/auth/signin',
  '/auth/signup',
  '/auth/forgot-password',
  '/auth/reset-password',
  '/auth/error',
];

export default async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  
  // Check if the path is for API routes or static files
  if (
    pathname.startsWith('/api') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/_vercel') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  // First, handle internationalization
  const response = intlMiddleware(request);
  
  // Extract the locale from the pathname
  const pathnameHasLocale = locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );
  
  // Get the pathname without locale for checking protected routes
  let pathWithoutLocale = pathname;
  if (pathnameHasLocale) {
    const segments = pathname.split('/');
    segments.splice(1, 1); // Remove the locale segment
    pathWithoutLocale = segments.join('/') || '/';
  }

  // Check if the current path requires authentication
  const isProtectedPath = protectedPaths.some(path => 
    pathWithoutLocale.startsWith(path)
  );
  
  const isPublicPath = publicPaths.some(path => 
    pathWithoutLocale.startsWith(path)
  );

  // If the route requires authentication, check for valid session
  if (isProtectedPath && !isPublicPath) {
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    });

    if (!token) {
      // User is not authenticated, redirect to sign-in page
      const locale = pathnameHasLocale 
        ? pathname.split('/')[1] 
        : defaultLocale;
      
      const signInUrl = new URL(`/${locale}/auth/signin`, request.url);
      signInUrl.searchParams.set('callbackUrl', pathname);
      
      return NextResponse.redirect(signInUrl);
    }

    // Optional: Check if token is expired and needs refresh
    if (token.error === "RefreshAccessTokenError") {
      // Force sign in again if refresh token is invalid
      const locale = pathnameHasLocale 
        ? pathname.split('/')[1] 
        : defaultLocale;
      
      const signInUrl = new URL(`/${locale}/auth/signin`, request.url);
      signInUrl.searchParams.set('callbackUrl', pathname);
      
      return NextResponse.redirect(signInUrl);
    }
  }

  return response;
}

export const config = {
  // Match internationalized pathnames and exclude API routes, static files
  matcher: [
    '/',
    '/(ar|en)/:path*',
    '/((?!api|_next|_vercel|.*\\..*).*)' 
  ]
};