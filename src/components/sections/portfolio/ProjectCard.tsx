import Image from 'next/image';
import Link from 'next/link';
import { ViewTransition } from 'react';
import { copy } from '@/lib/copy';
import type { Project } from '@/lib/content/schemas';

export function linkStatusLabel(link: Project['link']): string {
  if (link.status === 'live') return new URL(link.url).hostname.replace(/^www\./, '');
  return link.status === 'private-tool' ? copy.portfolio.linkStatus.privateTool : copy.portfolio.linkStatus.none;
}

export function ProjectCard({ project }: { project: Project }) {
  const { slug, title, kind, summary, cover, link } = project;
  return (
    <article className="glass group relative flex w-full flex-col overflow-hidden rounded-card transition-[transform,border-color] duration-[180ms] ease-micro focus-within:-translate-y-1 focus-within:border-accent/45 hover:-translate-y-1 hover:border-accent/45">
      <ViewTransition name={`project-cover-${slug}`}>
        <div className="relative h-[150px] w-full overflow-hidden bg-white/[0.03] md:h-[220px]">
          <Image
            src={cover.src}
            alt={cover.alt}
            fill
            sizes="(min-width: 1024px) 380px, (min-width: 768px) 50vw, 100vw"
            className={cover.fit === 'contain' ? 'object-contain p-6' : 'object-cover'}
          />
        </div>
      </ViewTransition>
      <div className="flex flex-1 flex-col gap-3 p-5 md:p-6">
        <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-text-subtle">{kind}</p>
        <h3 className="text-[22px] leading-[1.15] font-bold tracking-[-0.02em]">{title}</h3>
        <p className="line-clamp-3 text-[15px] text-text-muted">{summary}</p>
        <div className="mt-auto flex items-center justify-between gap-3 pt-3">
          <span className="min-w-0 truncate font-mono text-xs text-text-muted">{linkStatusLabel(link)}</span>
          <Link
            href={`/portfolio/${slug}`}
            aria-label={`${copy.portfolio.details}: ${title}`}
            className="inline-flex min-h-11 shrink-0 items-center rounded-full border border-line-strong-hover px-5 text-[15px] font-bold transition-colors duration-[180ms] ease-micro after:absolute after:inset-0 hover:border-accent"
          >
            {copy.portfolio.details}
          </Link>
        </div>
      </div>
    </article>
  );
}
