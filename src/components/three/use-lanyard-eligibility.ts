'use client';

import { useSyncExternalStore } from 'react';

export type LanyardMode = 'pending' | 'static' | '3d';

type NavigatorExtras = Navigator & {
  connection?: { saveData?: boolean };
  deviceMemory?: number;
};

/** Real (non software) WebGL probe. Run lazily when the scene is requested, never during hydration. */
export function hasRealWebGL(): boolean {
  const canvas = document.createElement('canvas');
  const opts = { failIfMajorPerformanceCaveat: true };
  const gl = (canvas.getContext('webgl2', opts) ?? canvas.getContext('webgl', opts)) as
    | WebGL2RenderingContext
    | WebGLRenderingContext
    | null;
  if (!gl) return false;
  gl.getExtension('WEBGL_lose_context')?.loseContext();
  return true;
}

/** Browser-only check, exported for tests. */
export function computeLanyardMode(): Exclude<LanyardMode, 'pending'> {
  const nav = navigator as NavigatorExtras;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return 'static';
  if (nav.connection?.saveData === true || window.matchMedia('(prefers-reduced-data: reduce)').matches) {
    return 'static';
  }
  if (nav.hardwareConcurrency <= 2) return 'static';
  if (typeof nav.deviceMemory === 'number' && nav.deviceMemory <= 2) return 'static';
  return '3d';
}

let cached: Exclude<LanyardMode, 'pending'> | undefined;
const noopSubscribe = () => () => {};
const getSnapshot = (): LanyardMode => (cached ??= computeLanyardMode());
const getServerSnapshot = (): LanyardMode => 'pending';

/** 'pending' on the server and during hydration, then resolved once (cached) on the client. */
export function useLanyardEligibility(): LanyardMode {
  return useSyncExternalStore(noopSubscribe, getSnapshot, getServerSnapshot);
}
