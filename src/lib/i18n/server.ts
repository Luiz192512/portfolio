import 'server-only';
import { lang } from 'next/root-params';
import { copies } from '@/lib/copy';
import { DEFAULT_LOCALE, hasLocale, type Locale } from './locales';

export async function getLocale(): Promise<Locale> {
  const value = await lang();
  return value && hasLocale(value) ? value : DEFAULT_LOCALE;
}

export async function getCopy() {
  return copies[await getLocale()];
}
