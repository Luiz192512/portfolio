---
version: alpha
name: Portfolio Luiz Enz
description: Single source of truth for the pt-BR portfolio of Luiz Gustavo Lorençone Enz. Near-black base, grid plus vignette, dark glass, Syne plus DM Mono, one accent (Enz Softwares blue), 3D lanyard hero.
colors:
  bg: "#0D0D0D"
  surface-glass: "rgba(255,255,255,0.04)"
  surface-glass-fallback: "rgba(23,23,23,0.92)"
  surface-lanyard: "rgba(22,22,22,0.72)"
  line: "rgba(255,255,255,0.08)"
  line-glass: "rgba(255,255,255,0.10)"
  line-strong: "rgba(255,255,255,0.16)"
  line-strong-hover: "rgba(255,255,255,0.22)"
  grid-line: "rgba(255,255,255,0.035)"
  text: "#F0F0F0"
  text-muted: "#A3A3A3"
  text-subtle: "#8A8A8A"
  accent: "#00A7F8"
  accent-hover: "#38BBFA"
  link-hover: "#5CC8FF"
  on-accent: "#0D0D0D"
  danger: "#FF8A80"
  hero-gradient-top: "#B5B5B5"
  hero-gradient-bottom: "#6B6B6B"
typography:
  hero-line-1:
    fontFamily: Syne
    fontSize: 68px
    lineHeight: 0.92
    fontWeight: 800
    letterSpacing: -0.045em
  hero-line-2:
    fontFamily: Syne
    fontSize: 104px
    lineHeight: 0.92
    fontWeight: 800
    letterSpacing: -0.045em
  page-title:
    fontFamily: Syne
    fontSize: 80px
    lineHeight: 0.95
    fontWeight: 800
    letterSpacing: -0.04em
  h2:
    fontFamily: Syne
    fontSize: 64px
    lineHeight: 1
    fontWeight: 800
    letterSpacing: -0.04em
  h3:
    fontFamily: Syne
    fontSize: 28px
    lineHeight: 1.15
    fontWeight: 700
    letterSpacing: -0.02em
  stat:
    fontFamily: Syne
    fontSize: 64px
    lineHeight: 1
    fontWeight: 800
    letterSpacing: -0.03em
  body-lead:
    fontFamily: Syne
    fontSize: 18px
    lineHeight: 1.6
    fontWeight: 400
  body-small:
    fontFamily: Syne
    fontSize: 15px
    lineHeight: 1.55
    fontWeight: 400
  typewriter:
    fontFamily: DM Mono
    fontSize: 20px
    lineHeight: 1.4
    fontWeight: 400
  mono-label:
    fontFamily: DM Mono
    fontSize: 12px
    lineHeight: 1.4
    fontWeight: 400
    letterSpacing: 0.2em
  mono-hint:
    fontFamily: DM Mono
    fontSize: 13px
    lineHeight: 1.5
    fontWeight: 400
rounded:
  pill: 999px
  input: 14px
  tile: 16px
  tile-lg: 20px
  lanyard: 22px
  card: 24px
  panel: 28px
spacing:
  "1": 4px
  "2": 8px
  "3": 12px
  "4": 16px
  "5": 20px
  "6": 24px
  "7": 28px
  "8": 32px
  "10": 40px
  "12": 48px
  "16": 64px
  "18": 72px
  "28": 112px
  container: 1280px
  content: 1200px
  gutter-desktop: 40px
  gutter-mobile: 16px
  touch-min: 44px
components:
  button-primary:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.on-accent}"
    rounded: "{rounded.pill}"
    height: 48px
  button-primary-hover:
    backgroundColor: "{colors.accent-hover}"
    textColor: "{colors.on-accent}"
  button-outline:
    backgroundColor: "transparent"
    textColor: "{colors.text}"
    rounded: "{rounded.pill}"
    height: 48px
  button-disabled:
    backgroundColor: "transparent"
    textColor: "{colors.text-subtle}"
    rounded: "{rounded.pill}"
    height: 48px
  chip:
    backgroundColor: "rgba(255,255,255,0.03)"
    textColor: "{colors.text}"
    rounded: "{rounded.pill}"
    padding: 8px 14px
  card:
    backgroundColor: "{colors.surface-glass}"
    textColor: "{colors.text}"
    rounded: "{rounded.card}"
  input:
    backgroundColor: "rgba(0,0,0,0.25)"
    textColor: "{colors.text}"
    rounded: "{rounded.input}"
    height: 48px
  tab-active:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.on-accent}"
    rounded: "{rounded.pill}"
    height: 44px
  badge-pinned:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.on-accent}"
    rounded: "{rounded.pill}"
