import Image from 'next/image';
import { copy } from '@/lib/copy';
import type { Profile } from '@/lib/content/schemas';

const STRAP_REPEAT = 8;

/** Static lanyard card in HTML and CSS (Server Component). Sizes follow architecture 4.1. */
export function StaticLanyard({ profile }: { profile: Profile }) {
  return (
    <div className="flex h-full flex-col items-center">
      <div
        aria-hidden="true"
        className="flex h-10 w-[22px] shrink-0 items-center justify-center overflow-hidden bg-accent lg:h-16 lg:w-[30px]"
      >
        <span className="-rotate-90 whitespace-nowrap font-mono text-[11px] leading-none text-on-accent">
          {Array.from({ length: STRAP_REPEAT }, () => copy.hero.strap).join('  ')}
        </span>
      </div>
      <div aria-hidden="true" className="-mt-px h-3 w-5 rounded-b-md bg-gradient-to-b from-[#9a9a9a] to-[#5c5c5c]" />
      <div className="relative flex h-[274px] w-[196px] flex-col gap-2 rounded-lanyard border border-line-glass bg-surface-lanyard p-3 shadow-[0_24px_48px_-24px_rgba(0,0,0,0.6)] md:h-[336px] md:w-[240px] lg:h-[420px] lg:w-[300px] lg:p-4">
        <span aria-hidden="true" className="mx-auto h-1.5 w-12 shrink-0 rounded-full bg-black/60" />
        <div className="relative min-h-0 flex-1 overflow-hidden rounded-2xl">
          <Image
            src="/lanyard/card-photo-512.webp"
            alt=""
            fill
            loading="eager"
            sizes="(min-width: 1024px) 268px, (min-width: 768px) 208px, 164px"
            className="object-cover"
          />
        </div>
        <div className="shrink-0">
          <p className="text-base font-bold leading-tight tracking-[-0.02em] md:text-lg">{profile.shortName}</p>
          <p className="mt-0.5 font-mono text-[10px] tracking-[0.1em] text-text-muted md:text-xs">{profile.roleShort}</p>
        </div>
        <div className="flex shrink-0 items-center justify-between font-mono text-[10px] tracking-[0.1em] text-text-subtle">
          <span>{profile.location.toUpperCase()}</span>
          <span className="text-accent">{copy.hero.card3d}</span>
        </div>
      </div>
    </div>
  );
}
