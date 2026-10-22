# 00 Brief

Source of facts: read-only extraction from the owner's own projects (2026-10-21). Anything not found is a visible TODO. Nothing here is invented.

## Owner (public data already published on enzsoftwares.com)

- Name: Luiz Gustavo Enz (short: Luiz Enz)
- Title: Founder & Software Engineer
- Brand: Enz Softwares (https://enzsoftwares.com)
- Positioning (existing copy): "Sites de uma página e sistemas pequenos para negócio local. Feitos para o celular, no ar em dias, com o pedido chegando no seu WhatsApp."
- Tagline (existing): "Código limpo · Soluções inteligentes · Impacto real"
- Location: Maringá / Paraná, Brasil (attends remotely)
- Email: contact@enzsoftwares.com
- WhatsApp: +55 (44) 99769-7028
- Instagram: @enz.softwares
- GitHub: https://github.com/Luiz192512
- LinkedIn: TODO (not found)
- Withheld on purpose: CNPJ, street address, legal full name

## Audience and positioning

- Audience: owners of small and local businesses in Brazil who need a site or a small system, plus recruiters and potential clients who judge craft quickly.
- Positioning: one engineer who ships fast, mobile-first products that end in a WhatsApp conversation, with real systems behind them (CRM, store, booking).
- Tone: dark navy, cinematic, minimal cyberpunk, Enz brand blue accent, confident, short sentences. Site copy in pt-BR.

## Design principles

1. Proof over promise: every claim is backed by a shipped project.
2. Motion with purpose: animation explains hierarchy and state, and never blocks reading.
3. Fast first, spectacle second: the 3D scene loads after first paint and degrades gracefully.

## Pages

Home, Works index (filter by stack), Work detail, About, Contact.

## 3D concept

Interactive hero scene (revised by the owner): a wireframe torus (donut) that rotates as the user scrolls up or down, in a minimal cyberpunk style (thin blue and cyan lines, monospace HUD labels). Static SVG poster fallback for no WebGL, low power, and reduced motion.

## Works (5)

| slug | name | year | role | stack | links | cover candidate |
|---|---|---|---|---|---|---|
| tszr15 | TSZR15 | 2026 | Developer | Next.js 16, React 19, OpenNext on Cloudflare, Supabase, Mercado Pago, Resend, Vitest | repo github.com/Luiz192512/TSZR15; preview tsz-store-preview.enz-luizgustavo.workers.dev; production domain TODO | TSZR15/public/brand/tszr15-hero-r15-dark.webp |
| curbside | Curbside | 2026 | Author, sole developer | Cloudflare Workers + D1, Turso, vanilla ESM, Expo/React Native, motion, Leaflet | repo github.com/Luiz192512/curbside; app curbside.enz-luizgustavo.workers.dev (internal tool, do not link a live demo with lead data) | curbside/public/icones/icone-512.png (no screenshot yet, TODO) |
| msx-baterias | MSX Baterias | 2026 | Sole developer | Next.js 14 static export, Tailwind 3, Cloudflare Pages | bateriasmsx.com.br; repo github.com/Luiz192512/msx-baterias | msx-baterias/app/opengraph-image.png; enzsoftwares-site/public/img/msx-baterias.webp (screenshot) |
| enz-softwares | Enz Softwares | 2026 | Owner and developer | HTML, CSS, vanilla JS, Cloudflare Workers static assets, i18n pt-BR/pt-PT/es/en, strict CSP | enzsoftwares.com | enzsoftwares-site/public/img/og.png |
| g7-padel | Arena G7 Padel CRM | 2026 | Sole developer | Next.js 16, React 19, TypeScript, Tailwind 4, shadcn/ui, Motion, Three.js + R3F, Prisma + Neon, Recharts, PWA | g7-padel-crm.vercel.app; repo github.com/Luiz192512/g7-padel-crm | G7-padle/assets/brand/g7-padel-apresentacao.png |

Short descriptions (from READMEs):
- Enz Softwares: the owner's own institutional site: a single page in four languages whose form opens WhatsApp or email with a prefilled message.
- TSZR15: Yamaha R15 parts and accessories store with catalog, customer account, cart, checkout that generates a WhatsApp message, Mercado Pago (Pix, card, boleto), admin panel and order tracking.
- Curbside: international prospecting and sales CRM for one operator: company lists with filters, assisted outreach, analytics, lead collection from OpenStreetMap and Overture, scheduled robot, mobile app.
- MSX Baterias: conversion landing page and battery finder (about 2,640 models) for an automotive battery shop in Sarandi-PR, with per-model SEO pages, blog, and WhatsApp CTAs.
- G7 Padel CRM: management pilot for a padel arena: students, classes, court booking with double-booking protection, financial margin and reconciliation, owner dashboard, role-based login, 3D court scene. Demo data is fictional.

Not a separate work: curbside-seguranca-mobile is a git worktree of Curbside (mobile security audit), so it is mentioned inside Curbside, not listed.

## Missing inputs (TODO list)

- LinkedIn URL
- Client owner or contact names and testimonials for MSX and G7 (none found)
- Production domain of TSZR15
- A real screenshot for Curbside (internal tool: needs a sanitized capture without lead data)
- Confirmation that the live URLs of MSX and G7 are current (not verified over the network)
- Permission to show each client's name and brand publicly (MSX, G7, TSZR15)
- Photo of the owner (optional)

## Handling rules

- No secrets, `.env` content or lead/backup data from the source projects enters this repo.
- Copy only images that are the owner's own work or brand assets, and only after the owner confirms client permission.