---

# DESIGN.md

Canvas (private, Claude Design): https://claude.ai/artifact/7mbESdo4rkEXomYxmtkg2N. Built from `design-direction.md` (Phase 1) and `00-brief.md`. Where this file and `design-direction.md` differ, a dated note says why; this file wins. Supersedes the earlier navy and torus DESIGN.md (removed in the working tree before this version).

## Overview

Personal portfolio of Luiz Gustavo Lorençone Enz, Desenvolvedor Full Stack Júnior and founder of Enz Softwares. Site copy is pt-BR. The layout and entry choreography re-create the reference structure (near-black base, grid plus vignette, dark glass, Syne plus DM Mono); identity, copy and photo are the owner's. Nothing from the reference owner (name, text, photo, .glb, handles) is used.

One accent only: Enz Softwares blue, so the portfolio and the company read as the same person. The signature element is the 3D lanyard: the blue strap is the one colored object in the hero, everything else stays grayscale.

Hard content rules: no phone, no WhatsApp number, no home address (city "Maringá, PR" only). No invented certificates, metrics, testimonials or comments. Missing facts are hidden or shown as an honest empty state, never faked.

## Colors

All ratios use the WCAG relative luminance formula. Glass surfaces sit at about #171717 effective, so ratios on glass are listed where they matter.

| token | value | on --bg | on glass | use |
|---|---|---|---|---|
| bg | #0D0D0D | base | | page |
| surface-glass | rgba(255,255,255,0.04) | | | cards, panels, navbar, tabs track |
| line | rgba(255,255,255,0.08) | | | hairlines, separators (never text) |
| line-glass | rgba(255,255,255,0.10) | | | glass border |
| line-strong | rgba(255,255,255,0.16) to 0.22 | | | chips, outline buttons, inputs (never text) |
| grid-line | rgba(255,255,255,0.035) | | | background grid, decorative only |
| text | #F0F0F0 | 17.0:1 | 15.6:1 | primary text |
| text-muted | #A3A3A3 | 7.7:1 | 7.1:1 | body copy, captions |
| text-subtle | #8A8A8A | 5.6:1 | 5.2:1 | mono hints, meta, disabled labels |
| accent | #00A7F8 | 7.3:1 | 6.7:1 | active nav, eyebrow labels, links, strap, primary button, focus ring |
| accent-hover | #38BBFA | 8.9:1 | | primary button hover |
| link-hover | #5CC8FF | 10.0:1 | | inline link hover |
| on-accent | #0D0D0D | 7.3:1 on accent | | text on primary button, active tab, FIXADO badge, strap text |
| danger | #FF8A80 | 8.5:1 | 7.9:1 | form errors |

Rules:

- Gray text never goes below text-subtle. The line tokens never carry text.
- Hero line 2 ("Full Stack") uses a vertical gradient from hero-gradient-top to hero-gradient-bottom. Lowest point is 3.7:1 at 104 px, valid because it is large text (AA 3:1).
- Accent is the only chromatic color. No second accent, no gradient washes, no colored glows.
- Text over the strap (blue) must be on-accent. Never let nav text sit over the strap (see Layout, dated note 2026-10-22).

## Themes

Dark is the default and the only theme designed in the canvas. Light tokens are defined for a possible v1 light theme (decision deferred to Phase 2). The frontmatter holds dark values; light values live here only.

| token | dark | light | light ratio on #FAFAFA |
|---|---|---|---|
| bg | #0D0D0D | #FAFAFA | base |
| surface-glass | rgba(255,255,255,0.04) | rgba(0,0,0,0.03) | |
| line | rgba(255,255,255,0.08) | rgba(0,0,0,0.08) | |
| text | #F0F0F0 | #141414 | 17.6:1 |
| text-muted | #A3A3A3 | #525252 | 7.5:1 |
| text-subtle | #8A8A8A | #6B6B6B | 5.1:1 |
| accent | #00A7F8 | #0369A1 | 5.7:1 |
| on-accent | #0D0D0D | #FFFFFF | 5.9:1 on accent |
| danger | #FF8A80 | #B42318 | 6.3:1 |

