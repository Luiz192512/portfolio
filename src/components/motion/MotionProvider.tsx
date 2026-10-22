'use client';

import type { ReactNode } from 'react';
import { LazyMotion, MotionConfig, domMax } from 'motion/react';

export function MotionProvider({ children }: { children: ReactNode }) {
  return (
    <LazyMotion features={domMax} strict>
      <MotionConfig reducedMotion="user">{children}</MotionConfig>
    </LazyMotion>
  );
}
