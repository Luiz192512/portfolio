import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ProjectDetail } from '@/components/project/ProjectDetail';
import { getProject, getProjectSlugs } from '@/lib/content/load';
import { hasLocale, LOCALES } from '@/lib/i18n/locales';
import { buildProjectMetadata } from '@/lib/seo/project-metadata';

export const dynamicParams = false;

type PageProps = { params: Promise<{ lang: string; slug: string }> };

export async function generateStaticParams() {
  const slugs = await getProjectSlugs();
  return LOCALES.flatMap((lang) => slugs.map((slug) => ({ lang, slug })));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { lang, slug } = await params;
  if (!hasLocale(lang)) return {};
  const project = await getProject(slug, lang);
  if (!project) return {};
  return buildProjectMetadata(project, slug, lang);
}

export default async function ProjectPage({ params }: PageProps) {
  const { lang, slug } = await params;
  if (!hasLocale(lang)) notFound();
  const project = await getProject(slug, lang);
  if (!project) notFound();
  return <ProjectDetail project={project} />;
}
