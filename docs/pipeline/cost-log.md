# Cost log
| phase | model | agent or skill | why this model | outcome |
|---|---|---|---|---|
| 0 | haiku | general-purpose (CV extract) | read-only PDF extraction | ok |
| 0 | haiku | general-purpose (curbside) | read-only repo summary | ok |
| 0 | haiku | general-purpose (enzsoftwares) | read-only repo summary | ok |
| 0 | haiku | general-purpose (TSZR15) | read-only repo summary | ok |
| 0 | haiku | general-purpose (msx-baterias) | read-only repo summary | ok |
| 0 | haiku | general-purpose (G7 Arena) | read-only repo summary | ok |
| 0 | sonnet (orchestrator session) | gh read-only repo visibility check | cheap check, decision-relevant | ok |
| 1 | opus | general-purpose (design direction, Artifact quickstart design) | taste and direction decision | ok |
| 1 | sonnet | general-purpose (mobile screens and state sheet in Artifact) | volume of screens | ok (unrendered, to be checked by opus) |
| 1 | opus | general-purpose (critique, a11y, render check, DESIGN.md) | gate review needs judgment | ok (3 blockers fixed, lint not run) |
| 2 | opus | architect-reviewer (02-architecture.md) | contracts every later task follows | ok |
| 4 | sonnet (orchestrator session) | PyMuPDF redaction of CV phone | user request, local, verified | ok |
| 3 | haiku | nextjs-developer (scaffold) | mechanical; gate re-verified by orchestrator: lint, typecheck, build exit 0 | ok |
| 4 | haiku | general-purpose (4.3 images, CV) | mechanical sharp pipeline | ok; CV copy done by orchestrator (false-positive on word WhatsApp) |
| 4 | sonnet | typescript-pro (4.1 content schemas) | schema needs rigor | ok |
| 4 | sonnet | backend-developer (4.4 env, security, db, email) | security-sensitive logic | ok (1 failing test belongs to 4.2 content, pending) |
| 4 | haiku | general-purpose (4.2 content json) | data mapping, no invention | ok after orchestrator fixed cvPath casing; motto omitted |
| 5 | sonnet | frontend-developer (5.1 base layout, ui, motion stubs) | bulk UI code | ok (not browser-tested) |
| 5 | sonnet | react-specialist (5.2 hero, about, static lanyard) | UI volume | ok (resumed after rate limit) |
| 5 | sonnet | react-specialist (5.3 portfolio, detail) | UI volume | ok (resumed after rate limit) |
| 5 | sonnet | backend-developer (5.4 contact + 5.5 comments, one writer) | security-sensitive routes | ok (resumed after rate limit) |
| 5 | haiku | seo-specialist (5.6) | failed: agent type had no write tools | retried |
| 5 | haiku | general-purpose (5.6 retry) | mechanical SEO files | ok |
| 5 | sonnet (orchestrator session) | fix: Tabs dotted access on client reference caused prerender crash; named exports | root cause found via dev server bisect | ok (build green) |
| 6 | sonnet | react-specialist (6.1 entry motion) | motion implementation | ok in code; no browser check; motion MCP unavailable to agent |
| 6 | sonnet | react-specialist (6.2 lanyard scene) | R3F + rapier implementation | ok; verified by agent with Playwright (mouse drag, CLS); touch and pause unverified |
| 6 | sonnet | performance-engineer (6.3 budgets, e2e, 06-budgets.md) | measure only, real numbers | ok: 3 FAIL found |
| 6 | sonnet | react-specialist (6.1 fix: reduced-motion stuck transforms) | local bug fix | ok in code, to re-check in browser |
| 6 | opus | architect-reviewer (6.4 review, 06-review.md) | judgment on budgets and visual defects | FAIL verdict with P0/P1 list |
| 6 | sonnet | react-specialist (5.2 hero P0 fixes, 6.2 strap fixes, 5.4/5.5 zod off client) | review P0 fixes | ok in code; 6.2 P1 in progress |
| 6 | sonnet | react-specialist (6.2 P1: tap-to-load mobile, sleep at rest, no per-frame alloc) | owner decisions applied | ok; keyboard/real touch unverified |
| 6 | sonnet | performance-engineer (6.3 re-run) | re-measure after fixes | ok: reduced-motion, first-load JS 207 KB, mobile INP now PASS; desktop TBT and hydration long task FAIL (noisy host) |
| 7 | haiku | general-purpose (a11y scan with axe + keyboard) | scan work | ok: 0 blocker, 2 major, 3 minor |
| 7 | haiku | general-purpose (Lighthouse, SEO, links) | scan work | ok: mobile Perf 91, desktop 100; env URL major |
| 7 | haiku | general-purpose (e2e smoke) | scan work | ok: 29 passed, 0 failed |
| 7 | sonnet | react-specialist (single writer: a11y, copy, site URL, LCP fixes) | review fixes | ok: 41 e2e passed, 3 skipped; LCP sim still 3.3 s |
| 8 | haiku | readme-generator (README.md, CHANGELOG.md) | docs, mechanical | ok; README mentions pnpm and prepare:images vs repo npm and images (to fix in review) |
| 8 | opus | code-reviewer (final review, 08-release.md) | security, provenance, deploy readiness | READY WITH CAVEATS |
| 8 | sonnet | react-specialist (og:type article, lanyard drop visual check, LCP investigation) | pre-release P1s | ok; LCP changes reverted (no gain) |
