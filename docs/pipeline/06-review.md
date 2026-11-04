# Phase 6.4 review: motion and 3D

Reviewer: Opus (architect-reviewer, skills animation-quality-gate and fixing-motion-performance). Date: 2026-10-22.
Inputs: `06-budgets.md` (6.3), `DESIGN.md` (entry timeline, 3D rules, D1 to D7), `02-architecture.md` sections 4, 7, 14, code in `src/components/motion/*`, `src/components/three/*`, `src/components/sections/hero/*`.

## How this review was done

- `npm run build` (Next 16.4.2, Turbopack) then `npx next start -p 3114`. Server stopped at the end, port 3114 confirmed free.
- The built-in browser tools were not available in this subagent session, so every visual check used Playwright Chromium (headless, SwiftShader WebGL, same launch args as 6.3) with screenshots that I inspected: desktop 1440 x 900 (entry frames, hero at rest, lanyard at 3x DPR, drag and release, About, Portfolio with all 3 tabs, Contact, card to detail mid-transition and final), mobile Pixel 7 at 390 x 844 (hero, full page), reduced motion desktop and mobile.
- Could see: static and 3D lanyard, strap texture at 3x zoom, drag swing, tab pill, detail page, mobile layout, reduced-motion end state. Could not see: real-GPU frame pacing, the exact sub-100 ms entry timing in screenshots (SwiftShader screenshots take 100 to 300 ms each, so timing comes from the 6.3 rAF sampler, not from my frames), the morph of the shared cover (it lands below the fold).
- Extra measurements made for this review: per-module gzip of the first-load chunks (Turbopack module split), CDP CPU profile with 4x throttle on mobile with and without the 3D scene, Event Timing (INP inputs) with and without the scene, DOM boxes of the mobile hero, pixel color of the rendered strap.

## Verdict per gate

| gate | verdict | evidence |
|---|---|---|
| Entry timeline within plus or minus 150 ms | PASS | 6.3 rAF sampler: every row within 107 ms desktop, 43 ms mobile. Order matches DESIGN (h1, badge, navbar, typewriter, paragraph, chips, hints, scroll). |
| Reduced motion: opacity only, nothing displaced | PASS (6.3 row is stale) | Fresh build, `reducedMotion: 'reduce'`: all 8 `[data-entry]` hero items end with `transform: none`, `opacity: 1`; after scrolling the whole page every `Reveal` ends with `transform: none` and `opacity: 1`, desktop and mobile. Typewriter shows phrase 1 static with solid cursor. No canvas, no 3D request. The SNAP transition in `timing.ts` fixed it. 6.3 must rerun to update its table. |
| LCP, CLS | PASS | 6.3: LCP 1.6 to 1.7 s, CLS max 0.0003. |
| INP desktop | PASS | 40 ms. |
| INP mobile, CPU 4x | FAIL | 6.3: 448 ms. My split: with the scene running, mobile menu interactions take 224 to 304 ms (almost all presentation delay, processing 0 to 62 ms); same interactions without the scene 40 to 160 ms. Tabs (hero off-screen, frameloop paused) 72 ms. Cause: the WebGL frame loop keeps rendering a resting card while the user interacts in the hero viewport. |
| TBT mobile, CPU 4x | FAIL | 6.3: 1256 ms. My CPU profile: 915 ms with the scene, 96 ms with reduced motion (no scene). Main-thread self time with scene: three chunk 1402 ms, rapier WASM decode plus compile plus run 520 ms (3te1 chunk 201, wasm 267, js-to-wasm 52), Turbopack module factories 370 vs 176 ms, the eligibility WebGL probe module 262 vs 12 ms, plus 1355 ms "(program)" that is mostly SwiftShader GL work (pessimistic versus a real GPU). Long tasks 316, 260, 242 ms happen from 945 to 2100 ms. The non-3D page is already within budget. |
| First-load JS for `/` <= 180 KB gzip | FAIL, budget re-based (see decision A) | Current build: 241.2 KB gzip-9 (209 KB brotli) in 10 files, excluding `0cz1d0mv5g_q7.js` (39.4 KB, `noModule` core-js polyfill, never fetched by modern browsers). |
| 3D scene chunk <= 350 KB gzip | PASS | 254 KB gzip (`30row3vxnbj26.js` plus 2 small). |
| Rapier not before load | PASS (informational weight is high) | 834 KB gzip (615 KB brotli), 2.24 MB raw, requested after load. |
| Frame rate 60 fps | PASS | 16.7 ms median, p95 16.8 ms idle and drag, even on SwiftShader. |
| Fallbacks (reduced motion, no WebGL, Save-Data), pause off-screen | PASS | 6.3 rows, confirmed reduced motion myself. |
| Lanyard look vs DESIGN | FAIL | Strap text is mirrored; strap color renders #44B5DE instead of #00A7F8; static to 3D swap pops (details in section C). |
| Mobile 390 hero layout | FAIL | Text column is 398 px wide starting at x = -4 in a 390 px viewport (no 16 px gutter, badge, paragraph and "Desenvolvedor" clipped at both edges by `body { overflow-x: clip }`). H1 line 1 renders 35.1 px (DESIGN 30). The caption "ARRASTE O CRACHÁ" overlaps the card footer. |
| About, Portfolio tabs, Contact | PASS (motion scope) | Tabs pill slides, panels enter, stats count up, reveals run once. Out-of-scope notes in section F. |
| Card to detail transition | PASS with note | `document.startViewTransition` present, named groups morph (mid frame captured). The detail cover sits below the fold at 1440 x 900, so the shared morph is mostly off-screen (note for 5.3). |

