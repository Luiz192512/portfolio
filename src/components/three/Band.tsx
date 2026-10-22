'use client';

import { useCallback, useEffect, useMemo, useRef, useState, type RefObject } from 'react';
import { useFrame, useThree, type ThreeEvent } from '@react-three/fiber';
import {
  BallCollider,
  CuboidCollider,
  RigidBody,
  useRopeJoint,
  useSphericalJoint,
  type RapierRigidBody,
} from '@react-three/rapier';
import {
  BufferAttribute,
  ExtrudeGeometry,
  MeshStandardMaterial,
  Shape,
  ShapeGeometry,
  Vector2,
  Vector3,
  type Group,
  type PerspectiveCamera,
  type Texture,
} from 'three';
import { MeshLineGeometry, MeshLineMaterial } from 'meshline';

/** World-space layout (units, y up). The card is 3 x 4.2 so it matches the 300 x 420 static card. */
export const CARD_W = 3;
export const CARD_H = 4.2;
/** Anchor to card top at rest (matches the static strap plus clip, about 76 px of 600). */
export const ROPE_LEN = 0.78;
/** World y of the anchor, also the top edge of the visible area. */
export const WORLD_ANCHOR_Y = 3;

const SEG = ROPE_LEN / 3;
const DROP = 6;
const DROP_DURATION = 0.55;
const ENTRY_DELAY = 0.2;
const CARD_DEPTH = 0.08;
const CARD_RADIUS = (22 / 300) * CARD_W;
const STRAP_SAMPLES = 25;
const STRAP_PX_K = 0.133;
const STRAP_REPEAT_X = 2.4;
const DAMPING = 4;
const REST_SAMPLE = 0.25;
const REST_SAMPLES = 4;
const REST_EPSILON = 0.004;

const bodyY = (i: number) => WORLD_ANCHOR_Y + DROP - SEG * i;

interface Scratch {
  vec: Vector3;
  dir: Vector3;
  pos: Vector3;
  offset: Vector2;
  target: { x: number; y: number; z: number };
  ctrl: Float32Array;
  elapsed: number;
  entered: boolean;
  dragging: boolean;
  quiet: number;
  sample: number;
  lastX: number;
  lastY: number;
}

function createScratch(): Scratch {
  return {
    vec: new Vector3(),
    dir: new Vector3(),
    pos: new Vector3(),
    offset: new Vector2(),
    target: { x: 0, y: 0, z: 0 },
    ctrl: new Float32Array(15),
    elapsed: 0,
    entered: false,
    dragging: false,
    quiet: 0,
    sample: 0,
    lastX: 0,
    lastY: 0,
  };
}

/** Strap is 30 / 26 / 22 px wide like the static strap. lineWidth is empirical: px = 0.133 * lineWidth * px per unit. */
function configureStrap(mat: MeshLineMaterial, width: number, height: number) {
  mat.toneMapped = false;
  mat.resolution.set(width, height);
  const cardPx = height >= 500 ? 420 : height >= 380 ? 336 : 274;
  const pxPerUnit = cardPx / CARD_H;
  const strapPx = height >= 500 ? 30 : height >= 380 ? 26 : 22;
  mat.lineWidth = strapPx / (STRAP_PX_K * pxPerUnit);
}

function applyStrapTexture(mat: MeshLineMaterial, tex: Texture) {
  mat.map = tex;
  mat.useMap = 1;
  mat.needsUpdate = true;
}

function setCursor(el: HTMLElement, value: string) {
  el.style.cursor = value;
}

/** Catmull-Rom through the 5 control points (j3 up to a point above the screen), written in place. */
function writeStrap(geo: MeshLineGeometry, c: Float32Array) {
  const attrs = geo._attributes;
  const pos = attrs.position.array as Float32Array;
  const prev = attrs.previous.array as Float32Array;
  const next = attrs.next.array as Float32Array;
  const last = STRAP_SAMPLES - 1;
  for (let i = 0; i < STRAP_SAMPLES; i++) {
    const u = (i / last) * 4;
    const seg = Math.min(Math.floor(u), 3);
    const t = u - seg;
    const t2 = t * t;
    const t3 = t2 * t;
    const a = Math.max(seg - 1, 0) * 3;
    const b = seg * 3;
    const d = (seg + 1) * 3;
    const e = Math.min(seg + 2, 4) * 3;
    for (let k = 0; k < 3; k++) {
      const v0 = c[a + k] as number;
      const v1 = c[b + k] as number;
      const v2 = c[d + k] as number;
      const v3 = c[e + k] as number;
      const val =
        0.5 * (2 * v1 + (-v0 + v2) * t + (2 * v0 - 5 * v1 + 4 * v2 - v3) * t2 + (-v0 + 3 * v1 - 3 * v2 + v3) * t3);
      pos[i * 6 + k] = val;
      pos[i * 6 + 3 + k] = val;
    }
  }
  for (let i = 0; i < STRAP_SAMPLES; i++) {
    const pi = Math.max(i - 1, 0) * 6;
    const ni = Math.min(i + 1, last) * 6;
    const o = i * 6;
    for (let k = 0; k < 3; k++) {
      const pv = pos[pi + k] as number;
      const nv = pos[ni + k] as number;
      prev[o + k] = pv;
      prev[o + 3 + k] = pv;
      next[o + k] = nv;
      next[o + 3 + k] = nv;
    }
  }
  attrs.position.needsUpdate = true;
  attrs.previous.needsUpdate = true;
  attrs.next.needsUpdate = true;
}

