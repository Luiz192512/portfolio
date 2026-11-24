'use client';

import { createContext, useContext, type ReactNode } from 'react';
import { copies } from '@/lib/copy';
import { DEFAULT_LOCALE, type Locale } from './locales';

const LocaleContext = createContext<Locale>(DEFAULT_LOCALE);

export function LocaleProvider({ locale, children }: { locale: Locale; children: ReactNode }) {
  return <LocaleContext.Provider value={locale}>{children}</LocaleContext.Provider>;
}

export const useLocale = (): Locale => useContext(LocaleContext);
export const useCopy = () => copies[useLocale()];