## A. Decision: first-load JS budget

What composes the 241 KB gzip (per chunk, then per Turbopack module):

| part | gzip KB | notes |
|---|---|---|
| react-dom plus scheduler (`2or1riwyasohw`) | 71.7 | framework |
| Next app router runtime (`2e268anpfvdoc`) | 46.2 | framework |
| next/image client, router bfcache, Turbopack runtime, small Next chunks (`2asrby1ro01lh`, `42onvq6nokjl2`, `turbopack-*`, `1ckvzn7sfprko`, `2r4s4h5xul1n-`) | 23.3 | framework |
| Framework floor | 141.2 | not reducible inside the fixed stack |
| Motion with `domMax` (`3v67tkigrfs5c`) | 49.6 | projection/layout about 9, drag, pan, inertia about 10, rest is the animation core |
| App client chunk (`3a7-6p8vo1wev`) | 43.3 | zod v4 classic about 28 to 30 (module 97229 alone 30.5 gzip), Motion `animate()` for CountUp 5.8, shared validation codes 2.9, app islands about 6 |
| Navbar, MobileMenu, CommentsBoard (`0_25y4aoxm7dd`) | 7.0 | |

The 180 KB budget in section 7 was written before the framework floor was known: Next 16.4 plus React 19.3 alone take 141 KB, which leaves 39 KB for Motion plus every island. The 4x CPU profile shows the non-3D page hydrating with TBT 96 ms, so bytes outside the 3D path are not what fails mobile. Decision:

- Apply cut A1 (zod off the client, about 30 KB, low effort). Expected result about 211 KB gzip (about 183 KB brotli).
- Re-base the budget to **215 KB gzip (level 9), excluding `noModule` scripts**, and record it with a dated note in `02-architecture.md` section 7 (orchestrator). 6.3 must exclude `noModule` scripts explicitly.
- A2 and A3 are optional (P2). With all three the page lands about 186 KB gzip (about 162 KB brotli). Worth doing only if the owner wants the original number; for a personal portfolio the 3D fixes below buy far more.

