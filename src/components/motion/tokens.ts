export const EASE_EXPO_OUT = [0.16, 1, 0.3, 1] as const;
export const EASE_MICRO = [0.2, 0.8, 0.2, 1] as const;

export type EntryStep =
  | 'background'
  | 'h1'
  | 'badge'
  | 'navbar'
  | 'typewriter'
  | 'paragraph'
  | 'chips'
  | 'hints'
  | 'scroll';

/** Values from the DESIGN.md entry timeline table, in seconds. */
export const ENTRY: Record<EntryStep, { delay: number; duration: number; y?: number; scale?: number }> = {
  background: { delay: 0, duration: 0.15 },
  h1: { delay: 0.16, duration: 1.2, y: 50, scale: 0.85 },
  badge: { delay: 0.26, duration: 0.8, y: 24 },
  navbar: { delay: 0.35, duration: 1, y: -40 },
  typewriter: { delay: 0.36, duration: 0.8, y: 24 },
  paragraph: { delay: 0.46, duration: 0.8, y: 24 },
  chips: { delay: 0.56, duration: 0.8, y: 16 },
  hints: { delay: 0.66, duration: 0.8, y: 16 },
  scroll: { delay: 0.9, duration: 0.6 },
};

export const REVEAL = { duration: 0.7, stagger: 0.08, y: 32, amount: 0.2 } as const;
export const COUNT_UP = { duration: 1.2 } as const;
export const REDUCED = { duration: 0.2 } as const;
export const TYPEWRITER = {
  startDelayMs: 1000,
  typeMs: 55,
  holdMs: 1800,
  deleteMs: 30,
  pauseBeforeTypeMs: 300,
} as const;