function roundedRect(w: number, h: number, r: number): Shape {
  const x = -w / 2;
  const y = -h / 2;
  const s = new Shape();
  s.moveTo(x + r, y);
  s.lineTo(x + w - r, y);
  s.absarc(x + w - r, y + r, r, -Math.PI / 2, 0, false);
  s.lineTo(x + w, y + h - r);
  s.absarc(x + w - r, y + h - r, r, 0, Math.PI / 2, false);
  s.lineTo(x + r, y + h);
  s.absarc(x + r, y + h - r, r, Math.PI / 2, Math.PI, false);
  s.lineTo(x, y + r);
  s.absarc(x + r, y + r, r, Math.PI, Math.PI * 1.5, false);
  return s;
}

function buildFrontGeometry(): ShapeGeometry {
  const geo = new ShapeGeometry(roundedRect(CARD_W, CARD_H, CARD_RADIUS), 12);
  const pos = geo.getAttribute('position');
  const uv = new Float32Array(pos.count * 2);
  for (let i = 0; i < pos.count; i++) {
    uv[i * 2] = pos.getX(i) / CARD_W + 0.5;
    uv[i * 2 + 1] = pos.getY(i) / CARD_H + 0.5;
  }
  geo.setAttribute('uv', new BufferAttribute(uv, 2));
  return geo;
}

function buildBodyGeometry(): ExtrudeGeometry {
  const geo = new ExtrudeGeometry(roundedRect(CARD_W, CARD_H, CARD_RADIUS), {
    depth: CARD_DEPTH,
    bevelEnabled: false,
    curveSegments: 12,
  });
  geo.translate(0, 0, -CARD_DEPTH / 2);
  return geo;
}

export interface BandProps {
  strapTexture: Texture | null;
  cardTexture: Texture | null;
  /** Called once, when the card first enters the visible area. */
  onEntered: () => void;
  /** True while the loop is asleep (card at rest). */
  settled: boolean;
  /** Called when the card has been at rest for about 1 s. */
  onSettled: () => void;
}