| cut | saving gzip | effort | priority |
|---|---|---|---|
| A1. zod off the client (ContactForm, CommentForm) | about 30 KB | low | P1 |
| A2. CountUp without Motion `animate()` (15 line rAF tween with the expo-out curve) | about 6 KB | low | P2 |
| A3. `domMax` to `domAnimation`: replace the two `layoutId` uses (tab pill, nav underline) with one absolutely positioned element moved by CSS `transform` and `width` transitions from the active button's `offsetLeft`/`offsetWidth` | 17 to 20 KB | medium, touches 3 owners | P2 |

`LazyMotion` with async `features` does not help this budget (the feature chunk would still load before `lanyard:import`).

## B. Decision: mobile TBT and INP

Root causes, measured (section above): (1) three.js chunk evaluation plus scene init, (2) rapier WASM decode and compile, (3) a throwaway WebGL context created during hydration by the eligibility probe, (4) continuous rendering of a resting card while the user interacts in the hero.

| fix | expected effect | worth it? |
|---|---|---|
| B1. Mobile (`(pointer: coarse)` and width < 768) loads the scene on intent: first `pointerdown` or `touchstart` inside the lanyard box. The static card stays, with the caption visible as affordance. Desktop keeps the idle auto-load. | Mobile TBT at 4x drops to the measured no-scene baseline, about 100 to 150 ms; mobile INP about 160 ms. The 810 KB rapier download is skipped for visitors who never touch the card. | Yes. Biggest win by far. Needs a dated DESIGN note D8 (orchestrator) and owner sign-off, see question below. |
| B2. Sleep pause: when the card and the 3 rope bodies are below a small linear and angular velocity for 1 s, switch `frameloop` to `'never'` and pause physics; wake on pointer enter/down in the box, resize, or IntersectionObserver re-entry. | Removes the 224 to 304 ms menu interactions in the hero (scene idle), saves battery on desktop too. | Yes, low to medium effort. |
| B3. Move the WebGL probe out of hydration. `getSnapshot` runs only the cheap checks (reduced motion, Save-Data, cores, memory); the WebGL check runs inside the idle callback right before `setLoad(true)`, or is dropped and replaced by an `onCreated` check of `WEBGL_debug_renderer_info` (SwiftShader, llvmpipe, "Software" means fail to static through `SceneBoundary`). | Removes one GL context creation from the hydration long task (262 ms self time at 4x on SwiftShader, less on a real GPU). | Yes, low effort. |
| B4. Mobile render cost: `dpr={[1, 1.5]}` and `antialias: false` when `(pointer: coarse)`. | Lower per-frame GPU and presentation cost on phones (DPR 2.6 devices). | Yes, trivial. |
| B5. Yield between init stages (textures, then mount `Physics`) with `await new Promise(r => setTimeout(r))`. | Splits one 300 ms task into smaller ones; TBT down maybe 100 ms. | Optional (P2). |
| B6. Replace rapier with a 4 segment Verlet rope (about 120 lines). | Minus 834 KB gzip and about 520 ms main thread at 4x. | Only if the owner agrees: `@react-three/rapier` is a user-fixed choice. P2. |

Question for the owner (blocking only B1, everything else can proceed): on phones, should the 3D lanyard load only after the visitor touches the card (recommended, fixes the mobile budgets), or always auto-load as on desktop and accept a mobile TBT budget near 900 ms at 4x?

## C. Code smells from 6.2

