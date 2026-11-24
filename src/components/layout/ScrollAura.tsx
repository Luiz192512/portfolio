'use client';

import { m, useReducedMotion, useScroll, useSpring, useTransform } from 'motion/react';

/**
 * Blue aura that drifts down the viewport as the page scrolls. Only transform and opacity are
 * animated, so it stays on the compositor. Reduced motion keeps it still at the top.
 */
export function ScrollAura() {
  const reduced = useReducedMotion() ?? false;
  const { scrollYProgress } = useScroll();
  const smooth = useSpring(scrollYProgress, { stiffness: 80, damping: 24, mass: 0.6 });
  const y = useTransform(smooth, [0, 1], ['-18vh', '62vh']);
  const x = useTransform(smooth, [0, 0.5, 1], ['12vw', '-10vw', '10vw']);

  return <m.div aria-hidden="true" className="aura" style={reduced ? undefined : { x, y }} />;
}
