import { expect, test } from '@playwright/test';
import { copy } from '../src/lib/copy';
import { captureContactPosts, fillContact, looksSafe, PROJECTS, trackConsole } from './helpers/smoke';

/** Phase 7 smoke suite. Runs under both the "desktop" (1440x900) and "mobile" (390x844) projects. */

let consoleProblems: string[] = [];

test.beforeEach(async ({ page }) => {
  consoleProblems = trackConsole(page);
});

test.afterEach(() => {
  expect(consoleProblems, 'no console errors or page errors').toEqual([]);
});

const isMobile = (projectName: string) => projectName === 'mobile';

test('home has no horizontal page scroll', async ({ page }) => {
  await page.goto('/');
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(0);
});

test('desktop nav links scroll to their sections', async ({ page }, testInfo) => {
  test.skip(isMobile(testInfo.project.name), 'desktop nav bar is hidden below md');
  const nav = page.getByRole('navigation', { name: copy.nav.ariaLabel });
  for (const link of copy.nav.links.slice(1)) {
    await page.goto('/');
    await nav.getByRole('link', { name: link.label, exact: true }).click();
    await expect(page).toHaveURL(new RegExp(`#${link.id}$`));
    await expect
      .poll(() =>
        page.locator(`#${link.id}`).evaluate((el) => Math.round(el.getBoundingClientRect().top)),
      )
      .toBeLessThan(450);
  }
});

test('scroll-spy: active nav link follows the section in view', async ({ page }, testInfo) => {
  test.skip(isMobile(testInfo.project.name), 'desktop nav bar is hidden below md');
  await page.goto('/');
  const nav = page.getByRole('navigation', { name: copy.nav.ariaLabel });
  const byId = Object.fromEntries(copy.nav.links.map((l) => [l.id, l.label]));
  for (const id of ['about', 'portfolio', 'contato', 'home']) {
    await page.evaluate((sid) => {
      document.getElementById(sid)?.scrollIntoView({ block: 'start', behavior: 'instant' });
    }, id);
    await expect(nav.getByRole('link', { name: byId[id], exact: true })).toHaveAttribute('aria-current', 'true');
    for (const other of copy.nav.links.filter((l) => l.id !== id)) {
      await expect(nav.getByRole('link', { name: other.label, exact: true })).not.toHaveAttribute('aria-current', 'true');
    }
  }
});

test('mobile menu opens, navigates, and closes on Escape with focus returned', async ({ page }, testInfo) => {
  test.skip(!isMobile(testInfo.project.name), 'menu toggle is only shown below md');
  await page.goto('/');
  // The toggle is the only button with aria-controls; the sheet also has a close button with the same label.
  const toggle = page.locator('button[aria-controls][aria-expanded]');
  await page.getByRole('button', { name: copy.nav.openMenu }).click();
  const dialog = page.getByRole('dialog', { name: copy.nav.ariaLabel });
  await expect(dialog).toBeVisible();
  await expect(toggle).toHaveAttribute('aria-expanded', 'true');

  await page.keyboard.press('Escape');
  await expect(dialog).toBeHidden();
  const reopen = page.getByRole('button', { name: copy.nav.openMenu });
  await expect(reopen).toHaveAttribute('aria-expanded', 'false');
  await expect(reopen).toBeFocused();

  // Menu links still navigate after a close (nothing left inert).
  await reopen.click();
  await dialog.getByRole('link', { name: 'Sobre', exact: true }).click();
  await expect(dialog).toBeHidden();
  await expect(page).toHaveURL(/#about$/);
});

test('tabs switch panels and keyboard arrows, Home and End work', async ({ page }) => {
  await page.goto('/#portfolio');
  const t = copy.portfolio.tabs;
  const projectsTab = page.getByRole('tab', { name: t.projects, exact: true });
  const certTab = page.getByRole('tab', { name: t.certificates, exact: true });
  // One accessible name at every breakpoint (sr-only full label, visible text aria-hidden).
  const stackTab = page.getByRole('tab', { name: t.stack, exact: true });

  await expect(projectsTab).toHaveAttribute('aria-selected', 'true');
  await expect(page.getByRole('link', { name: `${copy.portfolio.details}: Curbside` })).toBeVisible();

  await certTab.click();
  await expect(certTab).toHaveAttribute('aria-selected', 'true');
  await expect(page.getByText(copy.portfolio.certificatesEmpty.title, { exact: true })).toBeVisible();
  await page.getByRole('button', { name: copy.portfolio.certificatesEmpty.action, exact: true }).click();
  await expect(projectsTab).toHaveAttribute('aria-selected', 'true');

  await stackTab.click();
  await expect(stackTab).toHaveAttribute('aria-selected', 'true');
  await expect(page.getByText(copy.portfolio.stackGroups.languages, { exact: true })).toBeVisible();

  // Each key is followed by an assertion on focus AND selection, so the transition has settled before the next key.
  await projectsTab.focus();
  await page.keyboard.press('ArrowRight');
  await expect(certTab).toBeFocused();
  await expect(certTab).toHaveAttribute('aria-selected', 'true');
  await page.keyboard.press('End');
  await expect(stackTab).toBeFocused();
  await expect(stackTab).toHaveAttribute('aria-selected', 'true');
  await page.keyboard.press('ArrowRight');
  await expect(projectsTab).toBeFocused();
  await expect(projectsTab).toHaveAttribute('aria-selected', 'true');
  await page.keyboard.press('ArrowLeft');
  await expect(stackTab).toBeFocused();
  await expect(stackTab).toHaveAttribute('aria-selected', 'true');
  await page.keyboard.press('Home');
  await expect(projectsTab).toBeFocused();
  await expect(projectsTab).toHaveAttribute('aria-selected', 'true');
});

for (const project of PROJECTS) {
  test(`detail page for ${project.slug}: title, back link, demo and repo states`, async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: `${copy.portfolio.details}: ${project.title}`, exact: true }).click();
    await expect(page).toHaveURL(new RegExp(`/portfolio/${project.slug}$`));
    await expect(page.getByRole('heading', { level: 1, name: project.title, exact: true })).toBeVisible();

    if (project.demo) {
      await expect(page.getByRole('link', { name: copy.project.demo, exact: true })).toHaveAttribute('href', project.demo);
    } else {
      await expect(page.getByRole('button', { name: copy.project.noDemo, exact: true })).toBeDisabled();
      await expect(page.getByRole('link', { name: copy.project.demo, exact: true })).toHaveCount(0);
    }

    if (project.repo) {
      await expect(page.getByRole('link', { name: copy.project.repo, exact: true })).toHaveAttribute('href', project.repo);
    } else {
      await expect(page.getByRole('button', { name: copy.project.privateRepo, exact: true })).toBeDisabled();
      await expect(page.getByRole('link', { name: copy.project.repo, exact: true })).toHaveCount(0);
    }

    await page.getByRole('link', { name: copy.project.back, exact: true }).click();
    await expect(page).toHaveURL(/\/#portfolio$/);
    await expect(page.locator('#portfolio')).toBeVisible();
  });
}

