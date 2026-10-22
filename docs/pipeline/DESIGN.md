# DESIGN.md

Single source of truth for UI. Source canvas (Claude Design): https://claude.ai/artifact/9R8bp8TAgJi2M9WPmgTBB6 (private). Dark, cinematic, one accent.

## Color tokens (dark only in v1, Enz Softwares brand blue)

Source of the blues: enzsoftwares-site/public/style.css and curbside/MARCA.md.

| token | value | use |
|---|---|---|
| --bg | #0B1220 | page background (brand navy) |
| --surface | #0E1728 | cards, panels |
| --surface-2 | #16233B | media placeholders, raised |
| --line | #1B2A44 | hairlines |
| --line-strong | #2A3D5E | outlines, chips |
| --text | #E8EDF5 | primary text |
| --muted | #9AA6B8 | secondary text (>= 7:1 on --bg) |
| --accent | #00A7F8 | CTAs, active state, highlights (Enz brand blue, 7.4:1 on --bg) |
| --glow | #11E5FE | cyan, lines and glow only (3D wireframe, HUD), never body text |
| --accent-deep | #0A58D0 | optional tweak, pressed state |
| --on-accent | #0B1220 | text on accent |

Accent tweak options: #00A7F8, #11E5FE, #0A58D0, #8FA2FF. Text on --muted must stay >= 4.5:1; never use --line-strong for text.

## Typography

- Display: Syne 700 (600 to 800 available), tracking -0.04em (h1) to -0.02em (h3), line-height 0.98 to 1.1.
- Body: Inter 400/500/600, 16 to 22 px, line-height 1.5 to 1.6.
- Labels, eyebrows, chips, counters captions, step numbers and the 3D HUD: DM Mono 400/500, 12 to 14 px, uppercase where it is an eyebrow, tracking 0.06 to 0.14em, --muted.
- Scale (desktop / mobile): h1 92 / 46, page title 80 / 40, h2 48 / 32, h3 28 / 22, lead 20 / 17, body 16 / 15.

## Layout

- Container max-width 1280 px, side padding 32 px (20 px on mobile).
- Section vertical rhythm 96 to 120 px desktop, 56 px mobile.
- Works grid: 2 columns desktop, 1 column below 720 px, gap 24 px (16 px mobile).
- Radii: cards 20, panels 24 to 28, chips and buttons 999.
- Touch targets >= 44 px (primary buttons 52 px on mobile).

## Components

- Header: wordmark "enz." (accent dot), nav Trabalhos / Sobre, pill CTA "Chamar no WhatsApp". Wraps on narrow widths. Active link uses --accent.
- Button primary: --accent fill, --on-accent text, weight 600, pill. Secondary: 1px --line-strong outline.
- Work card: cover (16:9-ish, 260 px desktop / 160 px mobile), eyebrow "year . kind", title h3, summary in --muted, stack line. Whole card is one link.
- Filter chip: button with aria-pressed; active = accent fill.
- Facts list (detail): label in --muted, value in --text, hairline separators.
- Footer: copyright + tagline "Código limpo · Soluções inteligentes · Impacto real".

## Pages (see canvas boards)

Home (desktop + mobile), Works index with filter, Work detail, About + Contact, States.

## Motion spec (Motion library, transform and opacity only)

- Micro (hover, press): 180 ms, ease-out cubic-bezier(0.2, 0.8, 0.2, 1). Buttons rise 2 px; cards rise 4 px, cover scales 1.03, border becomes --accent.
- Section reveal on scroll: 600 ms, opacity 0 to 1 and translateY 24 px to 0, once. List stagger 60 ms.
- Works index to detail: shared-element transition on the cover, 500 ms.
- Hero 3D: a wireframe torus (donut), cyberpunk minimal. Thin --accent lines for the tube rings, --glow for the long rings, monospace HUD labels ("TORUS // WIREFRAME", "SCROLL ROTATE", "ROT 042") and corner brackets. Rotation is bound to scroll progress in both directions (scroll down spins forward, scroll up spins back), eased with a spring (stiffness 80, damping 20), about 0.2 deg per scroll px on the Y axis plus a slow idle drift of 4 deg/s that stops at reduced motion. No fills, no bloom, no gradients: lines only.
- Static during reading: body text and forms never animate.
- prefers-reduced-motion: no parallax or page transitions, only 120 ms fade; 3D replaced by a static poster.

## 3D fallbacks

No WebGL, low power, data-saver, or reduced motion: static poster image (the SVG wireframe torus), 3D chunk never fetched. Off-screen or hidden tab: pause the render loop (frameloop on demand). Poster must be present in the initial HTML.

## Content rules

- Site copy in pt-BR. No invented facts, clients or testimonials. Missing data renders as an obvious TODO only in content files, never on the live page (hide the section instead).
- Client names and images appear only after the owner confirms permission.
- Contact: WhatsApp +55 (44) 99769-7028, contact@enzsoftwares.com, @enz.softwares, github.com/Luiz192512. LinkedIn is TODO.

## Reference-inspired patterns

Structure borrowed (not copied) from a reference portfolio the owner chose as a base: https://portofolio-rho-sand-92.vercel.app/ (someone else's site; reuse layout ideas only, never its text, photo, links or data).

- Hero status badge: pill with a --glow dot and "Disponível para trabalho", above the eyebrow. Shown only while the owner is available (content flag `availability` in site config).
- Hero tail: stack chips (DM Mono, 1px --line-strong pill) and a "role para explorar" hint.
- About with counters: short bio plus large number cards (Syne 72 px desktop / 56 px mobile, --accent) with DM Mono captions. Numbers must be derived from real content (works count, technologies count, languages of the Enz site), never invented.
- Showcase tabs on the Works page: Projetos (grid plus stack filter), Stack (3 groups), Certificados. The Certificados tab and its content render only when real certificates exist; until then the tab is hidden on the live site.
- Connect list: contact channels as full-width rows (label in DM Mono, value, arrow), each row one link, min height 44 px.
- Guestbook (comments with image upload) is out of scope for v1. Future phase: needs a backend (Supabase or similar), moderation and spam control. Do not build it before that decision.

## Accessibility contract

- Real buttons and links, visible focus ring (2 px --accent, offset 3 px), skip link to main, one h1 per page, landmarks.
- WCAG AA contrast, 44 px targets, meaningful alt text on covers, aria-label on the 3D region.
