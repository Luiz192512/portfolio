'use client';

import { useEffect, useState } from 'react';
import { m, useReducedMotion } from 'motion/react';
import { TYPEWRITER_INITIAL, typewriterNext, type TypewriterState } from './timing';
import { TYPEWRITER } from './tokens';

type TypewriterProps = {
  phrases: string[];
};

const CURSOR = 'ml-1 inline-block h-[22px] w-[10px] translate-y-1 bg-accent';

/** SSR and reduced motion show the first phrase statically; otherwise types, holds, deletes, loops. */
export function Typewriter({ phrases }: TypewriterProps) {
  const reduced = useReducedMotion() ?? false;
  const first = phrases[0] ?? '';
  const [state, setState] = useState<TypewriterState | null>(null);

  useEffect(() => {
    if (reduced || phrases.length === 0) return;
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | undefined;
    let current = TYPEWRITER_INITIAL;
    const tick = () => {
      const next = typewriterNext(current, phrases);
      timer = setTimeout(() => {
        if (cancelled) return;
        current = next.state;
        setState(current);
        tick();
      }, next.wait);
    };
    timer = setTimeout(() => {
      setState(current);
      tick();
    }, TYPEWRITER.startDelayMs);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [reduced, phrases]);

  const text = reduced || !state ? first : (phrases[state.phrase] ?? '').slice(0, state.length);

  return (
    <p className="font-mono text-base text-accent md:text-xl">
      <span className="sr-only">{first}</span>
      <span aria-hidden="true">
        {'> '}
        {text}
        {reduced ? (
          <span className={CURSOR} />
        ) : (
          <m.span
            className={CURSOR}
            animate={{ opacity: [1, 1, 0, 0] }}
            transition={{ duration: 1, times: [0, 0.5, 0.5, 1], repeat: Infinity, ease: 'linear' }}
          />
        )}
      </span>
    </p>
  );
}
