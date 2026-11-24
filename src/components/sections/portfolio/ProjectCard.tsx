import Image from 'next/image';
import Link from 'next/link';
import { ViewTransition } from 'react';
import { copies } from '@/lib/copy';
import { CursorPreview } from './CursorPreview';
import { getLocale } from '@/lib/i18n/server';
import { localePath } from '@/lib/i18n/locales';
import type { Project } from '@/lib/content/schemas';

export function linkStatusLabel(link: Project['link'], copy: (typeof copies)['pt']): string {
  if (link.status === 'live') return new URL(link.url).hostname.replace(/^www\./, '');
  return link.status === 'private-tool'
    ? copy.portfolio.linkStatus.privateTool
    : copy.portfolio.linkStatus.none;
}

export async function ProjectCard({ project }: { project: Project }) {
  const locale = await getLocale();
  const copy = copies[locale];
  const { slug, title, kind, summary, cover, link } = project;
  return (
    <CursorPreview preview={<ProjectPreview project={project} />}>
      <article className="glass group rounded-card ease-micro focus-within:border-accent/45 hover:border-accent/45 relative flex w-full flex-col overflow-hidden transition-[transform,border-color] duration-[180ms] focus-within:-translate-y-1 hover:-translate-y-1">
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
          <p className="text-text-subtle font-mono text-[11px] tracking-[0.12em] uppercase">
            {kind}
          </p>
          <h3 className="text-[22px] leading-[1.15] font-bold tracking-[-0.02em]">{title}</h3>
          <p className="text-text-muted line-clamp-3 text-[15px]">{summary}</p>
          <div className="mt-auto flex items-center justify-between gap-3 pt-3">
            <span className="text-text-muted min-w-0 truncate font-mono text-xs">
              {linkStatusLabel(link, copy)}
            </span>
            <Link
              href={localePath(locale, `/portfolio/${slug}`)}
              aria-label={`${copy.portfolio.details}: ${title}`}
              className="border-line-strong-hover ease-micro hover:border-accent inline-flex min-h-11 shrink-0 items-center rounded-full border px-5 text-[15px] font-bold transition-colors duration-[180ms] after:absolute after:inset-0"
            >
              {copy.portfolio.details}
            </Link>
          </div>
        </div>
      </article>
    </CursorPreview>
  );
}

/** Content of the cursor-following preview: bigger cover, tech and the first features. */
function ProjectPreview({ project }: { project: Project }) {
  const { cover, tech, features } = project;
  return (
    <>
      <div className="relative h-[140px] w-full bg-white/[0.03]">
        <Image
          src={cover.src}
          alt=""
          fill
          sizes="300px"
          className={cover.fit === 'contain' ? 'object-contain p-4' : 'object-cover'}
        />
      </div>
      <div className="grid gap-2 p-4">
        <p className="text-accent font-mono text-[11px] tracking-[0.08em] uppercase">
          {tech.slice(0, 4).join(' · ')}
        </p>
        <ul className="text-text-muted grid gap-1 text-[13px]">
          {features.slice(0, 2).map((f) => (
            <li key={f} className="line-clamp-2">
              {f}
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}
