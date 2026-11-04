import type { MetadataRoute } from 'next';
import { siteUrl } from '@/lib/site';

export default function robots(): MetadataRoute.Robots {
  const base = siteUrl();
  if (process.env.VERCEL_ENV === 'production') {
    return {
      rules: { userAgent: '*', allow: '/', disallow: '/api/' },
      sitemap: `${base}/sitemap.xml`,
    };
  }
  // Previews and local builds are never indexed.
  return { rules: { userAgent: '*', disallow: '/' } };
}
