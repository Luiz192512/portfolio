'use client';

import { Suspense, useCallback, useEffect, useRef, useState } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { Physics } from '@react-three/rapier';
import type { PerspectiveCamera, Texture } from 'three';
import { copy } from '@/lib/copy';
import { Band, CARD_H, WORLD_ANCHOR_Y } from './Band';
import { createCardTexture } from './card-texture';
import { createStrapTexture } from './strap-texture';

const CAM_DIST = 20;
const ACCENT = '#00A7F8';
const ON_ACCENT = '#0D0D0D';

// Mirrors content/profile.json and DESIGN.md (static card footer).
const CARD_TEXT = {
  name: 'Luiz Gustavo Enz',
  role: 'FULL STACK JÚNIOR',
  location: 'MARINGÁ, PR',
} as const;

function fitCamera(camera: PerspectiveCamera, height: number) {
  const cardPx = height >= 500 ? 420 : height >= 380 ? 336 : 274;
  const viewH = (CARD_H * height) / cardPx;
  camera.fov = (2 * Math.atan(viewH / 2 / CAM_DIST) * 180) / Math.PI;
  camera.position.set(0, WORLD_ANCHOR_Y - viewH / 2, CAM_DIST);
  camera.updateProjectionMatrix();
}

/**
 * Keeps the card the same size as the static card in every box (330 / 420 / 600 px tall):
 * the vertical fov is derived so the card fills the same fraction of the box height.
 */
function ViewFit() {
  const camera = useThree((s) => s.camera) as PerspectiveCamera;
  const height = useThree((s) => s.size.height);
  useEffect(() => {
    fitCamera(camera, height);
  }, [camera, height]);
  return null;
}

function isCoarse(): boolean {
  return window.matchMedia('(pointer: coarse)').matches || window.innerWidth < 768;
}

export default function LanyardScene({ onReady }: { onReady?: () => void }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(true);
  const [tabVisible, setTabVisible] = useState(true);
  const [settled, setSettled] = useState(false);
  const [coarse] = useState(isCoarse);
  const [textures, setTextures] = useState<{ strap: Texture; card: Texture } | null>(null);
  const [lost, setLost] = useState(false);
  const onEntered = useCallback(() => onReady?.(), [onReady]);
  const onSettled = useCallback(() => setSettled(true), []);
  const wake = useCallback(() => setSettled(false), []);

  if (lost) throw new Error('WebGL context lost');

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const io = new IntersectionObserver((entries) => {
      const last = entries[entries.length - 1];
      if (last) setInView(last.isIntersecting);
    });
    io.observe(el);
    const onVis = () => setTabVisible(document.visibilityState === 'visible');
    onVis();
    document.addEventListener('visibilitychange', onVis);
    return () => {
      io.disconnect();
      document.removeEventListener('visibilitychange', onVis);
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    let made: Texture[] = [];
    Promise.all([
      createStrapTexture(copy.hero.strap, ACCENT, ON_ACCENT),
      createCardTexture({
        photoUrl: '/lanyard/card-photo-512.webp',
        ...CARD_TEXT,
        badge: copy.hero.card3d,
        accent: ACCENT,
      }),
    ])
      .then(([strap, card]) => {
        if (cancelled) {
          strap.dispose();
          card.dispose();
          return;
        }
        made = [strap, card];
        setTextures({ strap, card });
      })
      .catch(() => {
        if (!cancelled) setLost(true);
      });
    return () => {
      cancelled = true;
      for (const t of made) t.dispose();
      setTextures(null);
    };
  }, []);

  const visible = inView && tabVisible;
  // Off-screen or hidden tab: no frames. Card at rest: render only on demand (resize, events).
  const frameloop = !visible ? 'never' : settled ? 'demand' : 'always';

  return (
    <div ref={rootRef} className="absolute inset-0" onPointerEnter={wake} onPointerDown={wake}>
      <Canvas
        dpr={coarse ? [1, 1.5] : [1, 1.75]}
        gl={{ antialias: !coarse, alpha: true, powerPreference: 'default' }}
        frameloop={frameloop}
        camera={{ fov: 16, position: [0, WORLD_ANCHOR_Y - 3, CAM_DIST], near: 1, far: 60 }}
        style={{ touchAction: 'pan-y' }}
        onCreated={({ gl }) => {
          gl.domElement.addEventListener('webglcontextlost', (ev) => {
            ev.preventDefault();
            setLost(true);
          });
        }}
      >
        <ViewFit />
        <ambientLight intensity={1.4} />
        <directionalLight position={[2, 4, 6]} intensity={1.6} />
        <Suspense fallback={null}>
          <Physics gravity={[0, -40, 0]} timeStep={1 / 60} numSolverIterations={16} interpolate paused={!visible || settled}>
            <Band
              strapTexture={textures?.strap ?? null}
              cardTexture={textures?.card ?? null}
              onEntered={onEntered}
              settled={settled}
              onSettled={onSettled}
            />
          </Physics>
        </Suspense>
      </Canvas>
    </div>
  );
}