Light theme triggers on `prefers-color-scheme: light` only if Phase 2 ships it; the background grid becomes rgba(0,0,0,0.04).

## Typography

- Syne (next/font, variable 400 to 800) for display and text. Display 800, headings 700, body 400 to 600.
- DM Mono (300 to 500) for labels, chips, hints, nav links, stat captions, typewriter, strap text. Eyebrow labels are uppercase, 12 px, tracking 0.2em, color accent.
- Syne 800 is extremely wide: one character averages about 0.82 of the font size, and "Desenvolvedor" measures about 11.4 times the font size. Any H1 or H2 copy change must be checked against its column width before shipping.

| role | desktop | mobile (390) | weight | line-height | tracking |
|---|---|---|---|---|---|
| Hero H1 line 1 "Desenvolvedor" | 68 | 30 | 800 | 0.92 | -0.045em |
| Hero H1 line 2 "Full Stack" (gradient) | 104 | 46 | 800 | 0.92 | -0.045em |
| About name / page title | 80 | 32 to 40 | 800 | 0.95 | -0.04em |
| Section H2 | 64 | 40 | 800 | 1.0 | -0.04em |
| H3 card title | 28 | 22 | 700 | 1.15 | -0.02em |
| Stat number | 64 | 34 | 800 | 1.0 | -0.03em |
| Lead / body | 18 | 16 | 400 | 1.6 | 0 |
| Small body | 15 | 14 | 400 | 1.55 | 0 |
| Typewriter (mono) | 20 | 16 | 400 | 1.4 | 0 |
| Mono label | 12 | 11 | 400 | 1.4 | 0.12 to 0.2em |
| Mono hint | 13 | 12 | 400 | 1.5 | 0 |

Dated note 2026-10-22 (Phase 1 gate): `design-direction.md` set the whole hero H1 at 104 / 48. Rendered, "Desenvolvedor" at 104 px measured about 1180 px and overflowed the text column into the lanyard on desktop; at 48 px it was clipped on mobile. Fix: the H1 keeps two lines, line 1 at 68 / 30 and line 2 at 104 / 46, both `white-space: nowrap`. Between breakpoints use `clamp()` so line 1 never exceeds column width / 11.4.

## Layout

- Container max 1280 (content sections 1200), side gutter 40 desktop, 16 mobile. No horizontal page scroll at any width from 320 up.
- Section padding 112 top and bottom desktop, 56 mobile.
- Spacing scale (px): 4, 8, 12, 16, 20, 24, 28, 32, 40, 48, 64, 72, 112.
- Radii: chips, buttons, navbar, tabs 999; inputs 14; small tiles 16 to 20; lanyard card 22; cards 24; large panels 28.
- Touch targets 44 minimum everywhere (desktop too, nav links included); primary buttons 48 desktop, 52 mobile and full width on mobile.

| breakpoint | layout |
|---|---|
| >= 1024 | Hero: text column `flex: 1 1 800px`, lanyard column 360 fixed, gap 32. Projects grid 2 columns, gap 24. Tech grid 4 columns. Stats 3 columns. About: text plus round photo side by side. Contact: form card and comments card side by side (flex-wrap, 480 and 420 basis). |
| 768 to 1023 | Hero stacks: lanyard above text, centered. Projects 2 columns. Tech 3 columns. Contact cards stack. |
| < 768 | Single column. Navbar collapses to wordmark plus 44 px menu button (aria-expanded) opening a glass sheet. Lanyard 330 tall above the badge. Projects 1 column. Tech 2 columns. Stats stay 3 columns (34 px numbers, 10 to 11 px captions). Detail buttons full width, stacked. Background grid 48 px. |

Dated note 2026-10-22 (Phase 1 gate): the strap originally started above the viewport and crossed the navbar behind the "Portfolio" link (about 1.3:1 text contrast). Rule: the lanyard anchor sits at least 16 px below the navbar bottom, and the WebGL canvas never renders strap pixels under navbar text.

## Elevation & Depth

Background is a fixed layer at z-index -10, in this order:

1. bg #0D0D0D.
2. Grid: 1 px lines grid-line every 64 px (48 px below 768).
3. Vignette: `radial-gradient(ellipse 80% 70% at 50% 40%, transparent 0%, rgba(13,13,13,.55) 60%, #0D0D0D 100%)`. Mobile uses `ellipse 120% 60% at 50% 25%`.

Glass recipe (cards, panels, navbar, tab track, badge):

