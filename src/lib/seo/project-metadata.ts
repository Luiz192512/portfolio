import type { Metadata } from 'next';
import type { Project } from '@/lib/content/schemas';
import { cutAtWord, siteUrl } from '@/lib/site';

/** Metadata for a project detail page. OG type is article; absolute URLs via siteUrl(). */
export function buildProjectMetadata(project: Project, slug: string): Metadata {
  const description = project.metaDescription ?? cutAtWord(project.summary);
  const origin = siteUrl();
  const imageUrl = new URL(project.cover.src, origin).toString();
  return {
    title: project.title,
    description,
    alternates: { canonical: `/portfolio/${slug}` },
    openGraph: {
      type: 'article',
      locale: 'pt_BR',
      title: project.title,
      description,
      url: `${origin}/portfolio/${slug}`,
      images: [{ url: imageUrl, alt: project.cover.alt }],
    },
  };
}
