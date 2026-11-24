'use client';

import { usePathname } from 'next/navigation';
import { useCopy, useLocale } from '@/lib/i18n/client';
import { localePath, stripLocale } from '@/lib/i18n/locales';

/**
 * PT/EN switch. A plain anchor on purpose: the root layout changes with the locale, so the
 * browser does a full navigation to the other static page, keeping the section hash.
 */
export function LangToggle() {
  const copy = useCopy();
  const locale = useLocale();
  const { path } = stripLocale(usePathname());
  const target = locale === 'pt' ? 'en' : 'pt';
  const href = localePath(target, path);

  return (
    <a
      href={href}
      hrefLang={target === 'pt' ? 'pt-BR' : 'en'}
      lang={target === 'pt' ? 'pt-BR' : 'en'}
      aria-label={copy.lang.switchTo}
      title={copy.lang.label}
      onClick={(event) => {
        event.preventDefault();
        // Full navigation on purpose: the root layout changes with the locale.
        // eslint-disable-next-line @next/next/no-location-assign-relative-destination
        window.location.href = `${href}${window.location.hash}`;
      }}
      className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-full border border-line-strong-hover px-3 font-mono text-xs font-bold tracking-[0.08em] text-text-muted transition-colors duration-[180ms] hover:border-accent hover:text-text"
    >
      {copy.lang.short}
    </a>
  );
}
