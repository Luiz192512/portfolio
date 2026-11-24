'use client';

import { useSyncExternalStore, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { animate, m, useMotionValue, useSpring } from 'motion/react';

const OFFSET = 20;
const WIDTH = 300;
const HEIGHT = 260;
const FINE_HOVER = '(hover: hover) and (pointer: fine)';

const noopSubscribe = () => () => {};

/**
 * Floating preview that follows the cursor over a card. Position and opacity live in motion
 * values, so moving the mouse never re-renders React. Touch devices and reduced motion skip it.
 */
export function CursorPreview({ children, preview }: { children: ReactNode; preview: ReactNode }) {
  const mounted = useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false,
  );
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const opacity = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 400, damping: 40, mass: 0.4 });
  const sy = useSpring(y, { stiffness: 400, damping: 40, mass: 0.4 });

  const enabled = () =>
    window.matchMedia(FINE_HOVER).matches &&
    !window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const place = (clientX: number, clientY: number) => {
    const left =
      clientX + OFFSET + WIDTH > window.innerWidth ? clientX - OFFSET - WIDTH : clientX + OFFSET;
    const top = Math.min(clientY + OFFSET, window.innerHeight - HEIGHT - 8);
    x.set(left);
    y.set(Math.max(8, top));
  };

  return (
    <div
      className="contents"
      onPointerEnter={(e) => {
        if (!enabled()) return;
        place(e.clientX, e.clientY);
        sx.jump(x.get());
        sy.jump(y.get());
        animate(opacity, 1, { duration: 0.18 });
      }}
      onPointerMove={(e) => {
        if (opacity.get() > 0 || enabled()) place(e.clientX, e.clientY);
      }}
      onPointerLeave={() => animate(opacity, 0, { duration: 0.12 })}
    >
      {children}
      {mounted
        ? createPortal(
            <m.div
              aria-hidden="true"
              style={{ x: sx, y: sy, opacity, width: WIDTH }}
              className="glass rounded-card bg-bg/90 pointer-events-none fixed top-0 left-0 z-[60] overflow-hidden backdrop-blur-md"
            >
              {preview}
            </m.div>,
            document.body,
          )
        : null}
    </div>
  );
}
