import Link from 'next/link';
import { ButtonLink } from '@/components/ui/Button';
import { Chip } from '@/components/ui/Chip';
import { Eyebrow } from '@/components/ui/Eyebrow';
import { GlassPanel } from '@/components/ui/GlassPanel';
import { MonoHint } from '@/components/ui/MonoHint';
import { UnavailableAction } from '@/components/ui/UnavailableAction';
import { copy } from '@/lib/copy';
import type { Project } from '@/lib/content/schemas';
import { hasDemoDataNote, isClientWork, projectNotes } from './notes';
import { ProjectCover } from './ProjectCover';

function StatTile({ value, caption, shortCaption }: { value: number; caption: string; shortCaption: string }) {
  return (
    <GlassPanel radius="card" className="flex flex-col gap-1 p-5 md:p-7">
      <p className="text-[34px] leading-none font-extrabold tracking-[-0.03em] md:text-[56px]">{value}</p>
      <p className="mt-2 font-mono text-[10px] tracking-[0.12em] text-text-muted uppercase md:text-xs">
        <span className="max-sm:hidden">{caption}</span>
        <span className="sm:hidden">{shortCaption}</span>
      </p>
    </GlassPanel>
  );
}

export function ProjectDetail({ project }: { project: Project }) {
  const { slug, title, kind, summary, cover, tech, features, link, repoUrl } = project;
  const t = copy.project;
  const client = isClientWork(project);
  const demoData = hasDemoDataNote(project);
  return (
    <article className="container-content pt-28 pb-[var(--section-pad)] md:pt-36">
      <Link
        href="/#portfolio"
        className="inline-flex min-h-11 items-center gap-2 font-mono text-sm text-text-muted transition-colors duration-[180ms] ease-micro hover:text-accent"
      >
        <span aria-hidden="true">&larr;</span>
        {t.back}
      </Link>

      <header className="mt-6">
        <Eyebrow>{kind}</Eyebrow>
        <h1 className="mt-3 text-[40px] leading-none font-extrabold tracking-[-0.04em] md:text-[80px]">{title}</h1>
        <p className="mt-5 max-w-3xl text-base text-text-muted md:text-lg">{summary}</p>
        {client || demoData ? (
          <div className="mt-4 grid gap-1">
            {client ? <MonoHint>{projectNotes.client}</MonoHint> : null}
            {demoData ? <MonoHint>{projectNotes.demoData}</MonoHint> : null}
          </div>
        ) : null}
      </header>

      <div className="mt-8 grid max-w-md grid-cols-2 gap-4">
        <StatTile value={tech.length} caption={t.techCaption} shortCaption={t.techCaptionShort} />
        <StatTile value={features.length} caption={t.featuresCaption} shortCaption={t.featuresCaption} />
      </div>

      <div className="mt-8 flex flex-wrap gap-3">
        {link.status === 'live' ? (
          <ButtonLink href={link.url} variant="primary">
            {t.demo}
          </ButtonLink>
        ) : (
          <UnavailableAction>{t.noDemo}</UnavailableAction>
        )}
        {repoUrl ? (
          <ButtonLink href={repoUrl} variant="outline">
            {t.repo}
          </ButtonLink>
        ) : (
          <UnavailableAction>{t.privateRepo}</UnavailableAction>
        )}
      </div>

      <section aria-labelledby="tech-title" className="mt-10">
        <Eyebrow>
          <span id="tech-title">{t.techCaption}</span>
        </Eyebrow>
        <ul className="mt-4 flex flex-wrap gap-2">
          {tech.map((name) => (
            <li key={name}>
              <Chip>{name}</Chip>
            </li>
          ))}
        </ul>
      </section>

      <div className="mt-10">
        <ProjectCover slug={slug} cover={cover} />
      </div>

      <GlassPanel as="section" radius="panel" aria-labelledby="features-title" className="mt-10 p-6 md:p-10">
        <h2 id="features-title" className="text-[28px] leading-tight font-bold tracking-[-0.02em] md:text-[36px]">
          {t.featuresTitle}
        </h2>
        <ul className="mt-6 grid gap-3">
          {features.map((feature) => (
            <li key={feature} className="flex gap-3 text-[15px] md:text-base">
              <span aria-hidden="true" className="mt-2.5 size-1.5 shrink-0 rounded-full bg-accent" />
              {feature}
            </li>
          ))}
        </ul>
      </GlassPanel>
    </article>
  );
}