test('Baixar currículo links to the PDF and the PDF is served as application/pdf', async ({ page, request }) => {
  await page.goto('/#about');
  await expect(page.getByRole('link', { name: copy.about.download, exact: true })).toHaveAttribute(
    'href',
    '/cv/luiz-gustavo-enz-cv.pdf',
  );
  const res = await request.get('/cv/luiz-gustavo-enz-cv.pdf');
  expect(res.status()).toBe(200);
  expect(res.headers()['content-type']).toContain('application/pdf');
});

test('contact: empty submit shows pt-BR validation messages', async ({ page }) => {
  await page.goto('/#contato');
  await page.getByRole('button', { name: copy.contact.submit, exact: true }).click();
  await expect(page.getByText(copy.contact.errors.name, { exact: true })).toBeVisible();
  await expect(page.getByText(copy.contact.errors.email, { exact: true })).toBeVisible();
  // An empty message is reported by the required rule (client and server share the code message_required).
  await expect(page.getByText(copy.contact.errors.message, { exact: true })).toBeVisible();
});

test('contact: honeypot filled returns generic success and does not send', async ({ page }) => {
  const captured = await captureContactPosts(page);
  await page.goto('/#contato');
  await fillContact(page);
  await page.locator('input[name="company"]').evaluate((el: HTMLInputElement) => {
    el.value = 'bot-value';
  });
  await page.getByRole('button', { name: copy.contact.submit, exact: true }).click();
  await expect.poll(() => captured.length).toBe(1);
  expect(captured[0]?.status).toBe(200);
  expect(JSON.parse(captured[0]?.body ?? 'null')).toEqual({ ok: true });
  await expect(page.getByRole('status')).toHaveText(copy.contact.success);
});

test('contact: valid submit without Resend config returns a safe error, no stack or secret', async ({ page }) => {
  const captured = await captureContactPosts(page);
  await page.goto('/#contato');
  await fillContact(page);
  await page.getByRole('button', { name: copy.contact.submit, exact: true }).click();
  await expect.poll(() => captured.length).toBe(1);
  const [result] = captured;
  // 503 not_configured on a clean setup; 429 when earlier runs used up the 3-per-10-min contact limit.
  expect([429, 503]).toContain(result?.status);
  expect(looksSafe(result?.body ?? '')).toBe(true);
  const status = page.getByRole('status');
  await expect(status).not.toHaveText(copy.contact.success);
  await expect(status).toHaveText(
    new RegExp(`${escapeRegExp(copy.contact.errors.generic)}|${escapeRegExp(copy.contact.errors.rateLimit)}`),
  );
});

test('comments: panel absent and /api/comments returns 404 when disabled', async ({ page, request }) => {
  await page.goto('/#contato');
  await expect(page.getByRole('button', { name: copy.comments.submit, exact: true })).toHaveCount(0);
  await expect(page.getByRole('heading', { name: copy.comments.title, exact: true })).toHaveCount(0);
  expect((await request.get('/api/comments')).status()).toBe(404);
  expect((await request.post('/api/comments', { data: {} })).status()).toBe(404);
});

test('unknown route renders the pt-BR 404 page', async ({ page }) => {
  const res = await page.goto('/rota-que-nao-existe');
  expect(res?.status()).toBe(404);
  await expect(page.getByRole('heading', { level: 1, name: copy.notFound.title, exact: true })).toBeVisible();
  await expect(page.getByText(copy.notFound.text, { exact: true })).toBeVisible();
  await expect(page.getByRole('link', { name: copy.notFound.action, exact: true })).toHaveAttribute('href', '/');
});

function escapeRegExp(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
