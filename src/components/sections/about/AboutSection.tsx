import Image from 'next/image';
import { Reveal } from '@/components/motion/Reveal';
import { ButtonLink } from '@/components/ui/Button';
import { Eyebrow } from '@/components/ui/Eyebrow';
import { GlassPanel } from '@/components/ui/GlassPanel';
import { Icon } from '@/components/ui/Icon';
import { copy } from '@/lib/copy';
import type { ContentStats } from '@/lib/content/stats';
import type { Profile } from '@/lib/content/schemas';
import { AboutStats } from './AboutStats';

export function AboutSection({ profile, stats }: { profile: Profile; stats: ContentStats }) {
  const [first, second, third] = profile.nameLines;
  return (
    <section id="about" aria-labelledby="about-title" className="container-content section-pad">
      <div className="flex flex-col items-center gap-10 lg:flex-row lg:items-start lg:gap-16">
        <Reveal className="min-w-0 flex-1">
          <Eyebrow>{copy.about.eyebrow}</Eyebrow>
          <h2
            id="about-title"
            className="mt-3 text-[clamp(32px,10vw,80px)] font-extrabold leading-[0.95] tracking-[-0.04em]"
          >
            <span className="block">{first}</span>
            <span className="block">{second}</span>
            <span className="block text-text-subtle">{third}</span>
          </h2>
          <p className="mt-6 max-w-2xl text-base text-text-muted md:text-lg">{profile.bio}</p>

          {profile.motto ? (
            <GlassPanel radius="card" className="mt-6 flex max-w-2xl gap-3 p-5">
              <span className="text-accent">
                <Icon name="quote" size={22} />
              </span>
              <blockquote className="text-base text-text">{profile.motto}</blockquote>
            </GlassPanel>
          ) : null}

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <ButtonLink href={profile.cvPath} variant="primary" download>
              <Icon name="download" size={18} />
              {copy.about.download}
            </ButtonLink>
            <ButtonLink href="#portfolio" variant="outline">
              {copy.about.viewProjects}
            </ButtonLink>
          </div>
        </Reveal>

        <Reveal index={1} className="shrink-0">
          <Image
            src={profile.photo.src}
            alt={profile.photo.alt}
            width={480}
            height={480}
            sizes="(min-width: 1024px) 320px, 240px"
            className="h-60 w-60 rounded-full border border-line-strong object-cover lg:h-80 lg:w-80"
          />
        </Reveal>
      </div>

      <Reveal index={2}>
        <AboutStats stats={stats} />
      </Reveal>
    </section>
  );
}