1. **Kinematic anchor drop** (`Band.tsx` 35 to 38, 212 to 223, 317). The anchor body itself is moved on a scripted quadratic from y + 6 to the anchor in 0.55 s, so the drop is not physics, and on screen the card slides in through the hard top edge of the canvas box just under the navbar (captured at about 800 ms). `onEntered` fires when the card bottom crosses the anchor line, so the static card fades out while the 3D card is still mostly clipped: visible pop on every 3D load. With D3 (static card visible from first paint), any drop means the card jumps up and falls again. Decision: start the 3D scene at the rest pose that already matches the static card, make the anchor `type="fixed"`, call `onReady` after the first frame with textures, then apply one small lateral impulse to the card about 150 ms later so it swings once (signals drag). Orchestrator adds dated note D8 to DESIGN.md (lanyard row: "3D card starts at rest over the static card, one swing impulse; no drop").
2. **`translation()` per frame** (`Band.tsx` 244, 248, 252, 256, 307). Five wrapper allocations per frame, low GC impact (27 ms GC over 6 s), but the bigger issue is correctness: with `interpolate` on, meshes are drawn at interpolated poses while the strap is built from raw physics poses, so the strap end and the clip can drift apart by a fraction of a step during fast swings. Fix: put an `<object3D ref>` inside each rope `RigidBody` and read `getWorldPosition(scratchVec)` into the preallocated scratch, which allocates nothing and matches what is rendered.
3. **File-wide `eslint-disable react-hooks/immutability`** (`LanyardScene.tsx` 1, `Band.tsx` 1). Narrow it: `LanyardScene.tsx` only needs it for the camera mutation in `ViewFit` (34 to 36), as one `eslint-disable-next-line` block with a reason. In `Band.tsx`, move `scratch` (115 to 127) from `useMemo` to `useRef(...).current`-style ref access (the rule allows ref mutation), and keep line-level disables only at the material mutations (154 to 159, 164 to 166) and the cursor style (181, 183). Put `'use client'` on line 1.
4. **Missing `performance.mark('lanyard:import')`** (`LanyardSlot.tsx` 11). Put it inside the loader so it runs exactly before the import: `dynamic(() => { performance.mark('lanyard:import'); return import('./LanyardScene'); }, { ssr: false, loading: () => null })`. 6.3 then uses the mark instead of the reduced-motion diff.
5. **Strap text direction and color** (`strap-texture.ts`, `Band.tsx` 140 to 151). MeshLine maps uv.y = 0 to the left side of an upward strap, and `CanvasTexture.flipY` is true, so glyph tops face right while the text reads bottom to top: mirrored (confirmed at 3x zoom and by the shader math in `meshline/dist/index.js` 117 to 126 and 277 to 285). The static strap uses `-rotate-90` (reads bottom to top, tops to the left). Color: the MeshLine shader includes `tonemapping_fragment`, and R3F defaults to ACES, so the strap renders #44B5DE instead of accent #00A7F8 (pixel sample). Also: the text is about 13 px (DESIGN 11), repeats have no gap between "STACK" and "LUIZ", the 3D strap is about 34 px wide (DESIGN 30) and the 3D clip is a 50 x 34 px grey box while the static clip is 20 x 12 px.

## D. Missing bits from 6.1

- Chips inner stagger 40 ms: not implemented. `HeroSection.tsx` 51 to 57 animates the whole `ul` as one block.
- Scroll arrow loop (y 0 to 6 to 0, 1.6 s ease-in-out, after the 600 ms entry): not implemented. `HeroSection.tsx` 81 renders a static icon.
- Background 150 ms fade: not implemented (static layer). Accepted: invisible against #0D0D0D, 6.3 marked it PASS.

## E. Prioritized fix list

P0 must, P1 should, P2 optional. Owners: 6.1 motion, 6.2 three (incl. `LanyardSlot.tsx`), 5.2 hero section. Other owners named where the file belongs to them.

### P0

