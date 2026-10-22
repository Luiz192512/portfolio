'use client';

import { Component, useCallback, useEffect, useState, useSyncExternalStore, type ReactNode } from 'react';
import dynamic from 'next/dynamic';
import { copy } from '@/lib/copy';
import { hasRealWebGL, useLanyardEligibility } from './use-lanyard-eligibility';

/** Set to false to disable the 3D scene; while false the chunk is never requested. */
export const LANYARD_SCENE_READY = true;

const LanyardScene = dynamic(
  () => {
    performance.mark('lanyard:import');
    return import('./LanyardScene');
  },
  { ssr: false, loading: () => null },
);

const ACTIVATE_LABEL = 'Ativar o crachá 3D interativo';
const ACTIVATE_HINT = 'TOQUE NO CRACHÁ PARA ATIVAR O 3D';
const LOADING_HINT = 'CARREGANDO O CRACHÁ 3D';

function subscribeIntent(cb: () => void) {
  window.addEventListener('resize', cb);
  return () => window.removeEventListener('resize', cb);
}

function wantsIntent(): boolean {
  return window.matchMedia('(pointer: coarse)').matches || window.innerWidth < 768;
}

class SceneBoundary extends Component<{ onError: () => void; children: ReactNode }, { failed: boolean }> {
  override state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  override componentDidCatch() {
    this.props.onError();
  }
  override render() {
    return this.state.failed ? null : this.props.children;
  }
}

function whenIdle(cb: () => void): () => void {
  let cancelled = false;
  let idleId: number | undefined;
  let timeoutId: number | undefined;
  const run = () => {
    if (!cancelled) cb();
  };
  const raf = requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      if (typeof requestIdleCallback === 'function') {
        idleId = requestIdleCallback(run, { timeout: 800 });
      } else {
        timeoutId = window.setTimeout(run, 200);
      }
    });
  });
  return () => {
    cancelled = true;
    cancelAnimationFrame(raf);
    if (idleId !== undefined && typeof cancelIdleCallback === 'function') cancelIdleCallback(idleId);
    if (timeoutId !== undefined) clearTimeout(timeoutId);
  };
}

/**
 * Fixed-size lanyard box. `children` is the server-rendered StaticLanyard, present in the
 * initial HTML. The 3D scene mounts absolutely inside the same box, so nothing shifts.
 */
export function LanyardSlot({ children }: { children: ReactNode }) {
  const mode = useLanyardEligibility();
  const [load, setLoad] = useState(false);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const intent = useSyncExternalStore(subscribeIntent, wantsIntent, () => false);

  /** Probes WebGL lazily, only once the scene is actually requested. */
  const startLoad = useCallback(() => {
    let ok = false;
    try {
      ok = hasRealWebGL();
    } catch {
      ok = false;
    }
    if (ok) setLoad(true);
    else setFailed(true);
  }, []);

  useEffect(() => {
    if (!LANYARD_SCENE_READY || mode !== '3d' || failed || intent) return;
    return whenIdle(startLoad);
  }, [mode, failed, intent, startLoad]);

  const onFail = useCallback(() => {
    setFailed(true);
    setLoad(false);
    setReady(false);
  }, []);
  const onReady = useCallback(() => {
    performance.mark('lanyard:ready');
    setReady(true);
  }, []);

  const threeD = LANYARD_SCENE_READY && mode === '3d' && !failed && ready;
  const showButton = LANYARD_SCENE_READY && mode === '3d' && !failed && intent && !threeD;
  const hint = showButton ? (load ? LOADING_HINT : ACTIVATE_HINT) : null;

  return (
    <div
      className="relative mx-auto h-[330px] w-full md:h-[420px] md:w-[300px] lg:mx-0 lg:h-[600px] lg:w-[360px] lg:flex-none"
      {...(threeD
        ? { role: 'region', 'aria-label': copy.hero.lanyardLabel }
        : showButton
          ? {}
          : { role: 'img', 'aria-label': copy.hero.photoAlt })}
    >
      <div
        className="absolute inset-0 flex items-start justify-center transition-opacity duration-150"
        style={{ opacity: threeD ? 0 : 1 }}
        aria-hidden={threeD || showButton ? true : undefined}
      >
        {children}
      </div>
      {LANYARD_SCENE_READY && load && !failed ? (
        <div className="absolute inset-0" aria-hidden="true">
          <SceneBoundary onError={onFail}>
            <LanyardScene onReady={onReady} />
          </SceneBoundary>
        </div>
      ) : null}
      {showButton && !load ? (
        <button
          type="button"
          aria-label={ACTIVATE_LABEL}
          onClick={startLoad}
          className="absolute inset-0 cursor-pointer rounded-lanyard bg-transparent focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
        />
      ) : null}
      {showButton && load ? <span className="sr-only" role="status">{LOADING_HINT}</span> : null}
      {threeD || hint ? (
        <p
          aria-hidden={hint ? true : undefined}
          className="absolute inset-x-0 top-full mt-2 text-center font-mono text-[11px] tracking-[0.2em] text-text-subtle md:top-auto md:bottom-0 md:mt-0"
        >
          {threeD ? copy.hero.lanyardCaption : hint}
        </p>
      ) : null}
    </div>
  );
}
