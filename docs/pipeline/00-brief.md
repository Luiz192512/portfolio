# 00 Brief

## Owner (source: CV_Luiz_Gustavo_PT_2026-10.pdf, public links only)
- Name: Luiz Gustavo Lorençone Enz
- Role: Desenvolvedor Full Stack Júnior, estudante de Engenharia de Software (UniCesumar, 4º semestre, previsão 2028)
- Bio (pt-BR, from CV): Estudante de Engenharia de Software, com curso técnico em Desenvolvimento de Sistemas. Fundador da Enz Softwares, cria sites e sistemas para pequenos negócios e construiu o Curbside, um CRM de prospecção com backend em Cloudflare Workers e app em React Native. Afinidade com back-end; busca vaga júnior/trainee remota, de preferência em times internacionais.
- Location: Maringá, PR (remote friendly)
- Languages: Português (nativo), Inglês (intermediário)
- Links: linkedin.com/in/luiz-gustavo-lorencone-enz, github.com/Luiz192512, enzsoftwares.com, enz.luizgustavo@gmail.com
- Instagram: @enz.softwares (company)
- Photo: assets/photo.jpg (user supplied)
- CV file: Downloads/CV_Luiz_Gustavo_PT_2026-10.pdf (copy to public/ at Phase 4)
- Experience: Estagiário de TI, Colégio Santa Cruz (2026 a atual); Fundador, Enz Softwares (2025 a atual); Auxiliar Administrativo de Engenharia, Kaêra Parts (2025)
- Skills: JavaScript, TypeScript, Java, Go, Python; React, Next.js, React Native (Expo); Node.js, Cloudflare Workers, Spring Boot, REST; PostgreSQL, SQLite (D1), Supabase, MySQL; Git, GitHub, automated tests; AI-assisted development, prompt engineering, agent skills, automation
- Certificates: none. The Certificates tab must not be built from invented data: hide it or show an empty state until the user adds some.
- Privacy: phone, WhatsApp and home address are NOT published. Public contact is the e-mail above plus the contact form.

## Projects (verified by read-only agents)
1. Curbside: CRM de prospecção internacional (BR, PT, ES, US). Cloudflare Workers + D1, JS puro com Motion e Leaflet, React Native/Expo app. Link: https://enzsoftwares.com/curbside is a login screen, treat as private tool (no live demo link). Repo github.com/Luiz192512/curbside: confirm public or private. Cover: curbside/public/icones/icone-512.png
2. Enz Softwares site: site de uma página, 4 idiomas, formulário que monta mensagem para WhatsApp/e-mail, Cloudflare Worker de assets, CSP. Live: https://enzsoftwares.com. Cover: enzsoftwares-site/public/img/og.png
3. TSZR15 Store: loja para Yamaha R15, Next.js 16, Supabase, Mercado Pago, checkout via WhatsApp, painel admin, rastreio. Folder: pessoal/TSZR15. No public URL confirmed. Repo github.com/Luiz192512/TSZR15: confirm. Cover: TSZR15/public/brand/tszr15-hero-r15-dark.webp
4. MSX Baterias (client): landing page mobile-first, Next.js 14, localizador de bateria, blog, SEO local, GA4. Live URL in code: https://bateriasmsx.com.br (unverified). Cover: clientes/arthur/msx-baterias/app/opengraph-image.png
5. G7 Arena Padel CRM (client pilot): Next.js 16, Prisma + Neon, R3F, Motion, agenda, financeiro, painel do dono. Demo data is fictional, say so. Live: https://g7-padel-crm.vercel.app. Repo github.com/Luiz192512/g7-padel-crm. Cover: clientes/G7-padle/assets/brand/g7-padel-apresentacao.png

## Decisions from the user
- Content from existing projects and CV; no invented certificates.
- Accent color: yes, on the dark base (Phase 1 picks one that passes WCAG AA).
- Comments panel: INCLUDED, backed by Neon Postgres (user creates the Neon project; connection string only in env DATABASE_URL, never in chat). Needs moderation (pinned/hidden flags, rate limit, image upload storage decision in Phase 2).
- Contact form: Resend via Next.js route handler, RESEND_API_KEY from env.
- Stack, entry animation and features follow prompts/portfolio-motion-threejs-pipeline.v3.md.

## Open inputs
- Confirm which repos may be linked publicly (Curbside, TSZR15).
- Confirm MSX live URL works.
- Neon project and Resend key (env vars, set by the user).
- Typewriter phrases: default "Full Stack Júnior", "Back-end com Cloudflare Workers", "Construindo CRMs e lojas".

## Decisions update (after read-only gh check)
- User asked to link repos for MSX Baterias, enzsoftwares, g7-padel-crm and TSZR15.
- Reality (gh repo list): TSZR15 is PUBLIC; g7-padel-crm and msx-baterias are PRIVATE (visitors would get a 404, and msx-baterias is client work); enzsoftwares-site is not a git repository.
- Applied: repo button only for TSZR15 (https://github.com/Luiz192512/TSZR15). Others show "Repositório privado" state. Visibility is NOT changed by the pipeline. If the user makes a repo public, flip repoUrl in content.
- Curbside: no answer given, default applied: case study without demo link; repo private, no repo button.
- Live demos: enzsoftwares.com, g7-padel-crm.vercel.app, bateriasmsx.com.br (verify in QA), TSZR15 no live URL yet.

## CV (2026-10-22)
- Public CV without phone: assets/cv/CV_Luiz_Gustavo_PT_publico.pdf (made from Downloads/CV_Luiz_Gustavo_PT_2026-10.pdf, original untouched). Phone removed by true redaction (not in text or raw bytes); city, "Remoto", e-mail, LinkedIn, GitHub and site kept and made clickable. The only "address" in the CV was "Maringá, PR".
- Phase 4 task 4.3 may copy this file to public/ (user confirmed intent: public CV without contact). Show the "Baixar CV" button.
