import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ProjectDetail } from '@/components/project/ProjectDetail';
import { generateProjectParams, getProject } from '@/lib/content/load';
import { buildProjectMetadata } from '@/lib/seo/project-metadata';

export const dynamicParams = false;

type PageProps = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return generateProjectParams();
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const project = await getProject(slug);
  if (!project) return {};
  return buildProjectMetadata(project, slug);
}

export default async function ProjectPage({ params }: PageProps) {
  const { slug } = await params;
  const project = await getProject(slug);
  if (!project) notFound();
  return <ProjectDetail project={project} />;
}
