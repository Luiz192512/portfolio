import 'server-only';
import { cache } from 'react';
import path from 'node:path';
import type { Locale } from '@/lib/i18n/locales';
import {
  DEFAULT_CONTENT_ROOT,
  readCertificates,
  readExperience,
  readProfile,
  readProject,
  readProjectSlugs,
  readProjects,
  readStack,
} from './reader';

export { ContentError } from './reader';

/** Portuguese lives in `content/`; translated files live in `content/en/` with the same names. */
const rootFor = (locale: Locale): string =>
  locale === 'en' ? path.join(DEFAULT_CONTENT_ROOT, 'en') : DEFAULT_CONTENT_ROOT;

export const getProfile = cache((locale: Locale = 'pt') => readProfile(rootFor(locale)));
export const getExperience = cache((locale: Locale = 'pt') => readExperience(rootFor(locale)));
// Tech names and certificates are shared by both languages.
export const getStack = cache(() => readStack());
export const getProjects = cache((locale: Locale = 'pt') => readProjects(rootFor(locale)));
export const getProject = cache((slug: string, locale: Locale = 'pt') => readProject(slug, rootFor(locale)));
export const getProjectSlugs = cache(() => readProjectSlugs());
export const getCertificates = cache(() => readCertificates());

/** For `generateStaticParams` in `/[lang]/portfolio/[slug]`. */
export async function generateProjectParams(): Promise<{ slug: string }[]> {
  return (await getProjectSlugs()).map((slug) => ({ slug }));
}
