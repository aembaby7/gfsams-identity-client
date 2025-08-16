// src/middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import createIntlMiddleware from 'next-intl/middleware'

const locales = ['en', 'ar']
const defaultLocale = 'en'

// Create the internationalization middleware
const intlMiddleware = createIntlMiddleware({
  locales,
  defaultLocale,
  localePrefix: 'always'
})

export default function middleware(request: NextRequest) {
  // Handle internationalization
  const pathname = request.nextUrl.pathname
  
  // Check if it's an API route or static file
  if (
    pathname.startsWith('/api') ||
    pathname.startsWith('/_next') ||
    pathname.includes('.') // static files
  ) {
    return NextResponse.next()
  }
  
  // Apply internationalization middleware
  return intlMiddleware(request)
}

export const config = {
  matcher: [
    '/((?!_next|api|favicon.ico).*)',
    '/',
    '/(en|ar)/:path*'
  ]
}