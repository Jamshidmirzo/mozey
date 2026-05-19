import createMiddleware from 'next-intl/middleware';
import { NextRequest, NextResponse } from 'next/server';
import { locales, defaultLocale } from './i18n/request';

const intlMiddleware = createMiddleware({
  locales,
  defaultLocale,
  localePrefix: 'always',
});

const publicPages = ['/login'];

export default function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if the page is public (login page)
  const pathnameWithoutLocale = pathname.replace(
    /^\/(ru|uz|en)/,
    ''
  );
  const isPublicPage = publicPages.some(
    (page) => pathnameWithoutLocale === page || pathnameWithoutLocale === ''
  );

  // Apply intl middleware first
  const response = intlMiddleware(request);

  // Check authentication for protected pages
  if (!isPublicPage) {
    const token = request.cookies.get('admin_token')?.value;
    if (!token) {
      const locale = pathname.match(/^\/(ru|uz|en)/)?.[1] || defaultLocale;
      const loginUrl = new URL(`/${locale}/login`, request.url);
      loginUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return response;
}

export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
};