/** Strap and card on a 4 joint rope: kinematic anchor, 3 rope joints, 1 spherical joint. */
export function Band({ strapTexture, cardTexture, onEntered, settled, onSettled }: BandProps) {
  const fixed = useRef<RapierRigidBody>(null) as RefObject<RapierRigidBody>;
  const j1 = useRef<RapierRigidBody>(null) as RefObject<RapierRigidBody>;
  const j2 = useRef<RapierRigidBody>(null) as RefObject<RapierRigidBody>;
  const j3 = useRef<RapierRigidBody>(null) as RefObject<RapierRigidBody>;
  const card = useRef<RapierRigidBody>(null) as RefObject<RapierRigidBody>;

  useRopeJoint(fixed, j1, [[0, 0, 0], [0, 0, 0], SEG]);
  useRopeJoint(j1, j2, [[0, 0, 0], [0, 0, 0], SEG]);
  useRopeJoint(j2, j3, [[0, 0, 0], [0, 0, 0], SEG]);
  useSphericalJoint(j3, card, [
    [0, 0, 0],
    [0, CARD_H / 2, 0],
  ]);

  const gl = useThree((s) => s.gl);
  const size = useThree((s) => s.size);
  const [dragged, setDragged] = useState(false);
  const [hovered, setHovered] = useState(false);
  const scratchRef = useRef<Scratch | null>(null);
  // Marker groups inside each body: world positions are read from them without allocating
  // (rapier translation() returns a new object on every call).
  const g1 = useRef<Group>(null);
  const g2 = useRef<Group>(null);
  const g3 = useRef<Group>(null);
  const gCard = useRef<Group>(null);

  const frontGeo = useMemo(() => buildFrontGeometry(), []);
  const bodyGeo = useMemo(() => buildBodyGeometry(), []);
  const bodyMat = useMemo(() => new MeshStandardMaterial({ color: '#161616', roughness: 0.55, metalness: 0.1 }), []);
  const clipMat = useMemo(() => new MeshStandardMaterial({ color: '#9a9a9a', roughness: 0.35, metalness: 0.5 }), []);
  const strapGeo = useMemo(() => {
    const g = new MeshLineGeometry();
    const init = new Float32Array(STRAP_SAMPLES * 3);
    for (let i = 0; i < STRAP_SAMPLES; i++) init[i * 3 + 1] = i * 0.1;
    g.setPoints(init);
    return g;
  }, []);
  const strapMat = useMemo(
    () =>
      new MeshLineMaterial({
        color: '#ffffff',
        lineWidth: 2,
        sizeAttenuation: 1,
        resolution: new Vector2(1, 1),
        repeat: new Vector2(STRAP_REPEAT_X, 1),
        useMap: 0,
      }),
    [],
  );

  useEffect(() => {
    configureStrap(strapMat, size.width, size.height);
  }, [strapMat, size.width, size.height]);

  useEffect(() => {
    if (strapTexture) applyStrapTexture(strapMat, strapTexture);
  }, [strapMat, strapTexture]);

  useEffect(() => {
    return () => {
      frontGeo.dispose();
      bodyGeo.dispose();
      bodyMat.dispose();
      clipMat.dispose();
      strapGeo.dispose();
      strapMat.dispose();
    };
  }, [frontGeo, bodyGeo, bodyMat, clipMat, strapGeo, strapMat]);

  useEffect(() => {
    setCursor(gl.domElement, dragged ? 'grabbing' : hovered ? 'grab' : '');
    return () => setCursor(gl.domElement, '');
  }, [gl, dragged, hovered]);

  const endDrag = useCallback(() => {
    const s = scratchRef.current;
    if (s) {
      s.dragging = false;
      s.quiet = 0;
    }
    setDragged(false);
  }, []);

  const onPointerDown = useCallback((e: ThreeEvent<PointerEvent>) => {
    const s = (scratchRef.current ??= createScratch());
    const g = gCard.current;
    if (!g) return;
    e.stopPropagation();
    (e.target as Element).setPointerCapture(e.pointerId);
    g.getWorldPosition(s.pos);
    s.offset.set(e.point.x - s.pos.x, e.point.y - s.pos.y);
    s.dragging = true;
    s.quiet = 0;
    setDragged(true);
  }, []);

  useFrame((state, delta) => {
    if (!strapTexture || !cardTexture) return;
    const rFixed = fixed.current;
    const rCard = card.current;
    const rJ1 = j1.current;
    const rJ2 = j2.current;
    const rJ3 = j3.current;
    const m1 = g1.current;
    const m2 = g2.current;
    const m3 = g3.current;
    const mc = gCard.current;
    if (!rFixed || !rCard || !rJ1 || !rJ2 || !rJ3 || !m1 || !m2 || !m3 || !mc) return;
    const s = (scratchRef.current ??= createScratch());
    s.elapsed += Math.min(delta, 0.05);

    // Entry: after a short delay the anchor drops from above with gravity-like acceleration.
    const te = s.elapsed - ENTRY_DELAY;
    let ay = WORLD_ANCHOR_Y + DROP;
    if (te >= DROP_DURATION) ay = WORLD_ANCHOR_Y;
    else if (te > 0) {
      const k = te / DROP_DURATION;
      ay = WORLD_ANCHOR_Y + DROP * (1 - k * k);
    }
    s.target.x = 0;
    s.target.y = ay;
    s.target.z = 0;
    rFixed.setNextKinematicTranslation(s.target);

    if (s.dragging) {
      const cam = state.camera;
      s.vec.set(state.pointer.x, state.pointer.y, 0.5).unproject(cam);
      s.dir.copy(s.vec).sub(cam.position).normalize();
      const dist = -cam.position.z / s.dir.z;
      s.vec.copy(cam.position).addScaledVector(s.dir, dist);
      const viewH = 2 * Math.abs(cam.position.z) * Math.tan(((cam as PerspectiveCamera).fov * Math.PI) / 360);
      const maxX = Math.max(0, (viewH * (state.size.width / state.size.height)) / 2 - CARD_W / 2);
      s.target.x = Math.max(-maxX, Math.min(maxX, s.vec.x - s.offset.x));
      s.target.y = Math.max(WORLD_ANCHOR_Y - 6, Math.min(WORLD_ANCHOR_Y, s.vec.y - s.offset.y));
      rJ1.wakeUp();
      rJ2.wakeUp();
      rJ3.wakeUp();
      rCard.wakeUp();
      rCard.setNextKinematicTranslation(s.target);
    }

    // Strap control points, bottom to top: j3, j2, j1, anchor, a point above the screen.
    const c = s.ctrl;
    m3.getWorldPosition(s.pos);
    c[0] = s.pos.x;
    c[1] = s.pos.y;
    c[2] = s.pos.z;
    m2.getWorldPosition(s.pos);
    c[3] = s.pos.x;
    c[4] = s.pos.y;
    c[5] = s.pos.z;
    m1.getWorldPosition(s.pos);
    c[6] = s.pos.x;
    c[7] = s.pos.y;
    c[8] = s.pos.z;
    c[9] = 0;
    c[10] = ay;
    c[11] = 0;
    c[12] = 0;
    c[13] = ay + 3;
    c[14] = 0;
    writeStrap(strapGeo, c);

    mc.getWorldPosition(s.pos);
    if (!s.entered && s.pos.y - CARD_H / 2 < WORLD_ANCHOR_Y) {
      s.entered = true;
      onEntered();
    }

    // Rest detection: compare the card position every 0.25 s, asleep after 4 quiet samples in a row.
    s.sample += delta;
    if (settled || s.dragging || te < DROP_DURATION + 0.2) {
      s.quiet = 0;
      s.sample = 0;
      s.lastX = s.pos.x;
      s.lastY = s.pos.y;
    } else if (s.sample >= REST_SAMPLE) {
      s.sample = 0;
      const moved = Math.abs(s.pos.x - s.lastX) + Math.abs(s.pos.y - s.lastY);
      s.lastX = s.pos.x;
      s.lastY = s.pos.y;
      s.quiet = moved < REST_EPSILON ? s.quiet + 1 : 0;
      if (s.quiet >= REST_SAMPLES) {
        s.quiet = 0;
        onSettled();
      }
    }
  });

  const ready = strapTexture !== null && cardTexture !== null;

  return (
    <>
      <RigidBody ref={fixed} type="kinematicPosition" position={[0, bodyY(0), 0]} colliders={false} />
      <RigidBody ref={j1} position={[0, bodyY(1), 0]} colliders={false} angularDamping={DAMPING} linearDamping={DAMPING}>
        <group ref={g1} />
        <BallCollider args={[0.06]} mass={0.5} />
      </RigidBody>
      <RigidBody ref={j2} position={[0, bodyY(2), 0]} colliders={false} angularDamping={DAMPING} linearDamping={DAMPING}>
        <group ref={g2} />
        <BallCollider args={[0.06]} mass={0.5} />
      </RigidBody>
      <RigidBody ref={j3} position={[0, bodyY(3), 0]} colliders={false} angularDamping={DAMPING} linearDamping={DAMPING}>
        <group ref={g3} />
        <BallCollider args={[0.06]} mass={0.5} />
      </RigidBody>
      <RigidBody
        ref={card}
        position={[0, bodyY(3) - CARD_H / 2, 0]}
        colliders={false}
        type={dragged ? 'kinematicPosition' : 'dynamic'}
        angularDamping={DAMPING}
        linearDamping={2}
      >
        <group ref={gCard} />
        <CuboidCollider args={[CARD_W / 2, CARD_H / 2, CARD_DEPTH / 2]} mass={0.6} />
        <group
          visible={ready}
          onPointerOver={() => setHovered(true)}
          onPointerOut={() => setHovered(false)}
          onPointerDown={onPointerDown}
          onPointerUp={endDrag}
          onLostPointerCapture={endDrag}
        >
          <mesh geometry={bodyGeo} material={bodyMat} />
          <mesh geometry={frontGeo} position={[0, 0, CARD_DEPTH / 2 + 0.002]}>
            <meshBasicMaterial map={cardTexture} toneMapped={false} />
          </mesh>
          <mesh position={[0, CARD_H / 2 + 0.02, 0]} material={clipMat}>
            <boxGeometry args={[0.5, 0.34, 0.14]} />
          </mesh>
        </group>
      </RigidBody>
      <mesh geometry={strapGeo} material={strapMat} frustumCulled={false} visible={ready} />
    </>
  );
}
