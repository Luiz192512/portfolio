import type { Metadata } from 'next';
import type { Project } from '@/lib/content/schemas';
import { localePath, type Locale } from '@/lib/i18n/locales';
import { cutAtWord, siteUrl } from '@/lib/site';

/** Metadata for a project detail page. OG type is article; absolute URLs via siteUrl(). */
export function buildProjectMetadata(project: Project, slug: string, locale: Locale = 'pt'): Metadata {
  const description = project.metaDescription ?? cutAtWord(project.summary);
  const origin = siteUrl();
  const imageUrl = new URL(project.cover.src, origin).toString();
  const own = localePath(locale, `/portfolio/${slug}`);
  return {
    title: project.title,
    description,
    alternates: {
      canonical: own,
      languages: { 'pt-BR': localePath('pt', `/portfolio/${slug}`), en: localePath('en', `/portfolio/${slug}`) },
    },
    openGraph: {
      type: 'article',
      locale: locale === 'en' ? 'en_US' : 'pt_BR',
      title: project.title,
      description,
      url: `${origin}${own}`,
      images: [{ url: imageUrl, alt: project.cover.alt }],
    },
  };
}
