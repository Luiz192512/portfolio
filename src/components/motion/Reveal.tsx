'use client';

import type { ReactNode } from 'react';
import { m, useReducedMotion } from 'motion/react';
import { revealAnimate, revealInitial, revealTransition } from './timing';
import { REVEAL } from './tokens';

type RevealProps = {
  as?: 'div' | 'span' | 'p' | 'h2' | 'h3' | 'section' | 'article' | 'li' | 'ul';
  index?: number;
  className?: string;
  children?: ReactNode;
};

/** Scroll reveal, once, at 20% of the element in view. Opacity and transform only. */
export function Reveal({ as = 'div', index = 0, className, children }: RevealProps) {
  const reduced = useReducedMotion() ?? false;
  const Tag = m[as];
  return (
    <Tag
      className={className}
      // Reuses the noscript rule in layout.tsx so content is never stuck hidden without JS.
      data-entry="reveal"
      initial={revealInitial()}
      whileInView={revealAnimate()}
      viewport={{ once: true, amount: REVEAL.amount }}
      transition={revealTransition(index, reduced)}
    >
      {children}
    </Tag>
  );
}
