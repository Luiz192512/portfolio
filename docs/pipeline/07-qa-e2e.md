# 07 QA E2E (Phase 7 smoke tests)

Run date: 2026-10-22. Scope: `e2e/smoke.spec.ts` with helpers in `e2e/helpers/smoke.ts`. App code was not changed.

## Setup

- Build: the existing production build in `.next` (no rebuild).
- Server: `next start -p 3123` (only this run used the port). Started with `NEXT_PUBLIC_SITE_URL=http://localhost:3123` at runtime. Without it the contact origin check (`src/lib/security/request.ts`) rejects every browser POST with 403, so the honeypot path could not be reached. This is a local test setting, not a code change.
- Command: `PLAYWRIGHT_BASE_URL=http://localhost:3123 npx playwright test e2e/smoke.spec.ts --workers=1`
- Projects from `playwright.config.ts`: `desktop` (1440 x 900) and `mobile` (390 x 844, Chrome engine).
- Result: 29 passed, 0 failed, 3 skipped by design (desktop-only nav bar tests on mobile, mobile-only menu test on desktop).
- Console: every test runs an `afterEach` that fails on any `console.error` or uncaught page error. Only failed-resource lines for the intentional `/api/contact`, `/api/comments` and unknown-route requests are filtered (by URL).
- Email safety: no `RESEND_API_KEY`, `DATABASE_URL` or `.env.local` exists in the environment, so the valid-submit test cannot send mail. The test also uses `smoke-test@example.com`.

## Results

### Desktop (1440 x 900)

- PASS home has no horizontal page scroll (`html` scrollWidth equals clientWidth)
- PASS nav links scroll to Sobre, Portfólio and Contato, URL hash updates, section reaches the upper half of the viewport
- PASS scroll-spy: `aria-current="true"` follows Sobre, Portfólio, Contato, Início as the page scrolls
- PASS tabs: Projetos default, Certificados shows empty state, its action returns to Projetos, Tech Stack shows LINGUAGENS; arrows wrap, End and Home work, focus and `aria-selected` match after each key
- PASS detail page curbside (title, Voltar to /#portfolio, "Sem demo no ar" disabled, "Repositório privado" disabled)
- PASS detail page enz-softwares ("Ver demo" to https://enzsoftwares.com, repo disabled)
- PASS detail page tszr15 ("Sem demo no ar" disabled, "Ver repositório" to https://github.com/Luiz192512/TSZR15)
- PASS detail page msx-baterias ("Ver demo" to https://bateriasmsx.com.br, repo disabled)
- PASS detail page g7-padel-crm ("Ver demo" to https://g7-padel-crm.vercel.app, repo disabled)
- PASS "Baixar currículo" href is /cv/luiz-gustavo-enz-cv.pdf, GET returns 200 with application/pdf
- PASS contact: empty submit shows "Preencha seu nome.", "Informe um e-mail válido.", "Escreva pelo menos 10 caracteres."
- PASS contact: honeypot filled returns 200 `{ ok: true }` and the generic success text
- PASS contact: valid submit with no Resend config returns 429 or 503 (see note), body has no stack frame, no secret-shaped value, no env name, and the UI shows a safe error
- PASS comments panel absent (no heading, no submit button), GET and POST /api/comments return 404
- PASS unknown route /rota-que-nao-existe returns 404 with "Página não encontrada", text, and link "Voltar para o início" to /
- SKIP mobile menu test (mobile only), SKIP nav links and scroll-spy on mobile (nav bar hidden below md, by design)

### Mobile (390 x 844)

- PASS home has no horizontal page scroll
- PASS mobile menu: toggle `aria-expanded` true, sheet opens (dialog "Principal"), Escape closes it, `aria-expanded` false, focus returns to the toggle, reopening and clicking Sobre navigates to #about and closes the sheet
- PASS tabs (same checks as desktop; the Stack tab name is "Tech Stack")
- PASS detail pages for all 5 slugs (same checks as desktop)
- PASS "Baixar currículo" href and PDF response
- PASS contact empty submit, honeypot, and valid-submit safe error (same as desktop)
- PASS comments absent and API 404
- PASS unknown route 404 page
- SKIP desktop nav links and scroll-spy tests (nav bar hidden below md)

Note on the valid-submit status: the contact limiter allows 3 submits per 10 minutes per IP (in-memory fallback without `DATABASE_URL`). Repeated runs return 429, which the test accepts. A clean run returns 503 `not_configured`.

## Findings

No blocker and no major findings.

### minor-1: duplicated accessible name on the desktop Stack tab

- Route: `/#portfolio`
- Selector: `getByRole('tab')` for "Tech Stack". Desktop accessible name is "Tech Stack Tech Stack".
- Cause: `src/components/sections/portfolio/PortfolioSection.tsx` renders the visible label and an `sr-only` copy of the same text, and the visible label is not `aria-hidden` on desktop. Screen readers announce the label twice.
- Suggested fix (not applied): mark the visible span `aria-hidden="true"` on all breakpoints, keep the sr-only copy.
- The smoke test matches the name by prefix so it keeps passing.

### minor-2: empty message shows the min-length text

- Route: `/#contato`
- Selector: `#contato` form, empty submit.
- Observed: "Escreva pelo menos 10 caracteres." for an empty message. DESIGN.md says "Escreva uma mensagem.".
- Cause: `checkContact` in `src/components/sections/contact/client-validation.ts` returns `message_too_short` for empty input, and `copy.contact.errors.message` is never used.
- Suggested fix (not applied): map an empty message to `copy.contact.errors.message`.

### minor-3: two buttons named "Fechar menu" when the sheet is open

- Route: `/` at 390 px width, with the menu open.
- Selectors: the toggle `button[aria-controls][aria-expanded]` and the close button inside `dialog[aria-label="Principal"]`.
- Impact: a screen reader user sees two identical names. The smoke test targets the toggle by its `aria-controls` attribute.

### minor-4: contact origin check depends on runtime env

- Route: `POST /api/contact`.
- Observed in the first run without `NEXT_PUBLIC_SITE_URL`: 403 for a same-origin browser POST, so the honeypot and success paths cannot be reached locally. Production sets the variable, so this is a local setup note, not a production defect. `siteUrl()` falls back to `http://localhost:3000` while the origin check has no fallback, which is inconsistent.

### minor-5: copy and id naming versus the architecture docs

- Nav label is "Portfólio" (`src/lib/copy.ts`), DESIGN.md copy deck says "Portfolio". Eyebrow likewise "PORTFÓLIO" versus "PORTFOLIO".
- Contact section id is `contato` (`SECTION_IDS`), 02-architecture.md section 1 says `#contact`. The smoke tests use the code values.

### watch: keyboard focus and aria-selected can lag under rapid key presses

- Route: `/#portfolio`, tab list, mobile width.
- In an exploratory run with no waits between keys, `aria-selected` briefly lagged the focused tab. With 700 ms between keys all states matched. Not confirmed as a defect. The smoke test asserts focus and selection after each key.

## Harness notes

- `response.body()` and `response.json()` on the `/api/contact` POST hung in Playwright (30 s timeout). `e2e/helpers/smoke.ts` `captureContactPosts` reads the body through `route.fetch()` and fulfils the route unchanged.
- The honeypot and valid-submit tests use the browser UI, so the Origin header matches the real client.
- Console filter: only `Failed to load resource` lines whose URL is `/api/contact`, `/api/comments` or `/rota-que-nao-existe` are ignored.