| id | owner | file and line | fix | verify |
|---|---|---|---|---|
| P0-1 | 5.2 | `src/components/sections/hero/HeroSection.tsx` 19 | Text column gets `w-full` (`order-2 w-full min-w-0 flex-1 lg:order-1`); in a `flex-col items-center` parent it currently sizes to the nowrap H1 and overflows. | At 320, 390 and 768: column left = 16, right = viewport - 16; `scrollWidth == clientWidth`. |
| P0-2 | 5.2 | same file 34 and 38 | Size the H1 lines to the column per DESIGN (line 1 never wider than column / 11.4): line 1 `text-[clamp(24px,calc((100vw-32px)/11.4),68px)]` (31.4 px at 390), line 2 `text-[clamp(34px,calc((100vw-32px)/7.8),104px)]` (45.9 px at 390). | At 320 and 390 both lines' `getBoundingClientRect().right` <= viewport - 16. |
| P0-3 | 6.2 | `src/components/three/strap-texture.ts` after 36 | `texture.flipY = false;` so glyph tops face left and the text reads bottom to top like the static strap. Optionally font size 70 px (11/30 x 192) and draw `text + '   '` so repeats are separated. | 3x screenshot of the strap at rest: letters not mirrored, same direction as StaticLanyard. |
| P0-4 | 6.2 | `src/components/three/Band.tsx` 140 to 151 | Strap material `toneMapped = false` (set it on the instance after construction). | Pixel sample of the strap background within 3 per channel of #00A7F8. |
| P0-5 | 6.2 (plus orchestrator note D8) | `Band.tsx` 35 to 38, 46, 212 to 223, 317 to 329; `LanyardScene.tsx` 47 | Remove the drop: bodies spawn at rest (`bodyY` without `DROP`), anchor `type="fixed"` (drop `setNextKinematicTranslation`), `onEntered` becomes "first frame with both textures", then `card.applyImpulse({ x: 0.6, y: 0, z: 0 }, true)` once after about 150 ms (tune so the swing stays inside the box). | Frames from 0 to 2 s: no frame where the card is clipped by the box top; static to 3D swap shows no jump; CLS unchanged. |

### P1

| id | owner | file and line | fix | expected |
|---|---|---|---|---|
| P1-1 | 6.2 | `src/components/three/LanyardSlot.tsx` 60 to 63 | B1: on `(pointer: coarse)` and width < 768, replace `whenIdle` with a one-shot `pointerdown`/`touchstart` listener on the box (passive) that calls `setLoad(true)`. Requires the owner answer above and DESIGN note D8. | Mobile TBT 4x about 100 to 150 ms, INP about 160 ms. |
| P1-2 | 6.2 | `LanyardScene.tsx` 99, 106, 120; `Band.tsx` `useFrame` | B2: sleep pause. `Band` reports `settled` (all four bodies `linvel` and `angvel` length < 0.02 for 60 frames); `LanyardScene` sets `active = inView && tabVisible && !settled`; wake on `pointerenter`/`pointerdown` on the root div and on resize. | Menu INP in the hero about 160 ms at 4x; 0 rAF renders at rest. |
| P1-3 | 6.2 | `src/components/three/use-lanyard-eligibility.ts` 33 to 37; `LanyardSlot.tsx` 62 | B3: drop `hasRealWebGL()` from `getSnapshot`; run it in the idle callback before `setLoad(true)` (or use the `onCreated` renderer-string check and fail through `SceneBoundary`). Keep the no-WebGL static fallback and its e2e row green. | Hydration long task shorter; fallback rows still PASS. |
| P1-4 | 6.2 | `LanyardSlot.tsx` 11 | `performance.mark('lanyard:import')` inside the dynamic loader (C4). 6.3 updates `e2e/budgets.spec.ts` to use it. | Mark present in 3D runs, absent in static runs. |
| P1-5 | 6.2 | `LanyardSlot.tsx` 96 | Mobile caption overlaps the card footer (box 330, card plus strap about 326). For < md place it outside the box: `top-full mt-2` instead of `bottom-0` (absolute, no layout shift; the 32 px flex gap holds it). | Caption box does not intersect the card box at 390. |
| P1-6 | 6.2 | `LanyardScene.tsx` 104 to 105 | B4: `dpr={coarse ? [1, 1.5] : [1, 1.75]}`, `antialias: !coarse`. | Lower frame cost on phones. |
| P1-7 | 5.4 and 5.5 | `src/components/sections/contact/ContactForm.tsx` 6 and 55; `src/components/comments/CommentForm.tsx` (zod import) | A1: load validation on submit, `const { ContactInput, toFieldErrors } = await import('@/lib/validation/contact')`, or a dependency-free client validator with the same error codes plus a parity unit test against the zod schema. Server keeps zod. | First-load JS minus about 30 KB gzip. |
| P1-8 | orchestrator | `02-architecture.md` section 7 | Dated note: first-load JS budget 215 KB gzip level 9, `noModule` scripts excluded, reason: 141 KB framework floor. | Gate turns PASS after P1-7. |
| P1-9 | 6.1 then 5.2 | `src/components/motion/EntryItem.tsx` 10, 20, 29; `timing.ts` 50 to 54; `HeroSection.tsx` 51 to 57 | Chips stagger: `EntryItem` gains `index?: number` and `'li'` in `as`; `entryTransition` adds `index * 0.04` to the delay when not reduced (reduced stays delay 0). Hero renders a plain `ul` with one `EntryItem as="li" step="chips" index={i}` per chip. Add a `timing.test.ts` case. | Chip starts 40 ms apart, first at 560 ms. |
| P1-10 | 5.2 plus 5.1 (`globals.css`) | `HeroSection.tsx` 81; `src/app/globals.css` | Scroll arrow loop in CSS, no JS: wrap the icon in `<span className="scroll-nudge">`; in `globals.css` inside `@media (prefers-reduced-motion: no-preference)`: `@keyframes scroll-nudge { 0%, 100% { transform: translateY(0) } 50% { transform: translateY(6px) } }` and `.scroll-nudge { display: inline-flex; animation: scroll-nudge 1.6s ease-in-out 1.5s infinite }`. | Arrow loops after the entry; static under reduced motion. |
| P1-11 | 6.3 | `e2e/budgets.spec.ts` | Rerun after P0 and P1; exclude `noModule` scripts; add a mobile 320 and 390 hero overflow check and a strap-color pixel check. | Fresh `06-budgets.md`. |

