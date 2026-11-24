'use client';

import { useRef, useState } from 'react';
import {
  m,
  useAnimationFrame,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  useVelocity,
  wrap,
} from 'motion/react';
import { useCopy } from '@/lib/i18n/client';

const BASE_SPEED = 3; // percent of one loop per second
const COPIES = 4;

/**
 * Tech ticker. Speed reacts to scroll velocity (and flips direction with it). WCAG 2.2.2: any
 * motion longer than 5 s needs a pause control, so a button stops it. With reduced motion the
 * strip starts paused and shows a static, wrapped list.
 */
export function TechMarquee({ items }: { items: readonly string[] }) {
  const copy = useCopy().marquee;
  const reduced = useReducedMotion() ?? false;
  const [userPaused, setUserPaused] = useState(false);
  const paused = reduced || userPaused;

  const x = useMotionValue(0);
  const direction = useRef(1);
  const { scrollY } = useScroll();
  const velocity = useSpring(useVelocity(scrollY), { stiffness: 120, damping: 40 });
  const boost = useTransform(velocity, [-2000, 0, 2000], [-6, 0, 6], { clamp: true });
  const transform = useTransform(x, (v) => `translate3d(${v}%, 0, 0)`);

  useAnimationFrame((_, delta) => {
    if (paused) return;
    const b = boost.get();
    if (b !== 0) direction.current = b < 0 ? -1 : 1;
    const step = BASE_SPEED * (1 + Math.abs(b)) * direction.current * (delta / 1000);
    x.set(wrap(-100 / COPIES, 0, x.get() - step));
  });

  const row = items.map((name) => (
    <li
      key={name}
      className="text-text-muted shrink-0 font-mono text-sm tracking-[0.12em] uppercase"
    >
      {name}
      <span aria-hidden="true" className="text-accent ml-8">
        /
      </span>
    </li>
  ));

  return (
    <section aria-label={copy.label} className="container-site py-6">
      <div className="glass flex items-center gap-3 rounded-full py-2 pr-2 pl-6">
        <div className="min-w-0 flex-1 overflow-hidden [mask-image:linear-gradient(to_right,transparent,#000_8%,#000_92%,transparent)]">
          {reduced ? (
            <ul className="flex flex-wrap gap-x-8 gap-y-2 py-1">{row}</ul>
          ) : (
            <m.div style={{ transform }} className="flex w-max will-change-transform">
              {Array.from({ length: COPIES }, (_, i) => (
                <ul
                  key={i}
                  aria-hidden={i > 0 ? 'true' : undefined}
                  className="flex shrink-0 gap-8 pr-8"
                >
                  {row}
                </ul>
              ))}
            </m.div>
          )}
        </div>
        {reduced ? null : (
          <button
            type="button"
            aria-pressed={userPaused}
            aria-label={userPaused ? copy.play : copy.pause}
            onClick={() => setUserPaused((v) => !v)}
            className="border-line-strong-hover text-text hover:border-accent inline-flex size-11 shrink-0 items-center justify-center rounded-full border font-mono text-xs transition-colors duration-[180ms]"
          >
            <span aria-hidden="true">{userPaused ? '▶' : '❚❚'}</span>
          </button>
        )}
      </div>
    </section>
  );
}
