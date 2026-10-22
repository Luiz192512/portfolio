'use client';

import { m, useReducedMotion } from 'motion/react';
import { Chip } from '@/components/ui/Chip';
import { entryAnimate, entryInitial, entryTransition } from '@/components/motion/timing';

const INNER_STAGGER = 0.04;

/** Stack chips: entry row "chips" with a 40 ms stagger between items (DESIGN.md). */
export function ChipList({ chips }: { chips: readonly string[] }) {
  const reduced = useReducedMotion() ?? false;
  const base = entryTransition('chips', reduced);
  return (
    <ul className="mt-6 flex flex-wrap gap-2" data-entry="chips">
      {chips.map((chip, i) => (
        <m.li
          key={chip}
          initial={entryInitial('chips', reduced)}
          animate={entryAnimate('chips', reduced)}
          transition={{ ...base, delay: reduced ? 0 : base.delay + i * INNER_STAGGER }}
        >
          <Chip>{chip}</Chip>
        </m.li>
      ))}
    </ul>
  );
}
