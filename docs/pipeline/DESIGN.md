# DESIGN.md

Single source of truth for UI. Source canvas (Claude Design): https://claude.ai/artifact/9R8bp8TAgJi2M9WPmgTBB6 (private). Dark, cinematic, one accent.

## Color tokens (dark only in v1)

| token | value | use |
|---|---|---|
| --bg | #07080B | page background |
| --surface | #0B0D12 | cards, panels |
| --surface-2 | #12151C | media placeholders, raised |
| --line | #1E212B | hairlines |
| --line-strong | #2A2E3A | outlines, chips |
| --text | #EDEEF2 | primary text |
| --muted | #9AA0AE | secondary text (>= 7:1 on --bg) |
| --accent | #C6FF3D | CTAs, active state, highlights (tweakable) |
| --on-accent | #07080B | text on accent |

Accent alternatives for the tweak: #7CF5C8, #FF7A45, #8FA2FF. Text on --muted must stay >= 4.5:1; never use --line-strong for text.

## Typography

- Display: Space Grotesk 700, tracking -0.04em (h1) to -0.02em (h3), line-height 0.98 to 1.1.
- Body: Inter 400/500/600, 16 to 22 px, line-height 1.5 to 1.6.
- Eyebrow: Space Grotesk 500, 12 to 14 px, uppercase, tracking 0.14em, --muted.
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
- Hero 3D: floating panels tilt toward the cursor (max 8 deg) and drift with scroll; resolves to the initials/logo mark when idle.
- Static during reading: body text and forms never animate.
- prefers-reduced-motion: no parallax or page transitions, only 120 ms fade; 3D replaced by a static poster.

## 3D fallbacks

No WebGL, low power, data-saver, or reduced motion: static poster image, 3D chunk never fetched. Off-screen or hidden tab: pause the render loop (frameloop on demand). Poster must be present in the initial HTML.

## Content rules

- Site copy in pt-BR. No invented facts, clients or testimonials. Missing data renders as an obvious TODO only in content files, never on the live page (hide the section instead).
- Client names and images appear only after the owner confirms permission.
- Contact: WhatsApp +55 (44) 99769-7028, contact@enzsoftwares.com, @enz.softwares, github.com/Luiz192512. LinkedIn is TODO.

## Accessibility contract

- Real buttons and links, visible focus ring (2 px --accent, offset 3 px), skip link to main, one h1 per page, landmarks.
- WCAG AA contrast, 44 px targets, meaningful alt text on covers, aria-label on the 3D region.
