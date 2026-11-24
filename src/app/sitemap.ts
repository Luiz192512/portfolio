import type { MetadataRoute } from 'next';
import { getProjectSlugs } from '@/lib/content/load';
import { localePath, LOCALES } from '@/lib/i18n/locales';
import { siteUrl } from '@/lib/site';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteUrl();
  const slugs = await getProjectSlugs();
  const alternates = (path: string) => ({
    languages: { 'pt-BR': `${base}${localePath('pt', path)}`, en: `${base}${localePath('en', path)}` },
  });
  return LOCALES.flatMap((locale) => [
    { url: `${base}${localePath(locale)}`, changeFrequency: 'monthly' as const, priority: 1, alternates: alternates('/') },
    ...slugs.map((slug) => ({
      url: `${base}${localePath(locale, `/portfolio/${slug}`)}`,
      changeFrequency: 'monthly' as const,
      priority: 0.7,
      alternates: alternates(`/portfolio/${slug}`),
    })),
  ]);
}