```
background: rgba(255,255,255,0.04);
border: 1px solid rgba(255,255,255,0.10);
backdrop-filter: blur(16px) saturate(140%);
box-shadow: inset 0 1px 0 rgba(255,255,255,0.06), 0 24px 48px -24px rgba(0,0,0,0.6);
```

Fallback when `backdrop-filter` is unsupported: background surface-glass-fallback. Lanyard card uses surface-lanyard so the photo frame reads over the grid. The WebGL canvas is fixed over the hero only. Z order: background (-10), content (1), lanyard canvas (1, pointer events only on the card), header (50), mobile menu sheet (60).

## Components

Every interactive element shows a focus ring: 2 px accent, offset 3 px (2 px on inputs; file upload labels use `:focus-within`). Implemented globally with `:focus-visible`.

| component | anatomy and states |
|---|---|
| Navbar pill | Glass, max 1080, radius 999. Wordmark "luiz.enz" (accent dot, Syne 700 20) links to #home, 44 tall. Links Início, Sobre, Portfolio, Contato in DM Mono 14, inline-flex 44 tall. Default text-muted; hover text; active (scroll-spy) text plus 1 px accent underline that slides (layoutId) and `aria-current="true"`. Mobile: menu button 44 round, aria-label "Abrir menu"/"Fechar menu", aria-expanded, sheet traps focus, Esc closes. |
| Badge | Glass pill, DM Mono 12, tracking 0.14em, accent star icon, "DISPONÍVEL PARA TRABALHO". Rendered only while the `available` flag is true. |
| Typewriter | DM Mono, accent, prefix "> ", block cursor 10 x 22 accent. The `p` carries aria-label with the first phrase; the animated text and cursor are aria-hidden. |
| Chip | DM Mono 13, line-strong outline, 8 x 14 padding, not interactive. |
| Mono hint | DM Mono 13, text-subtle, prefix "// ". |
| Scroll indicator | "ROLAR" plus arrow, DM Mono 11 tracking 0.3em, text-muted, link to #about, 44 tap area. |
| Lanyard | Strap (accent, 30 wide desktop, 22 mobile) with DM Mono 11 on-accent text "LUIZ ENZ · FULL STACK" repeating; metal clip; glass card (surface-lanyard, radius 22, 300 wide desktop, 196 mobile) with slot, photo (assets/photo.jpg, alt "Foto de Luiz Gustavo Lorençone Enz"), name "Luiz Gustavo Enz", role "FULL STACK JÚNIOR", footer "MARINGÁ, PR" and "3D CARD" (accent). Caption "ARRASTE O CRACHÁ" hidden when static. Static fallback: same composition as an image in a fixed aspect box. |
| Button primary | Accent fill, on-accent text, Syne 700 15, height 48 (52 mobile). Hover accent-hover and y -2. Pressed y 0. Loading: spinner plus label "Enviando...", aria-busy. |
| Button outline | Transparent, 1 px line-strong-hover, text. Hover border accent. |
| Button ghost | "Ver mais" / "Ver menos": DM Mono 14, glass fill, 48 tall. |
| Button disabled | Dashed 1 px line-strong-hover, text-subtle, `disabled` plus `aria-disabled="true"`, cursor not-allowed. Used for "Sem demo no ar" and "Repositório privado". |
| Stat card | Glass, radius 24, padding 28: accent icon, number (count-up), DM Mono caption text-muted, DM Mono source line text-subtle. Zero values render the number in text-subtle. |
| Quote card | Glass figure with accent quote icon and DM Mono blockquote. Rendered only when `motto` exists in content (currently missing, so hidden). |
| Segmented tabs | Glass track, `role="tablist"`, three `role="tab"` buttons 44 tall with aria-selected and aria-controls, roving tabindex, Left/Right/Home/End keys. Sliding accent pill behind the active tab; active label on-accent weight 500, inactive text-muted. |
| Project card | Glass article, radius 24, cover 220 (150 mobile) shared with detail, DM Mono kind (text-subtle), H3, 3-line clamp summary, footer with link status and "Detalhes" (44 tall outline). Hover/focus-within: y -4 and border accent at 45%. |
| Empty state | Glass, centered: accent icon 40, H3, one line text-muted, action button. |
| Tech item | Glass tile radius 16, 44 min height: 32 x 32 monogram (accent on accent 12% fill, aria-hidden) plus name Syne 600 15. Grouped by category with a DM Mono label. |
| Detail page | Back link "Voltar" (44), eyebrow kind, H1 80 / 40, summary, 2 stat tiles (tech count, feature count), demo and repo buttons (disabled variants when absent), tech chips, cover, features glass panel with accent bullets. |
| Contact form | Labels visible above fields (DM Mono 12 uppercase text-muted). Inputs 48 tall, radius 14, leading 16 px icon at left 16, padding-left 46, placeholder text-subtle. Focus: accent outline replaces border. Error: border and message in danger, linked with aria-describedby. Status line `role="status"`: sending, "Mensagem enviada. Respondo pelo e-mail." or the error reason. Hidden honeypot field `company` (tabindex -1, aria-hidden). |
| Connect list | Full-width rows 52 tall with top hairline: DM Mono label (text-muted, 110 wide desktop, 78 mobile), value, arrow ↗ aria-hidden. Hover value accent. Rows: LinkedIn, GitHub, Instagram @enz.softwares, Site, E-mail. No phone, no address. |
| Comments panel | Glass panel radius 28. Header "Comentários" plus count. Form: name (max 40), comment (max 500, counter), optional image (JPG, PNG, WebP up to 2 MB; dashed upload label with focus-within ring), "Publicar comentário". Empty state. Item: avatar initial circle 40, name, date, FIXADO badge (accent pill, on-accent DM Mono 10) when pinned, pinned items have accent 35% border and accent 6% fill. Hidden items never render. |
| Loading skeleton | Same box sizes as the real card; shimmer gradient white 5% to 10%; static under reduced motion; container `role="status"` aria-label "Carregando projetos". |

