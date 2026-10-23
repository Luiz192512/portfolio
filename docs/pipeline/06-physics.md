# 06-physics: lanyard physics review (2026-10-23)

Scope: `src/components/three/Band.tsx` (physics and drag). Reference measured by behavior only (pixel tracking of screencast frames, about 40 fps, card tracked by bright pixels), nothing copied.

## Root cause

1. No yaw restoring force. The card hangs from a spherical joint at its top, so rotation about the vertical axis is free and nothing untwists it. After the entry and after almost every drag the card stayed rotated: 10 to 25 degrees after the entry, edge-on (84 degrees) after flicks, and flipped to its blank black back (yaw 212 degrees) after the "5 quick drags" test. The reference also spins mid-gesture but always returns to a single rest pose (tilt -6 degrees, facing the viewer) within about 4 s.
2. Release lost all momentum. The card is kinematic while held, so on release it became dynamic with zero velocity: flicks barely swung the card (0.12 card widths vs 0.75 in the reference).
3. Kinematic target teleported to the raw pointer and could be pulled over the anchor, so the chain was whipped and the card top could pass the anchor.
4. Sleep logic (the render loop and physics sleeping at rest) measured only the card center, and its 0.25 s sample counted raw frame deltas. A stalled frame (WASM or texture load) counted as a full sample, so 4 stalled frames could "prove" rest while the card was still 0.37 to 0.55 units above its rest pose. Seen as: card frozen at y 0.48 (rest is 0.12), slept 170 ms after its last movement. A spin about the vertical axis would also have been judged "at rest".
5. Not causes: dpr and antialias, the entry drop (anchor drop 6 units, max card Rz 44 degrees, settles in about 2.5 s), joint chain stiffness, strap detaching (not observed in any run).

## Fix (final parameters)

| Item | Before | After |
|---|---|---|
| Yaw control | none | spring torque in `useBeforePhysicsStep`: K 90, C 9 (damping from yaw rate), K x3 when abs(yaw) > 1.2 rad |
| Drag target | raw pointer | exponential smoothing rate 28 per s, card top clamped to a 2.3 unit radius around the anchor and at least 0.3 below it, x clamped to the box |
| Release | linvel 0 | pointer velocity (raw, EMA 0.4) applied as linvel, capped 16 units/s |
| Rest detection | center moved < 0.004 for 4 samples of 0.25 s of raw delta | sample time uses delta clamped to 0.05; needs center and rotation still (quaternion angle), center within 0.05 x and 0.06 y of the rest pose, yaw and roll below about 6 degrees |
| Stuck guard | none | motionless away from the rest pose: wake all bodies and nudge the card (impulse 0.05, -0.2, 0.05) |
| Kept | gravity -40, 3 rope joints of 0.26 plus 1 spherical joint, damping 4 on segments, card linear damping 2, masses 0.5 and 0.6, solver iterations 16, entry drop 6 units after 200 ms, wake on pointerenter and pointerdown, frameloop demand at rest | same |

## Before and after, ours (desktop 1440, units: card widths w = 3 world units)

Release based. maxdx is the max horizontal offset of the card center after release, rest time is time until the center stops moving.

| Scenario | Before: maxdx / final yaw / rest time | After: maxdx / final yaw / rest time |
|---|---|---|
| Entry (drop) | final yaw 25 deg | yaw 0, rest about 2.2 to 4.3 s after load |
| Slow drag far, release | 0.40w / 10 deg / 2.7 s | 0.38w / 0 / 3.5 s |
| Flick | 0.12w / 10 deg / 2.6 s | 0.56w / 0 / 3.5 s |
| Hold up near anchor | 0.01w / 10 deg / 2.2 s | 0.01w / 0 / 1.6 s |
| 5 quick drags | 0.31w / 212 deg (back face, flipped) / 3.2 s | 0.16w / 0 / 3.3 s |
| Leave canvas holding | 0.10w / 212 deg / 2.5 s | 0.10w / 0 / 2.5 s |
| Touch drag (390 px, after tap to load) | not measured | 0.82w / 0 / 4.0 s |
| Touch flick | not measured | 0.44w / 0 / 4.1 s |
| Console errors | 0 | 0 |

## Reference (full-screen canvas, card about 230 px wide, same gestures, release based)

| Scenario | maxdx | max tilt | min width ratio (spin) | rest after release | final pose |
|---|---|---|---|---|---|
| Entry | 0.30w | 16 deg | 0.83 | settled by about 3.7 s | tilt -6.0 |
| Slow drag | 0.90w | 50 deg | 0.98 | 3.8 s | tilt -6.1, facing front |
| Flick | 0.75w | 28 deg | 0.98 | 3.3 s | tilt -6.0 |
| Up (hold high) | 0.04w | 89 deg | 0.43 (spins) | 2.2 s | tilt -6.1 |
| Repeated drags | 0.69w | 34 deg | 0.97 | 3.7 s | tilt -6.0 |
| Leave canvas holding | 0.43w | 89 deg | 0.09 (edge-on mid-motion) | 4.4 s | tilt -6.0, facing front |

Takeaways: the reference may spin or go edge-on during a gesture but always returns to one pose in 2 to 4.5 s; swings reach 0.3 to 0.9 card widths; rest tilt about -6 degrees (ours rests at 0, by design, to overlap the static card without a jump).

## Limits and open items

- Our swing is clipped by the canvas box (360 px wide on desktop, card 300 px), so large swings are cut visually; the reference canvas is full screen. Left as is because DESIGN.md fixes the canvas to the hero box.
- Pixel tracking of the reference is approximate (about 40 fps screencast, bright pixel mask); numbers are good to roughly 10 percent.
- A card stuck at y 0.48 to 0.66 was seen in 2 of about 20 cold loads right after a dev recompile (first load, long frame stalls). Not reproduced after the stalled-delta clamp, the rest-pose check and the nudge, so the exact trigger is unproven.
- Real-device touch (scroll vs drag arbitration with `touch-action: pan-y`) and frame cost on phones were not measured; touch was emulated through CDP touch events.
- `useBeforePhysicsStep` reads the card quaternion from the interpolated object, so the spring runs one frame behind; no visible effect at 60 Hz.
