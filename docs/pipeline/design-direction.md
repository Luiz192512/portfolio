# Design direction (Phase 1)

Canvas (Claude Design, private): https://claude.ai/artifact/7mbESdo4rkEXomYxmtkg2N

Direction: re-creation of the reference portfolio's layout and entry choreography (near-black base, grid plus vignette, dark glass, Syne plus DM Mono) with the owner's identity from 00-brief.md. One accent: Enz Softwares brand blue, so the portfolio and the company read as the same person. Site copy is pt-BR. Nothing from the reference owner (name, text, photo, .glb, handles) is used.

Signature element: the 3D lanyard. The strap is the accent blue with the mono text "LUIZ ENZ · FULL STACK" and the card carries the owner's photo (assets/photo.jpg), name and role. Everything else stays quiet and grayscale so the blue strap is the one colored object in the hero.

## Artboards

| file | content |
|---|---|
| Main.dc.html | 01 Home desktop: navbar pill, badge, H1, typewriter, paragraph, chips, hints, lanyard, scroll indicator |
| About.dc.html | 02 Sobre desktop: label, name on 3 lines, circular photo with gradient ring and mask, bio, motto card (TODO), CV and projects buttons, 3 stat cards |
| Portfolio.dc.html | 03 Portfolio, interactive: sliding tab pill (Projetos, Certificados empty state, Tech Stack), project grid, "Ver mais" |
| ProjectDetail.dc.html | 04 Detail for TSZR15 Store: back link, stats, disabled demo button, repo button, tech chips, features panel |
| Contact.dc.html | 05 Contato: form with icon inputs and states, Conecte-se list, Comentários panel (empty state plus a clearly labeled layout example with FIXADO badge) |
| Mobile.dc.html | 06 Home, Sobre and Portfolio tabs at 390 px |
| Tokens.dc.html | 07 Color tokens dark and light with ratios, type, glass recipe, buttons and focus |
| Motion.dc.html | 08 Entry timeline chart |

## Color tokens

Contrast computed with the WCAG relative luminance formula. Glass surfaces sit at about #171717 effective; ratios on glass are listed where they matter.

### Dark (default)

