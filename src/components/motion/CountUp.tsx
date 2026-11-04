'use client';

import { useEffect, useRef } from 'react';
import { animate, useInView, useReducedMotion } from 'motion/react';
import { countUpDuration, formatCount } from './timing';

type CountUpProps = {
  value: number;
  className?: string;
};

/** Final value in the server HTML; after hydration it counts 0 to value on first view. */
export function CountUp({ value, className }: CountUpProps) {
  const reduced = useReducedMotion() ?? false;
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.5 });

  useEffect(() => {
    const el = ref.current;
    if (!el || reduced || value === 0) return;
    if (!inView) {
      el.textContent = '0';
      return;
    }
    const controls = animate(0, value, {
      duration: countUpDuration(reduced),
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => {
        el.textContent = formatCount(v);
      },
      onComplete: () => {
        el.textContent = formatCount(value);
      },
    });
    return () => {
      controls.stop();
      el.textContent = formatCount(value);
    };
  }, [inView, reduced, value]);

  return (
    <>
      <span
        ref={ref}
        aria-hidden="true"
        className={[className, 'tabular-nums'].filter(Boolean).join(' ')}
      >
        {value}
      </span>
      <span className="sr-only">{value}</span>
    </>
  );
}
