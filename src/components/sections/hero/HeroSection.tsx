import { EntryItem } from '@/components/motion/EntryItem';
import { Typewriter } from '@/components/motion/Typewriter';
import { LanyardSlot } from '@/components/three/LanyardSlot';
import { StaticLanyard } from '@/components/three/StaticLanyard';
import { Icon } from '@/components/ui/Icon';
import { MonoHint } from '@/components/ui/MonoHint';
import { copy } from '@/lib/copy';
import { ChipList } from './ChipList';
import type { Profile } from '@/lib/content/schemas';

export function HeroSection({ profile }: { profile: Profile }) {
  return (
    <section
      id="home"
      aria-labelledby="home-title"
      className="container-site flex min-h-svh flex-col justify-center pb-16 pt-24 lg:pt-[calc(var(--navbar-offset,72px)+16px)]"
    >
      <div className="flex flex-col items-center gap-8 lg:flex-row lg:items-center">
        <div className="order-2 w-full min-w-0 flex-1 lg:order-1">
          {profile.available ? (
            <EntryItem step="badge" className="mb-6">
              <span className="glass inline-flex items-center gap-2 rounded-full px-4 py-2 font-mono text-xs tracking-[0.14em] text-text">
                <span className="text-accent">
                  <Icon name="star" size={14} />
                </span>
                {copy.hero.badge}
              </span>
            </EntryItem>
          ) : null}

          <EntryItem step="h1" as="h1">
            <span
              id="home-title"
              className="block whitespace-nowrap text-[clamp(24px,7.6vw,68px)] lg:text-[clamp(52px,5.4vw,68px)] font-extrabold leading-[0.92] tracking-[-0.045em]"
            >
              {copy.hero.line1}
            </span>
            <span className="block whitespace-nowrap bg-gradient-to-b from-hero-gradient-top to-hero-gradient-bottom bg-clip-text text-[clamp(40px,11.6vw,104px)] lg:text-[clamp(70px,8.4vw,104px)] font-extrabold leading-[0.92] tracking-[-0.045em] text-transparent">
              {copy.hero.line2}
            </span>
          </EntryItem>

          <EntryItem step="typewriter" className="mt-6">
            <Typewriter phrases={profile.typewriterPhrases} />
          </EntryItem>

          <p
            data-entry="paragraph"
            className="entry-paragraph mt-4 max-w-xl text-base text-text-muted md:text-lg"
          >
            {profile.heroIntro}
          </p>

          <ChipList chips={profile.heroChips} />

          {profile.hints.length > 0 ? (
            <EntryItem step="hints" className="mt-6 grid gap-1">
              {profile.hints.map((hint) => (
                <MonoHint key={hint}>{hint}</MonoHint>
              ))}
            </EntryItem>
          ) : null}
        </div>

        <div className="order-1 w-full lg:order-2 lg:w-auto">
          <LanyardSlot>
            <StaticLanyard profile={profile} />
          </LanyardSlot>
        </div>
      </div>

      <style>{`@keyframes hero-scroll-bob{0%,100%{transform:translateY(0)}50%{transform:translateY(6px)}}@media (prefers-reduced-motion:no-preference){.hero-scroll-arrow{animation:hero-scroll-bob 1.6s ease-in-out infinite}}`}</style>
      <EntryItem step="scroll" className="mt-10 flex justify-center">
        <a
          href="#about"
          className="inline-flex min-h-11 items-center gap-2 px-4 font-mono text-[11px] tracking-[0.3em] text-text-muted hover:text-text"
        >
          {copy.hero.scroll}
          <span className="hero-scroll-arrow inline-flex">
            <Icon name="arrow-down" size={16} />
          </span>
        </a>
      </EntryItem>
    </section>
  );
}
