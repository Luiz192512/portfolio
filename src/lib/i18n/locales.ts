export const LOCALES = ['pt', 'en'] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = 'pt';

export const hasLocale = (value: string): value is Locale => (LOCALES as readonly string[]).includes(value);

/** Public path for a locale: Portuguese lives at `/`, English at `/en`. */
export function localePath(locale: Locale, path = '/'): string {
  if (locale === DEFAULT_LOCALE) return path;
  return path === '/' ? '/en' : `/en${path}`;
}

/** Split a browser pathname into its locale and the locale-free path. */
export function stripLocale(pathname: string): { locale: Locale; path: string } {
  if (pathname === '/en' || pathname.startsWith('/en/')) {
    return { locale: 'en', path: pathname.slice(3) || '/' };
  }
  return { locale: 'pt', path: pathname };
}