| token | hex | ratio on --bg | use |
|---|---|---|---|
| --bg | #0D0D0D | base | page |
| --surface-glass | rgba(255,255,255,0.04) (about #171717) | | cards, panels, navbar |
| --line | rgba(255,255,255,0.08) | | hairlines, separators |
| --line-strong | rgba(255,255,255,0.16) to 0.22 | | chips, outline buttons, inputs (never text) |
| --text | #F0F0F0 | 17.0:1 | primary text |
| --text-muted | #A3A3A3 | 7.7:1 (7.1:1 on glass) | body copy, captions |
| --text-subtle | #8A8A8A | 5.6:1 (5.2:1 on glass) | mono hints, meta, disabled labels |
| --accent | #00A7F8 | 7.3:1 (6.7:1 on glass) | active nav, labels, links, strap, primary button, focus ring |
| --accent-hover | #38BBFA | 8.9:1 | primary button hover |
| --on-accent | #0D0D0D | 7.3:1 on accent | text on primary button, active tab, FIXADO badge |
| --danger | #FF8A80 | 8.5:1 | form errors |

### Light (prefers-color-scheme: light, optional in v1)

| token | hex | ratio on --bg |
|---|---|---|
| --bg | #FAFAFA | base |
| --surface-glass | rgba(0,0,0,0.03) | |
| --line | rgba(0,0,0,0.08) | |
| --text | #141414 | 17.6:1 |
| --text-muted | #525252 | 7.5:1 |
| --text-subtle | #6B6B6B | 5.1:1 |
| --accent | #0369A1 | 5.7:1 |
| --on-accent | #FFFFFF | 5.9:1 on accent |
| --danger | #B42318 | 6.3:1 |

Rules: gray text never below --text-subtle; --line tokens never carry text; the grid lines (rgba 255,255,255,0.035) are decorative only.

## Typography

- Display and text: Syne (next/font, weights 400 to 800). Display 800, headings 700, body 400 to 600.
- Labels, chips, hints, nav links, counters captions, HUD: DM Mono 300 to 500. Eyebrow labels uppercase, 12 px, tracking 0.2em.

| role | desktop | mobile | weight | line-height | tracking |
|---|---|---|---|---|---|
| Hero H1 | 104 | 48 | 800 | 0.92 | -0.045em |
| About name / page title | 80 | 32 to 40 | 800 | 0.95 | -0.04em |
| Section H2 | 64 | 40 | 800 | 1.0 | -0.04em |
| H3 card title | 28 | 22 | 700 | 1.15 | -0.02em |
| Stat number | 64 | 34 | 800 | 1.0 | -0.03em |
| Lead / body | 18 | 16 | 400 | 1.6 | 0 |
| Small body | 15 | 14 | 400 | 1.55 | 0 |
| Typewriter (mono) | 20 | 16 | 400 | 1.4 | 0 |
| Mono label | 12 | 11 | 400 | 1.4 | 0.12 to 0.2em |
| Mono hint | 13 | 12 | 400 | 1.5 | 0 |

Hero line 2 ("Full Stack") uses a vertical gradient fill #B5B5B5 to #6B6B6B (lowest point 3.7:1 at 104 px, large text so AA holds at 3:1).

## Radii, spacing, layout

- Radii: chips, buttons, navbar, tabs 999; inputs 14; small tiles 16 to 20; cards 24; large panels 28; lanyard card 22.
- Spacing scale (px): 4, 8, 12, 16, 20, 24, 28, 32, 40, 48, 64, 72, 112.
- Container max 1280 (content sections 1200), side padding 40 desktop, 16 mobile.
- Section padding 112 top and bottom desktop, 56 mobile.
- Grid: projects 2 columns desktop, 1 below 768; tech items 4 columns desktop, 2 mobile; stats 3 columns at every width.
- Touch targets 44 minimum, primary buttons 48 desktop and 52 mobile.

## Background

- Fixed layer at z-index -10: --bg, then a 64 px grid (48 px on mobile) of 1 px lines rgba(255,255,255,0.035), then a radial vignette `radial-gradient(ellipse 80% 70% at 50% 40%, transparent 0%, rgba(13,13,13,.55) 60%, #0D0D0D 100%)`.
- The WebGL canvas for the lanyard is fixed over the hero only.

## Glass recipe

```
background: rgba(255,255,255,0.04);
border: 1px solid rgba(255,255,255,0.10);
backdrop-filter: blur(16px) saturate(140%);
box-shadow: inset 0 1px 0 rgba(255,255,255,0.06), 0 24px 48px -24px rgba(0,0,0,0.6);
```
Fallback when backdrop-filter is unsupported: background rgba(23,23,23,0.92). Lanyard card uses rgba(22,22,22,0.72) so the photo frame reads over the grid.

## Components

- Navbar pill: wordmark "luiz.enz" (accent dot), links Início, Sobre, Portfolio, Contato in DM Mono; active link = --text plus 1 px --accent underline, driven by scroll-spy; mobile collapses to a 44 px menu button (aria-expanded) opening a glass sheet.
- Badge "DISPONÍVEL PARA TRABALHO" with an accent star, shown only while the availability flag is on.
- Typewriter line: mono, accent color, phrases from the brief ("Full Stack Júnior", "Back-end com Cloudflare Workers", "Construindo CRMs e lojas"), block cursor blinking 1 s steps; aria-label holds the first phrase, the animated text is aria-hidden.
- Chip (DM Mono, line-strong outline), mono hint lines prefixed with "//".
- Scroll indicator "ROLAR" plus arrow, link to #about.
- Lanyard: strap (accent, mono text), metal clip, glass card with photo, name, role, location and "3D CARD"; caption "ARRASTE O CRACHÁ". Static image fallback with the same composition.
- Buttons: primary (accent fill, --on-accent text), outline (line-strong, accent border on hover), ghost (Ver mais), disabled (dashed border, --text-subtle, aria-disabled) used for "Sem demo no ar".
- Stat card: icon, number, mono caption, mono source line. Numbers from content: Projetos = project files (5), Certificados = certificate files (0, card shown muted), Experiências = experience entries (3).
- Quote card: motto is a TODO, rendered only when provided.
- Segmented tabs: role tablist, sliding accent pill, arrow-key navigation.
- Project card: cover, mono kind, title, 3-line clamp summary, link status ("Ferramenta privada", "Sem link" or domain), "Detalhes" button.
- Certificates empty state: icon, title, one line, "Ver projetos" button. The tab stays visible (requested) with this state until certificates exist.
- Tech item: mono monogram tile plus name, grouped by category.
- Detail: back link, stat tiles (tech count, feature count), demo and repo buttons with disabled states ("Sem demo no ar", "Repositório privado"), tech chips, features glass panel, cover shared with the card.
- Contact form: labeled inputs with leading icons, states sending, sent, error; honeypot hidden field.
- Connect list: full-width rows (mono label, value, arrow): LinkedIn, GitHub, Instagram @enz.softwares, site, e-mail. No phone, no address.
- Comments panel: name (40 chars), comment (500 chars), optional image (JPG, PNG, WebP up to 2 MB), "Publicar comentário", count, empty state, comment item with avatar initial, date and FIXADO badge for pinned items.
- Focus ring everywhere: 2 px --accent, offset 3 px (2 px on inputs).

## Motion spec

Easing tokens: `expo-out = cubic-bezier(0.16, 1, 0.3, 1)`, `micro = cubic-bezier(0.2, 0.8, 0.2, 1)`. Transform and opacity only. Implemented with Motion variants: a hero container with `delayChildren` and `staggerChildren: 0.1`, each child with its own `initial` and `animate`.

### Entry timeline (first load, no loader screen)

| element | delay | duration | easing | transform | reduced-motion |
|---|---|---|---|---|---|
| Background layer (grid, vignette) and WebGL canvas creation | 0 ms | 150 ms | linear | opacity 0 to 1 | present at once, no fade |
| Hero H1 | 160 ms | 1200 ms | expo-out | opacity 0 to 1, scale 0.85 to 1, y 50 to 0 | opacity only, 200 ms, delay 0 |
| Lanyard card | 200 ms | about 1400 ms to settle | rapier physics (gravity -40, joint damping 4) | drops from y -4 (world units) above the anchor, swings on a 4 joint rope until rest | static image, no physics, opacity 200 ms |
| Badge | 260 ms | 800 ms | expo-out | opacity 0 to 1, y 24 to 0 | opacity only, 200 ms |
| Navbar pill | 350 ms | 1000 ms | expo-out | opacity 0 to 1, y -40 to 0 | opacity only, 200 ms |
| Typewriter line | 360 ms | 800 ms | expo-out | opacity 0 to 1, y 24 to 0; typing starts at 1000 ms, 55 ms per char, hold 1800 ms, delete 30 ms per char | first phrase static, cursor not blinking |
| Paragraph | 460 ms | 800 ms | expo-out | opacity 0 to 1, y 24 to 0 | opacity only, 200 ms |
| Stack chips | 560 ms | 800 ms | expo-out | opacity 0 to 1, y 16 to 0, inner stagger 40 ms | opacity only, 200 ms |
| Mono hints | 660 ms | 800 ms | expo-out | opacity 0 to 1, y 16 to 0 | opacity only, 200 ms |
| Scroll indicator | 900 ms | 600 ms, then loop | expo-out, loop ease-in-out 1.6 s | opacity 0 to 1, then arrow y 0 to 6 to 0 | visible, no loop |

Children stagger is 100 ms (inside the 80 to 120 ms window). Everything is done by about 1460 ms, the lanyard settles around 1600 ms. Tolerance in Phase 6: plus or minus 150 ms per row.

### Other motion

| element | trigger | duration | easing | transform | reduced-motion |
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

### 3D rules

- Canvas created at 0 ms, scene chunk loaded with dynamic import after first paint; the static card (same composition as the artboard) is in the initial HTML and is swapped out when the scene is ready, without layout shift (fixed aspect box).
- No WebGL, reduced motion, Save-Data or low-power: static card only, 3D chunk never fetched.
- Frameloop paused when the hero is off-screen or the tab is hidden; dpr clamped to [1, 1.75].

## Accessibility notes

- One h1 per page, landmarks (header, main, section with aria-labelledby, footer), skip link.
- Lanyard region has an aria-label ("Crachá 3D com a foto de Luiz Gustavo, arraste para balançar"); the drag is decorative and never the only way to reach anything.
- Comments and contact forms: visible labels, errors tied with aria-describedby, status in role=status.

## Open items carried forward

- Personal motto (quote card) missing: hidden until provided.
- Project covers live in other repos (paths in 00-brief.md): copy to public/ in Phase 4.
- Brand wordmark "luiz.enz" is a wordmark, not a domain; the final domain is not decided.
- Light theme tokens are defined; whether v1 ships a light theme is a Phase 2 decision.