## Motion

Library: Motion (`motion/react`). Transform and opacity only. Easing tokens: `expo-out = cubic-bezier(0.16, 1, 0.3, 1)`, `micro = cubic-bezier(0.2, 0.8, 0.2, 1)`. Hero container uses `delayChildren` and `staggerChildren: 0.1`; each child has its own `initial` and `animate`.

### Entry animation timeline (first load, no loader screen)

| element | delay | duration | easing | transform | reduced motion |
|---|---|---|---|---|---|
| Background layer (grid, vignette) and WebGL canvas creation | 0 ms | 150 ms | linear | opacity 0 to 1 | present at once, no fade |
| Hero H1 | 160 ms | 1200 ms | expo-out | opacity 0 to 1, scale 0.85 to 1, y 50 to 0 | opacity only, 200 ms, delay 0 |
| Lanyard card | 200 ms | about 1400 ms to settle | rapier physics (gravity -40, joint damping 4) | drops from y -4 world units above the anchor, swings on a 4 joint rope until rest | static image, no physics, opacity 200 ms |
| Badge | 260 ms | 800 ms | expo-out | opacity 0 to 1, y 24 to 0 | opacity only, 200 ms |
| Navbar pill | 350 ms | 1000 ms | expo-out | opacity 0 to 1, y -40 to 0 | opacity only, 200 ms |
| Typewriter line | 360 ms | 800 ms | expo-out | opacity 0 to 1, y 24 to 0; typing starts at 1000 ms, 55 ms per char, hold 1800 ms, delete 30 ms per char | first phrase static, cursor not blinking |
| Paragraph | 460 ms | 800 ms | expo-out | opacity 0 to 1, y 24 to 0 | opacity only, 200 ms |
| Stack chips | 560 ms | 800 ms | expo-out | opacity 0 to 1, y 16 to 0, inner stagger 40 ms | opacity only, 200 ms |
| Mono hints | 660 ms | 800 ms | expo-out | opacity 0 to 1, y 16 to 0 | opacity only, 200 ms |
| Scroll indicator | 900 ms | 600 ms, then loop | expo-out, loop ease-in-out 1.6 s | opacity 0 to 1, then arrow y 0 to 6 to 0 | visible, no loop |

Note 2026-10-22 (phase 7): the timeline values are unchanged. The Paragraph row is now driven by a CSS animation (`.entry-paragraph` in `globals.css`, same 460 ms delay, 800 ms, expo-out, y 24 to 0; reduced motion is opacity only, 200 ms) instead of Motion, so it starts at first paint and does not wait for hydration. This moves the mobile LCP candidate earlier. H1 and navbar are untouched.