### P2

| id | owner | fix |
|---|---|---|
| P2-1 | 6.1, 5.1, 5.3 | A3: `domMax` to `domAnimation` with CSS-driven tab pill and nav underline (17 to 20 KB). |
| P2-2 | 6.1 | A2: CountUp rAF tween instead of `animate()` (about 6 KB). |
| P2-3 | 6.2 | C2: strap control points from `object3D.getWorldPosition` into scratch, no `translation()` in `useFrame`. |
| P2-4 | 6.2 | C3: narrow the eslint disables, `scratch` as a ref, `'use client'` on line 1. |
| P2-5 | 6.2 | Match the static clip (`Band.tsx` 348 to 350: about `[0.2, 0.12, 0.06]`, metallic gradient color) and strap width 30 px (`STRAP_PX_K` calibration). |
| P2-6 | 6.2 | B5: yield between texture creation and `Physics` mount. |
| P2-7 | owner decision | B6: replace rapier with a Verlet rope (minus 834 KB gzip, minus about 520 ms at 4x). |

## F. Out of scope notes (for the orchestrator, not Phase 6)

- Projects grid shows 3 columns at 1440; DESIGN says 2 columns at >= 1024 (5.3).
- Detail page: the shared cover is below the fold at 1440 x 900, so the card to detail morph is barely visible; consider placing the cover above the stats or scrolling it into view (5.3).
- The MSX Baterias cover image shows the client's WhatsApp number. It is the client's public business number, not the owner's, but DESIGN's hard rule says "no WhatsApp number"; the owner should confirm or the cover should be cropped (content, 4.3).
- Contact section id is `contato` while 02-architecture section 1 says `#contact`; nav works, keep docs consistent.

## Exit criteria for Phase 6

All P0 done and verified with screenshots; P1-1 decided by the owner; P1-2 to P1-11 done; 6.3 rerun shows every row PASS with the re-based JS budget. Rewrites by Opus only if Sonnet fails a P0 twice.
