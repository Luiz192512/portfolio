import type { MetadataRoute } from 'next';
import { getProjectSlugs } from '@/lib/content/load';
import { siteUrl } from '@/lib/site';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteUrl();
  const slugs = await getProjectSlugs();
  return [
    { url: `${base}/`, changeFrequency: 'monthly', priority: 1 },
    ...slugs.map((slug) => ({
      url: `${base}/portfolio/${slug}`,
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    })),
  ];
}