Order check against the reference spec: background 0 ms, H1 160 ms, navbar 350 ms. Children stagger 100 ms (inside the 80 to 120 ms window). Everything is done by about 1460 ms; the lanyard settles around 1600 ms. Phase 6 tolerance: plus or minus 150 ms per row. The H1 animates as one block (both lines together), even though its lines use different sizes.

### Other motion

| element | trigger | duration | easing | transform | reduced motion |
|---|---|---|---|---|---|
| Section reveal (labels, titles, cards) | enters viewport 20%, once | 700 ms, stagger 80 ms | expo-out | opacity 0 to 1, y 32 to 0 | opacity only, 200 ms |
| Tab pill | tab change | 450 ms | expo-out (or spring stiffness 380, damping 32) | x to active tab | instant |
| Tab panel swap | tab change | 300 ms | micro | out: opacity 0, y -8; in: opacity 1, y 8 to 0 | opacity only, 120 ms |
| Card hover | hover, focus-visible | 180 ms | micro | y 0 to -4, border to accent 45% | border only |
| Button hover | hover | 180 ms | micro | y 0 to -2, bg to accent-hover | color only |
| Nav underline (scroll-spy) | active section changes | 300 ms | expo-out | layoutId underline slides between links | instant |
| Stat count-up | stat enters viewport, once | 1200 ms | expo-out | number 0 to value (integer) | final value shown |
| Card to detail | navigation | 500 ms | expo-out | shared cover (layoutId) | crossfade 120 ms |
| Typewriter cursor | always | 1000 ms steps(2) | step | opacity blink | solid |
| Lanyard drag | pointer and touch | physics | rapier | kinematic grab, release swings | not rendered |
| Mobile menu sheet | toggle | 300 ms | expo-out | opacity 0 to 1, y -8 to 0 | opacity only, 120 ms |
| Skeleton shimmer | while loading | 1200 ms loop | linear | background-position | static |

Body text and form fields never animate after entry.

## 3D rules

- Scene: React Three Fiber plus `@react-three/rapier`. Lanyard = 4 joint rope (rope joints plus one spherical joint) from a fixed anchor to the card; strap is a MeshLine with the accent color and repeating mono text texture; card front uses the owner photo and the same composition as the static card.
- Anchor at least 16 px below the navbar bottom (dated note 2026-10-22); strap pixels never under navbar text.
- Canvas created at 0 ms; the scene chunk loads with dynamic import after first paint. The static card is in the initial HTML inside a fixed aspect box and is swapped when the scene is ready, with no layout shift.
- No WebGL, `prefers-reduced-motion`, Save-Data or low-power: static card only, the 3D chunk is never fetched, and the caption "ARRASTE O CRACHÁ" is removed.
- Frameloop paused when the hero is off-screen or the tab is hidden; dpr clamped to [1, 1.75].
- Drag is decorative: never the only way to reach any content. Region aria-label: "Crachá 3D com a foto de Luiz Gustavo, arraste para balançar". Canvas itself aria-hidden.

## Accessibility rules

- WCAG 2.1 AA. Text 4.5:1 minimum (3:1 only for text 24 px and larger). All token ratios above pass.
- `lang="pt-BR"`. One h1 per page. Landmarks: header, nav aria-label "Principal", main, section with aria-labelledby, footer. Skip link "Pular para o conteúdo" as the first focusable element.
- Focus ring on every interactive element (see Components). Never remove outlines without the replacement ring.
- Touch targets 44 x 44 minimum, nav links and wordmark included.
- Tabs follow the WAI-ARIA tabs pattern (roving tabindex, arrow keys, aria-controls to a `role="tabpanel"`).
- Forms: visible labels, errors tied with aria-describedby, status in `role="status"`, required fields marked with `required` and the label text.
- Decorative SVG and the grid are aria-hidden; icon-only buttons have aria-label.
- Images: owner photo alt "Foto de Luiz Gustavo Lorençone Enz" where it carries meaning; empty alt where the name sits beside it.
- Disabled actions use `disabled` plus `aria-disabled="true"` and a visible text reason ("Sem demo no ar", "Repositório privado").
- Reduced motion handled per row in the motion tables.

## Copy deck (pt-BR)

Voice: direct, first person, no hype. Use "back-end" and "front-end" hyphenated. Use vírgula, dois-pontos ou parênteses instead of dashes.

### Navegação e global

