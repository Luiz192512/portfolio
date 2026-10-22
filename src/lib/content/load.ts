import 'server-only';
import { cache } from 'react';
import {
  readCertificates,
  readExperience,
  readProfile,
  readProject,
  readProjectSlugs,
  readProjects,
  readStack,
} from './reader';

export { ContentError } from './reader';

export const getProfile = cache(() => readProfile());
export const getExperience = cache(() => readExperience());
export const getStack = cache(() => readStack());
export const getProjects = cache(() => readProjects());
export const getProject = cache((slug: string) => readProject(slug));
export const getProjectSlugs = cache(() => readProjectSlugs());
export const getCertificates = cache(() => readCertificates());

/** For `generateStaticParams` in `/portfolio/[slug]`. */
export async function generateProjectParams(): Promise<{ slug: string }[]> {
  return (await getProjectSlugs()).map((slug) => ({ slug }));
}
