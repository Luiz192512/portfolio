import type { ConsoleMessage, Page } from '@playwright/test';

/** Expected data from content/projects (slug = file name). Used by the smoke suite only. */
export const PROJECTS = [
  { slug: 'curbside', title: 'Curbside', demo: null, repo: null },
  { slug: 'enz-softwares', title: 'Enz Softwares', demo: 'https://enzsoftwares.com', repo: null },
  { slug: 'tszr15', title: 'TSZR15 Store', demo: null, repo: 'https://github.com/Luiz192512/TSZR15' },
  { slug: 'msx-baterias', title: 'MSX Baterias', demo: 'https://bateriasmsx.com.br', repo: null },
  { slug: 'g7-padel-crm', title: 'G7 Arena Padel CRM', demo: 'https://g7-padel-crm.vercel.app', repo: null },
] as const;

/** Browser console noise that the app triggers on purpose (failed resource loads on expected responses). */
const EXPECTED_RESOURCE_ERRORS = [/\/api\/contact$/, /\/api\/comments$/, /\/rota-que-nao-existe$/];

/** Collects console errors and uncaught page errors. Expected failed-resource lines are filtered by URL. */
export function trackConsole(page: Page): string[] {
  const problems: string[] = [];
  page.on('console', (msg: ConsoleMessage) => {
    if (msg.type() !== 'error') return;
    const url = msg.location().url;
    if (/Failed to load resource/.test(msg.text()) && EXPECTED_RESOURCE_ERRORS.some((re) => re.test(url))) return;
    problems.push(`${page.url()} :: console.error: ${msg.text()} (${url})`);
  });
  page.on('pageerror', (err) => problems.push(`${page.url()} :: pageerror: ${err.message}`));
  return problems;
}

/** Fills the contact form with clearly fake data. The e-mail uses example.com so nothing can reach a real inbox. */
export async function fillContact(page: Page, overrides: { name?: string; email?: string; message?: string } = {}) {
  await page.getByLabel('NOME', { exact: true }).fill(overrides.name ?? 'Teste Smoke');
  await page.getByLabel('E-MAIL', { exact: true }).fill(overrides.email ?? 'smoke-test@example.com');
  await page
    .getByLabel('MENSAGEM', { exact: true })
    .fill(overrides.message ?? 'Mensagem de teste automatizado do smoke test.');
}

/**
 * Records every POST to /api/contact (status and body) and passes it through unchanged.
 * Reading the body through route.fetch() avoids a Playwright hang seen with response.body() on this endpoint.
 */
export async function captureContactPosts(page: Page): Promise<{ status: number; body: string }[]> {
  const captured: { status: number; body: string }[] = [];
  await page.route('**/api/contact', async (route) => {
    if (route.request().method() !== 'POST') return route.continue();
    const res = await route.fetch();
    const body = await res.text();
    captured.push({ status: res.status(), body });
    await route.fulfill({ response: res, body });
  });
  return captured;
}

/** Leaks a server response body check: no stack frames, no secret-shaped values, no env names. */
export function looksSafe(body: string): boolean {
  if (/\n\s+at\s/.test(body)) return false;
  if (/stack/i.test(body)) return false;
  if (/re_[A-Za-z0-9_]{8,}/.test(body)) return false;
  if (/RESEND_API_KEY|DATABASE_URL|RATE_LIMIT_SALT/.test(body)) return false;
  return true;
}