- Wordmark: "luiz.enz"
- Links: "Início", "Sobre", "Portfolio", "Contato"
- Menu mobile: "Abrir menu" / "Fechar menu"
- Skip link: "Pular para o conteúdo"
- Rodapé: "© 2026 Luiz Gustavo Lorençone Enz" plus "Feito com Next.js, Motion e Three.js"

### Início (hero)

- Badge: "DISPONÍVEL PARA TRABALHO"
- H1: "Desenvolvedor" / "Full Stack"
- Typewriter: "Full Stack Júnior", "Back-end com Cloudflare Workers", "Construindo CRMs e lojas"
- Parágrafo: "Estudante de Engenharia de Software e fundador da Enz Softwares. Crio sites e sistemas para pequenos negócios e construí o Curbside, um CRM de prospecção com back-end em Cloudflare Workers."
- Chips: "TypeScript", "React", "Cloudflare Workers"
- Dicas: "// explore meus projetos abaixo", "// aberto a vagas júnior e trainee remotas"
- Crachá: "Luiz Gustavo Enz", "FULL STACK JÚNIOR", "MARINGÁ, PR", "3D CARD"; legenda "ARRASTE O CRACHÁ"; strap "LUIZ ENZ · FULL STACK"
- Indicador: "ROLAR"

### Sobre

- Eyebrow: "SOBRE MIM"
- Nome: "Luiz Gustavo" / "Lorençone" / "Enz" (last line text-subtle)
- Bio: "Estudante de Engenharia de Software na UniCesumar, com curso técnico em Desenvolvimento de Sistemas. Fundador da Enz Softwares, crio sites e sistemas para pequenos negócios. Tenho afinidade com back-end e busco uma vaga júnior ou trainee remota, de preferência em times internacionais."
- Lema: hidden until provided (TODO from the owner).
- Botões: "Baixar currículo" (PDF in public/), "Ver projetos"
- Stats: "5" "PROJETOS" "projetos neste portfolio"; "0" "CERTIFICADOS" "nenhum publicado ainda"; "3" "EXPERIÊNCIAS" "estágio, Enz Softwares, Kaêra Parts"

### Portfolio

- Eyebrow: "PORTFOLIO"; H2: "Vitrine de projetos"
- Intro: "Projetos próprios e de clientes, certificados e as tecnologias que uso no dia a dia."
- Abas: "Projetos", "Certificados", "Tech Stack" (mobile: "Stack")
- Card: "Detalhes"; mais: "Ver mais" / "Ver menos"
- Status de link: "Ferramenta privada", "Sem link", or the domain
- Certificados vazio: "Nenhum certificado publicado ainda" / "Os certificados aparecem aqui assim que forem adicionados. Enquanto isso, veja os projetos." / "Ver projetos"
- Grupos da stack: "LINGUAGENS", "FRONT-END E MOBILE", "BACK-END", "DADOS", "FERRAMENTAS"

### Projetos (summaries)

| projeto | tipo | resumo | link | repo |
|---|---|---|---|---|
| Curbside | PRODUTO PRÓPRIO | CRM de prospecção internacional (BR, PT, ES, US) com back-end em Cloudflare Workers e D1, front em JS com Motion e Leaflet, e app em React Native com Expo. | Ferramenta privada | Repositório privado |
| Enz Softwares | SITE DA EMPRESA | Site de uma página em 4 idiomas, com formulário que monta a mensagem para WhatsApp ou e-mail, servido por Cloudflare Worker com CSP. | enzsoftwares.com | Repositório privado |
| TSZR15 Store | E-COMMERCE | Loja para Yamaha R15 em Next.js 16 e Supabase, com Mercado Pago, checkout via WhatsApp, painel admin e rastreio de pedidos. | Sem demo no ar | github.com/Luiz192512/TSZR15 |
| MSX Baterias | CLIENTE | Landing page mobile-first em Next.js 14 com localizador de bateria, blog, SEO local e GA4. | bateriasmsx.com.br (verify in QA) | Repositório privado |
| G7 Arena Padel CRM | CLIENTE, PILOTO | Piloto de CRM em Next.js 16, Prisma, Neon e R3F: agenda, financeiro e painel do dono. Os dados da demonstração são fictícios. | g7-padel-crm.vercel.app | Repositório privado |

### Detalhe do projeto

- "Voltar", stat captions "TECNOLOGIAS USADAS" (mobile "TECNOLOGIAS") and "FUNCIONALIDADES", buttons "Ver demo" / "Sem demo no ar", "Ver repositório" / "Repositório privado", panel "Funcionalidades principais", chips heading "TECNOLOGIAS USADAS".

