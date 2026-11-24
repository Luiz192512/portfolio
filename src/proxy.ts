import { NextResponse, type NextRequest } from 'next/server';

/** Portuguese is served at `/` through an internal rewrite to `/pt`; English lives at `/en`. */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (pathname === '/en' || pathname.startsWith('/en/')) return;
  const url = request.nextUrl.clone();
  if (pathname === '/pt' || pathname.startsWith('/pt/')) {
    url.pathname = pathname.slice(3) || '/';
    return NextResponse.redirect(url, 308);
  }
  url.pathname = `/pt${pathname === '/' ? '' : pathname}`;
  return NextResponse.rewrite(url);
}

export const config = {
  // Skip API routes, Next internals and any file with an extension (images, pdf, icons).
  matcher: ['/((?!api|_next|.*\\..*|robots.txt|sitemap.xml|icon.svg|opengraph-image).*)'],
};
