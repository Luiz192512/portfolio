import { describe, expect, it } from 'vitest';
import {
  TYPEWRITER_INITIAL,
  entryAnimate,
  entryInitial,
  entryTransition,
  formatCount,
  revealAnimate,
  revealInitial,
  revealTransition,
  typewriterNext,
  type TypewriterState,
} from './timing';
import { ENTRY, type EntryStep } from './tokens';

describe('entry timing', () => {
  it('matches the DESIGN.md delays in ms', () => {
    const ms = (Object.keys(ENTRY) as EntryStep[]).map((s) => Math.round(ENTRY[s].delay * 1000));
    expect(ms).toEqual([0, 160, 260, 350, 360, 460, 560, 660, 900]);
  });
  it('h1 has the exact transform and 1200 ms expo-out', () => {
    expect(entryInitial('h1', false)).toEqual({ opacity: 0, y: 50, scale: 0.85 });
    expect(entryAnimate('h1', false)).toEqual({ opacity: 1, y: 0, scale: 1 });
    expect(entryTransition('h1', false)).toEqual({
      duration: 1.2,
      delay: 0.16,
      ease: [0.16, 1, 0.3, 1],
    });
  });
  it('navbar starts above', () => {
    expect(entryInitial('navbar', false)).toEqual({ opacity: 0, y: -40 });
  });
  it('reduced motion: 200 ms opacity, transforms snap to rest (none left behind)', () => {
    for (const s of Object.keys(ENTRY) as EntryStep[]) {
      expect(entryInitial(s, true)).toEqual(entryInitial(s, false));
      const a = entryAnimate(s, true);
      expect(a.opacity).toBe(1);
      expect('y' in a).toBe(ENTRY[s].y !== undefined);
      expect('scale' in a).toBe(ENTRY[s].scale !== undefined);
      expect(entryTransition(s, true)).toMatchObject({
        duration: 0.2,
        delay: 0,
        y: { duration: 0 },
        scale: { duration: 0 },
      });
    }
  });
  it('reveal reduced snaps y to rest', () => {
    expect(revealInitial()).toEqual({ opacity: 0, y: 32 });
    expect(revealAnimate()).toEqual({ opacity: 1, y: 0 });
    expect(revealTransition(1, true)).toMatchObject({ y: { duration: 0 } });
  });
});

describe('reveal', () => {
  it('staggers 80 ms per index', () => {
    expect(revealTransition(2, false).delay).toBeCloseTo(0.16);
    expect(revealTransition(0, false).duration).toBe(0.7);
    expect(revealTransition(3, true)).toMatchObject({ duration: 0.2, delay: 0 });
  });
});

describe('formatCount', () => {
  it('rounds', () => expect(formatCount(4.6)).toBe('5'));
});

describe('typewriterNext', () => {
  const phrases = ['ab', 'c'];
  it('types 55 ms per char, holds 1800, deletes 30 per char, advances phrase', () => {
    let s: TypewriterState = TYPEWRITER_INITIAL;
    const waits: number[] = [];
    for (let i = 0; i < 9; i++) {
      const n = typewriterNext(s, phrases);
      waits.push(n.wait);
      s = n.state;
    }
    expect(waits.slice(0, 5)).toEqual([55, 55, 1800, 0, 30]);
    expect(s.phrase).toBe(1);
  });
  it('wraps to the first phrase', () => {
    const n = typewriterNext({ phrase: 1, length: 0, phase: 'deleting' }, phrases);
    expect(n.state).toEqual({ phrase: 0, length: 0, phase: 'typing' });
  });
});