### Contato

- Eyebrow: "CONTATO"; H2: "Fale comigo"; intro: "Vagas, projetos ou uma conversa sobre back-end. Respondo pelo e-mail."
- Form title: "Envie uma mensagem"; labels "NOME", "E-MAIL", "MENSAGEM"; placeholders "Seu nome", "voce@email.com", "Conte um pouco sobre a vaga ou o projeto"
- Button: "Enviar mensagem"; sending "Enviando..."; success "Mensagem enviada. Respondo pelo e-mail."; errors "Preencha seu nome.", "Informe um e-mail válido.", "Escreva uma mensagem.", "Não foi possível enviar agora. Tente de novo ou escreva para enz.luizgustavo@gmail.com."
- Connect heading: "CONECTE-SE"; rows "LinkedIn", "GitHub", "Instagram", "Site", "E-mail"

### Comentários

- Title "Comentários"; count "0 comentários" / "1 comentário" / "N comentários"
- Labels "NOME", "COMENTÁRIO"; placeholders "Como quer aparecer", "Deixe um recado"; upload "Imagem opcional (JPG, PNG ou WebP, até 2 MB)"; button "Publicar comentário"
- Empty: "Nenhum comentário ainda" / "Seja a primeira pessoa a deixar um recado."
- Badge "FIXADO"; errors "Imagem acima de 2 MB.", "Formato não aceito.", "Muitos comentários seguidos. Tente de novo em alguns minutos."
- The canvas layout example ("[nome do visitante]") is a design placeholder and never ships.

## Content model hints

- `content/profile.ts`: name, shortName, role, location ("Maringá, PR"), bio, motto (optional; quote card hidden when absent), available (boolean, drives the badge), typewriterPhrases[], heroChips[], cvPath, links { linkedin, github, instagram, site, email }. No phone or address fields exist.
- `content/projects/*.ts` (or MDX): slug, title, kind, summary, cover (copied to public/ in Phase 4), coverAlt, stack[], features[], liveUrl (optional), linkStatus ("private-tool" | "none" | "live"), repoUrl (optional; only TSZR15 today), order, featured. Stat "Projetos" = file count. Fictional demo data must be stated in the summary.
- `content/certificates/*`: empty today; tab shows the empty state; stat shows 0 in text-subtle.
- `content/experience.ts`: role, org, start, end (null = atual). Stat "Experiências" = entry count (3).
- `content/stack.ts`: groups { label, items { name, monogram } }.
- Comments (Neon Postgres): id, name (<= 40), body (<= 500), imageUrl (optional), createdAt, pinned (bool), hidden (bool). Rate limited per IP; moderation by flags only.
- Contact (Resend): name, email, message, honeypot `company`; keys only in env (RESEND_API_KEY, DATABASE_URL).

## Do's and Don'ts

- Do keep accent as the only chromatic color; the strap is the hero's one colored object.
- Do show honest empty states (certificates, comments) instead of hiding the structure the owner asked for.
- Don't publish a phone number, WhatsApp number or home address.
- Don't invent certificates, metrics, testimonials or comments; the comment layout example never ships.
- Don't reuse anything from the reference owner (name, copy, photo, .glb, handles).
- Don't put text on line tokens or below text-subtle.
- Don't animate anything other than transform and opacity.

## Dated notes from Phase 2 (2026-10-22): deviations from this document
Source of truth for these is 02-architecture.md section 12.1. Where they conflict with earlier sections, these notes win.
- D1. Card to detail uses named View Transitions instead of Motion layoutId (App Router unmounts the previous page). 500 ms expo-out; reduced motion 120 ms crossfade.
- D2. Tab panel swap has no exit phase; the entering panel animates in (300 ms).
- D3. The WebGL canvas is created when the scene chunk arrives (after first paint and idle), not at 0 ms; the static card is visible from first paint. The lanyard row is excluded from the plus or minus 150 ms tolerance.
- D4. Comments are pre-moderated and text-only in v1; the upload field is not rendered.
- D5. Light theme is not shipped in v1.
- D6. Entry items use absolute per-element delays from the timeline table instead of parent staggerChildren.
- D7. Card and button hover run as CSS transitions, not Motion.
- New pt-BR copy additions live in 02-architecture.md section 12.2 and go into src/lib/copy.ts.
