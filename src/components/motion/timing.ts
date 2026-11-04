import {
  COUNT_UP,
  EASE_EXPO_OUT,
  ENTRY,
  REDUCED,
  REVEAL,
  TYPEWRITER,
  type EntryStep,
} from './tokens';

type Ease = readonly [number, number, number, number] | 'linear';

export type EntryTransition = {
  duration: number;
  delay: number;
  ease: Ease;
  /** Reduced motion only: transforms snap to rest instantly so none is left behind. */
  y?: { duration: 0 };
  scale?: { duration: 0 };
};

const SNAP = { y: { duration: 0 }, scale: { duration: 0 } } as const;

/**
 * Initial values. Identical for every preference (the server cannot know it), so the SSR
 * inline style and the hydrated one match. Reduced motion clears the transforms through
 * entryAnimate plus the zero duration transforms in entryTransition.
 */
export function entryInitial(step: EntryStep, reduced = false) {
  void reduced;
  const { y, scale } = ENTRY[step];
  return {
    opacity: 0,
    ...(y !== undefined ? { y } : {}),
    ...(scale !== undefined ? { scale } : {}),
  };
}

/** Final values. Transform keys mirror the initial ones so they animate back to rest. */
export function entryAnimate(step: EntryStep, reduced = false) {
  void reduced;
  const { y, scale } = ENTRY[step];
  return {
    opacity: 1,
    ...(y !== undefined ? { y: 0 } : {}),
    ...(scale !== undefined ? { scale: 1 } : {}),
  };
}

export function entryTransition(step: EntryStep, reduced: boolean): EntryTransition {
  if (reduced) return { duration: REDUCED.duration, delay: 0, ease: 'linear', ...SNAP };
  const { delay, duration } = ENTRY[step];
  return { duration, delay, ease: step === 'background' ? 'linear' : EASE_EXPO_OUT };
}

export function revealDelay(index: number): number {
  return Math.max(0, index) * REVEAL.stagger;
}

export function revealInitial() {
  return { opacity: 0, y: REVEAL.y };
}

export function revealAnimate() {
  return { opacity: 1, y: 0 };
}

export function revealTransition(index: number, reduced: boolean): EntryTransition {
  if (reduced) return { duration: REDUCED.duration, delay: 0, ease: 'linear', ...SNAP };
  return { duration: REVEAL.duration, delay: revealDelay(index), ease: EASE_EXPO_OUT };
}

export function countUpDuration(reduced: boolean): number {
  return reduced ? 0 : COUNT_UP.duration;
}

export function formatCount(n: number): string {
  return String(Math.round(n));
}

export type TypewriterState = {
  phrase: number;
  length: number;
  phase: 'typing' | 'holding' | 'deleting';
};

export const TYPEWRITER_INITIAL: TypewriterState = { phrase: 0, length: 0, phase: 'typing' };

/**
 * Pure state machine. Returns the next state and how long to wait (ms) before applying it.
 * typing: +1 char every 55 ms; full phrase: hold 1800 ms; deleting: -1 char every 30 ms.
 */
export function typewriterNext(
  state: TypewriterState,
  phrases: readonly string[],
): { state: TypewriterState; wait: number } {
  const count = phrases.length;
  if (count === 0) return { state, wait: TYPEWRITER.holdMs };
  const text = phrases[state.phrase % count] ?? '';
  switch (state.phase) {
    case 'typing': {
      if (state.length >= text.length) {
        return { state: { ...state, phase: 'holding' }, wait: TYPEWRITER.holdMs };
      }
      return { state: { ...state, length: state.length + 1 }, wait: TYPEWRITER.typeMs };
    }
    case 'holding':
      return { state: { ...state, phase: 'deleting' }, wait: 0 };
    case 'deleting': {
      if (state.length <= 0) {
        return {
          state: { phrase: (state.phrase + 1) % count, length: 0, phase: 'typing' },
          wait: TYPEWRITER.pauseBeforeTypeMs,
        };
      }
      return { state: { ...state, length: state.length - 1 }, wait: TYPEWRITER.deleteMs };
    }
  }
}
