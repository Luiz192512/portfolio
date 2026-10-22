'use client';

import type { ReactNode } from 'react';
import { m, useReducedMotion } from 'motion/react';
import { entryAnimate, entryInitial, entryTransition } from './timing';
import type { EntryStep } from './tokens';

type EntryItemProps = {
  step: EntryStep;
  as?: 'div' | 'span' | 'p' | 'h1' | 'header' | 'ul';
  className?: string;
  children?: ReactNode;
};

/**
 * Entry animation with an absolute delay from mount (DESIGN.md D6).
 * Server HTML carries the initial inline style (opacity 0); the layout noscript rule reveals it
 * when JS is off. Only opacity and transform are animated.
 */
export function EntryItem({ step, as = 'div', className, children }: EntryItemProps) {
  const reduced = useReducedMotion() ?? false;
  const Tag = m[as];
  return (
    <Tag
      className={className}
      data-entry={step}
      initial={entryInitial(step, reduced)}
      animate={entryAnimate(step, reduced)}
      transition={entryTransition(step, reduced)}
    >
      {children}
    </Tag>
  );
}
