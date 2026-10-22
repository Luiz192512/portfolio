import { test, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

/*
 * Phase 7 accessibility scan. Read-only QA: records PASS / FAIL / REVIEW rows,
 * never asserts the build away. Output goes to A11Y_OUT (default test-results/a11y).
 * Run against a started server: PLAYWRIGHT_BASE_URL=http://localhost:3121 npx playwright test e2e/a11y.spec.ts --reporter=list
 */

type Status = 'PASS' | 'FAIL' | 'REVIEW';
type Severity = 'blocker' | 'major' | 'minor';
type Rec = {
  project: string;
  route: string;
  check: string;
  status: Status;
  severity?: Severity;
  rule?: string;
  target?: string;
  detail?: string;
};
type Stop = { i: number; tag: string; role: string | null; name: string; ring: boolean; ringDetail: string; inDialog: boolean };

const OUT_DIR = process.env.A11Y_OUT ?? join(process.cwd(), 'test-results', 'a11y');
const ROUTES = ['/', '/portfolio/tszr15', '/portfolio/curbside'];
const TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'best-practice'];
const TOUCH_MIN = 44;
const MAX_TABS = 80;
const records: Rec[] = [];

const slug = (route: string) => (route === '/' ? 'home' : route.replace(/\//g, '_').replace(/^_/, ''));

function rec(project: string, route: string, check: string, status: Status, extra: Partial<Rec> = {}) {
  records.push({ project, route, check, status, ...extra });
  mkdirSync(OUT_DIR, { recursive: true });
  writeFileSync(join(OUT_DIR, `${project}.json`), JSON.stringify(records.filter((r) => r.project === project), null, 2));
}

const sev = (impact?: string | null): Severity => (impact === 'critical' ? 'blocker' : impact === 'serious' ? 'major' : 'minor');

async function settle(page: Page) {
  await page.waitForLoadState('load');
  // Entry animations finish within about 1.6 s (DESIGN.md timeline).
  await page.waitForTimeout(2500);
}

async function axe(page: Page, project: string, route: string, state: string) {
  const res = await new AxeBuilder({ page }).withTags(TAGS).analyze();
  if (res.violations.length === 0) {
    rec(project, route, `axe ${state}`, 'PASS', { detail: `${res.passes.length} rules passed, 0 violations` });
  }
  for (const v of res.violations) {
    for (const n of v.nodes.slice(0, 6)) {
      rec(project, route, `axe ${state}`, 'FAIL', {
        severity: sev(v.impact),
        rule: v.id,
        target: n.target.map(String).join(' '),
        detail: `${v.help} | ${n.failureSummary?.replace(/\s+/g, ' ').slice(0, 220) ?? ''}`,
      });
    }
  }
  for (const v of res.incomplete) {
    for (const n of v.nodes.slice(0, 4)) {
      rec(project, route, `axe ${state}`, 'REVIEW', {
        severity: sev(v.impact),
        rule: v.id,
        target: n.target.map(String).join(' '),
        detail: v.help,
      });
    }
  }
}

async function structure(page: Page, project: string, route: string) {
  const lang = await page.locator('html').getAttribute('lang');
  rec(project, route, 'html lang', lang === 'pt-BR' ? 'PASS' : 'FAIL', {
    severity: 'major',
    rule: 'html-has-lang',
    detail: `lang=${lang}`,
  });

  const h1 = await page.locator('h1').count();
  rec(project, route, 'one h1', h1 === 1 ? 'PASS' : 'FAIL', {
    severity: 'major',
    rule: 'page-has-heading-one',
    detail: `h1 count ${h1}`,
  });

  const heads = await page.$$eval('h1,h2,h3,h4,h5,h6', (els) =>
    els
      .filter((e) => e.getClientRects().length > 0)
      .map((e) => ({ lvl: Number(e.tagName[1]), text: (e.textContent ?? '').replace(/\s+/g, ' ').trim().slice(0, 50) })),
  );
  const jumps: string[] = [];
  let prev = 0;
  for (const h of heads) {
    if (prev && h.lvl > prev + 1) jumps.push(`h${prev} -> h${h.lvl} "${h.text}"`);
    prev = h.lvl;
  }
  rec(project, route, 'heading order', jumps.length ? 'FAIL' : 'PASS', {
    severity: 'minor',
    rule: 'heading-order',
    target: jumps.join(' ; ') || undefined,
    detail: `${heads.length} visible headings`,
  });

  const lm = await page.evaluate(() => ({
    banner: document.querySelectorAll('header, [role=banner]').length,
    nav: document.querySelectorAll('nav, [role=navigation]').length,
    main: document.querySelectorAll('main, [role=main]').length,
    contentinfo: document.querySelectorAll('footer, [role=contentinfo]').length,
    navNames: Array.from(document.querySelectorAll('nav')).map((n) => n.getAttribute('aria-label') ?? '(none)'),
  }));
  const lmOk = lm.banner >= 1 && lm.nav >= 1 && lm.main === 1 && lm.contentinfo >= 1;
  rec(project, route, 'landmarks', lmOk ? 'PASS' : 'FAIL', {
    severity: 'major',
    rule: 'landmark-one-main / region',
    detail: `banner ${lm.banner}, nav ${lm.nav} [${lm.navNames.join(', ')}], main ${lm.main}, contentinfo ${lm.contentinfo}`,
  });

  const imgs = await page.$$eval('img', (els) =>
    els.map((i) => ({
      alt: i.getAttribute('alt'),
      hidden: !!i.closest('[aria-hidden="true"]') || i.getClientRects().length === 0,
      src: (i.getAttribute('src') ?? '').slice(0, 70),
    })),
  );
  const missingAlt = imgs.filter((i) => i.alt === null && !i.hidden);
  rec(project, route, 'img alt attribute', missingAlt.length ? 'FAIL' : 'PASS', {
    severity: 'major',
    rule: 'image-alt',
    target: missingAlt.map((i) => i.src).join(' | ') || undefined,
    detail: `${imgs.length} img elements`,
  });
  const alts = imgs.filter((i) => !i.hidden && i.alt).map((i) => `"${i.alt}"`);
  rec(project, route, 'img alt text (manual read)', 'REVIEW', { detail: alts.join(', ') || 'no visible alt text' });

  const links = await page.$$eval('a[href]', (els) =>
    els
      .filter((e) => e.getClientRects().length > 0 && !e.closest('[aria-hidden="true"]'))
      .map((e) => {
        const aria = e.getAttribute('aria-label')?.trim();
        const txt = (e.textContent ?? '').replace(/\s+/g, ' ').trim();
        const img = e.querySelector('img');
        const svgTitle = e.querySelector('svg title')?.textContent?.trim();
        const name = aria || txt || img?.getAttribute('alt') || svgTitle || e.getAttribute('title') || '';
        return { href: (e.getAttribute('href') ?? '').slice(0, 60), name: name.slice(0, 70) };
      }),
  );
  const emptyLinks = links.filter((l) => !l.name);
  rec(project, route, 'link accessible names', emptyLinks.length ? 'FAIL' : 'PASS', {
    severity: 'major',
    rule: 'link-name',
    target: emptyLinks.map((l) => l.href).join(' | ') || undefined,
    detail: `${links.length} visible links: ${links.map((l) => `${l.name} (${l.href})`).join('; ').slice(0, 900)}`,
  });

  const buttons = await page.$$eval('button', (els) =>
    els
      .filter((e) => e.getClientRects().length > 0 && !e.closest('[aria-hidden="true"]'))
      .map((e) => {
        const name =
          e.getAttribute('aria-label')?.trim() || (e.textContent ?? '').replace(/\s+/g, ' ').trim() || e.getAttribute('title') || '';
        return { name: name.slice(0, 60), cls: (e.className?.toString() ?? '').slice(0, 40) };
      }),
  );
  const emptyButtons = buttons.filter((b) => !b.name);
  rec(project, route, 'button accessible names', emptyButtons.length ? 'FAIL' : 'PASS', {
    severity: 'major',
    rule: 'button-name',
    target: emptyButtons.map((b) => b.cls).join(' | ') || undefined,
    detail: `${buttons.length} visible buttons: ${buttons.map((b) => b.name).join('; ')}`,
  });

  if (route === '/') {
    const hp = await page.$eval('input[name=company]', (el) => ({
      tabIndex: el.getAttribute('tabindex'),
      ariaHidden: !!el.closest('[aria-hidden="true"]'),
    })).catch(() => null);
    rec(project, route, 'honeypot excluded from tab order', hp && hp.tabIndex === '-1' && hp.ariaHidden ? 'PASS' : 'FAIL', {
      severity: 'minor',
      detail: JSON.stringify(hp),
    });
  }
}

async function touch(page: Page, project: string, route: string, state: string) {
  const small = await page.$$eval(
    'a[href],button,input,select,textarea,[role=tab],[role=button]',
    (els, min) =>
      els
        .map((e) => {
          const r = e.getBoundingClientRect();
          const cs = getComputedStyle(e);
          return {
            tag: e.tagName.toLowerCase(),
            name: (e.getAttribute('aria-label') || e.textContent || e.getAttribute('name') || '').replace(/\s+/g, ' ').trim().slice(0, 40),
            w: Math.round(r.width),
            h: Math.round(r.height),
            visible: r.width > 0 && r.height > 0 && cs.visibility !== 'hidden' && cs.display !== 'none',
            tabindex: e.getAttribute('tabindex'),
            hidden: !!e.closest('[aria-hidden="true"]'),
            min,
          };
        })
        .filter((x) => x.visible && !x.hidden && x.tabindex !== '-1' && (x.w < x.min || x.h < x.min)),
    TOUCH_MIN,
  );
  rec(project, route, `touch targets ${state}`, small.length ? 'FAIL' : 'PASS', {
    severity: 'major',
    rule: 'target-size (DESIGN.md 44 px rule; WCAG 2.5.5 AAA)',
    target: small.map((s) => `${s.tag} "${s.name}" ${s.w}x${s.h}`).join(' | ') || undefined,
    detail: `${small.length} interactive elements below ${TOUCH_MIN} px`,
  });
}

async function keyboardPass(page: Page, project: string, route: string) {
  await page.keyboard.press('Tab');
  const stops: Stop[] = [];
  let ended = false;
  let trapped = false;
  let same = 0;
  let last = '';
  for (let i = 0; i < MAX_TABS; i++) {
    const s = await page.evaluate(() => {
      const el = document.activeElement as HTMLElement | null;
      if (!el || el === document.body || el === document.documentElement) return null;
      const cs = getComputedStyle(el);
      const outline = cs.outlineStyle !== 'none' && parseFloat(cs.outlineWidth) > 0;
      const shadow = cs.boxShadow !== 'none';
      const name = (
        el.getAttribute('aria-label') ||
        el.getAttribute('alt') ||
        (el.textContent ?? '').replace(/\s+/g, ' ').trim() ||
        el.getAttribute('name') ||
        el.tagName
      ).slice(0, 60);
      return {
        tag: el.tagName.toLowerCase(),
        role: el.getAttribute('role'),
        name,
        ring: outline || shadow,
        ringDetail: `outline ${cs.outlineStyle} ${cs.outlineWidth} ${cs.outlineColor}; shadow ${cs.boxShadow.slice(0, 90)}`,
        inDialog: !!el.closest('dialog'),
      };
    });
    if (!s) {
      ended = true;
      break;
    }
    const key = `${s.tag}|${s.name}`;
    same = key === last ? same + 1 : 0;
    last = key;
    stops.push({ i, ...s });
    if (same >= 3) {
      trapped = true;
      break;
    }
    await page.keyboard.press('Tab');
  }

  const first = stops[0];
  rec(project, route, 'skip link is first tab stop', first && first.name.includes('Pular') ? 'PASS' : 'FAIL', {
    severity: 'major',
    rule: 'bypass (WCAG 2.4.1)',
    detail: `first stop: ${first ? `${first.tag} "${first.name}"` : 'none'}`,
  });
  rec(project, route, 'tab order', 'PASS', {
    detail: `${stops.length} stops, ended=${ended}: ${stops.map((s) => `${s.tag}:${s.name.slice(0, 24)}`).join(' > ')}`.slice(0, 2400),
  });
  const noRing = stops.filter((s) => !s.ring);
  for (const s of noRing.slice(0, 12)) {
    rec(project, route, 'visible focus on every stop', 'FAIL', {
      severity: 'major',
      rule: 'focus-visible (manual, WCAG 2.4.7)',
      target: `${s.tag} "${s.name}"`,
      detail: s.ringDetail,
    });
  }
  if (noRing.length === 0) rec(project, route, 'visible focus on every stop', 'PASS', { detail: `${stops.length} stops with outline or box-shadow` });
  if (trapped) {
    rec(project, route, 'no keyboard trap', 'FAIL', { severity: 'blocker', rule: 'keyboard-trap (manual, WCAG 2.1.2)', target: last });
  } else if (!ended) {
    rec(project, route, 'no keyboard trap', 'REVIEW', { detail: `stopped after ${MAX_TABS} stops without a repeat` });
  } else {
    rec(project, route, 'no keyboard trap', 'PASS', { detail: 'focus left the document after the last stop' });
  }
  const dialogStops = stops.filter((s) => s.inDialog).length;
  if (dialogStops === 0) rec(project, route, 'focus in closed menu', 'PASS', { detail: 'no dialog stops in default state' });
}

async function tabStates(page: Page, project: string, route: string) {
  const tabs = page.getByRole('tab');
  const n = await tabs.count();
  rec(project, route, 'portfolio tab count', n === 3 ? 'PASS' : 'FAIL', { severity: 'minor', detail: `${n} tabs` });
  for (let i = 0; i < n; i++) {
    const label = ((await tabs.nth(i).textContent()) ?? `tab ${i}`).replace(/\s+/g, ' ').trim();
    await tabs.nth(i).click();
    await page.waitForTimeout(800);
    const selected = await tabs.nth(i).getAttribute('aria-selected');
    const panelId = await tabs.nth(i).getAttribute('aria-controls');
    const panelVisible = panelId ? await page.locator(`[id="${panelId}"]`).isVisible() : false;
    rec(project, route, `tab selected: ${label}`, selected === 'true' && panelVisible ? 'PASS' : 'FAIL', {
      severity: 'major',
      rule: 'aria-valid-attr-value / WAI-ARIA tabs',
      detail: `aria-selected=${selected}, panel ${panelId} visible=${panelVisible}`,
    });
    await axe(page, project, route, `tab selected: ${label}`);
  }
}

async function tablistKeys(page: Page, project: string, route: string) {
  const tabs = page.locator('[role=tab]');
  const n = await tabs.count();
  if (n < 2) return;
  const state = () =>
    page.evaluate(() => {
      const t = Array.from(document.querySelectorAll('[role=tab]'));
      return {
        sel: t.findIndex((x) => x.getAttribute('aria-selected') === 'true'),
        focus: t.indexOf(document.activeElement as Element),
      };
    });
  await tabs.nth(0).focus();
  const seq: Array<[string, number]> = [
    ['ArrowRight', 1],
    ['ArrowRight', 2],
    ['ArrowRight', 0],
    ['ArrowLeft', 2],
    ['End', n - 1],
    ['Home', 0],
  ];
  const got: string[] = [];
  let ok = true;
  for (const [key, want] of seq) {
    await page.keyboard.press(key);
    await page.waitForTimeout(200);
    const s = await state();
    got.push(`${key}: selected ${s.sel}, focus ${s.focus}`);
    if (s.sel !== want || s.focus !== want) ok = false;
  }
  rec(project, route, 'tabs ArrowLeft/Right/Home/End', ok ? 'PASS' : 'FAIL', {
    severity: 'major',
    rule: 'WAI-ARIA tabs keyboard (manual)',
    detail: got.join('; '),
  });

  await page.keyboard.press('Tab');
  const leftList = await page.evaluate(() => {
    const a = document.activeElement;
    return a?.getAttribute('role') !== 'tab' && !!a?.closest('[role=tabpanel]') === true;
  });
  rec(project, route, 'Tab leaves tablist into panel', leftList ? 'PASS' : 'REVIEW', {
    severity: 'minor',
    detail: 'roving tabindex: one Tab press should land in the active tabpanel',
  });
}

async function menuChecks(page: Page, project: string, route: string) {
  const toggle = page.getByRole('button', { name: /^(Abrir|Fechar) menu$/ }).first();
  if (!(await toggle.isVisible())) {
    rec(project, route, 'mobile menu toggle', 'PASS', { detail: 'toggle hidden at this viewport (desktop nav)' });
    return;
  }
  await toggle.focus();
  await page.keyboard.press('Enter');
  await page.waitForTimeout(600);
  const opened = (await page.locator('dialog[open]').count()) === 1;
  rec(project, route, 'menu opens with Enter', opened ? 'PASS' : 'FAIL', { severity: 'blocker', detail: `dialog open=${opened}` });
  if (!opened) return;

  await axe(page, project, route, 'mobile menu open');
  await touch(page, project, route, 'mobile menu open');

  let escaped = 0;
  for (let i = 0; i < 12; i++) {
    await page.keyboard.press('Tab');
    const inside = await page.evaluate(() => !!document.activeElement?.closest('dialog'));
    if (!inside) escaped++;
  }
  rec(project, route, 'menu focus stays inside dialog', escaped === 0 ? 'PASS' : 'FAIL', {
    severity: 'major',
    rule: 'modal focus trap (manual)',
    detail: `${escaped} of 12 Tab presses left the dialog`,
  });

  await page.keyboard.press('Escape');
  await page.waitForTimeout(500);
  const closed = (await page.locator('dialog[open]').count()) === 0;
  rec(project, route, 'Escape closes mobile menu', closed ? 'PASS' : 'FAIL', { severity: 'major', detail: `dialog closed=${closed}` });
  const back = await page.evaluate(() => document.activeElement?.getAttribute('aria-label') ?? '');
  rec(project, route, 'focus returns to menu toggle', /menu$/.test(back) ? 'PASS' : 'FAIL', {
    severity: 'minor',
    detail: `activeElement aria-label="${back}"`,
  });
}

async function cardKeys(page: Page, project: string, route: string) {
  await page.getByRole('tab').first().click();
  await page.waitForTimeout(500);
  const card = page.locator('#portfolio a[href^="/portfolio/"]').first();
  if ((await card.count()) === 0) {
    rec(project, route, 'project card control', 'FAIL', { severity: 'blocker', detail: 'no card link found in #portfolio' });
    return;
  }
  const tag = await card.evaluate((e) => e.tagName.toLowerCase());
  const label = (await card.getAttribute('aria-label')) ?? '';
  await card.scrollIntoViewIfNeeded();
  await card.focus();
  await page.keyboard.press('Enter');
  let navigated = true;
  try {
    await page.waitForURL(/\/portfolio\/[^/?#]+/, { timeout: 8000 });
  } catch {
    navigated = false;
  }
  rec(project, route, 'card Enter opens detail', navigated ? 'PASS' : 'FAIL', {
    severity: 'blocker',
    detail: `element ${tag} "${label}" -> ${navigated ? page.url() : 'no navigation'}`,
  });
  if (!navigated) return;

  await page.goBack();
  await page.waitForURL((u) => new URL(u).pathname === '/', { timeout: 8000 });
  await settle(page);
  await page.getByRole('tab').first().click();
  await page.waitForTimeout(500);
  const card2 = page.locator('#portfolio a[href^="/portfolio/"]').first();
  await card2.focus();
  await page.keyboard.press('Space');
  await page.waitForTimeout(1500);
  const moved = new URL(page.url()).pathname !== '/';
  if (tag === 'a') {
    rec(project, route, 'card Space key', 'REVIEW', {
      severity: 'minor',
      rule: 'native link behaviour (manual)',
      detail: `control is an <a> (${moved ? 'Space navigated' : 'Space did not navigate'}); HTML links activate on Enter only. Confirm the spec wants Space too.`,
    });
  } else {
    rec(project, route, 'card Space key', moved ? 'PASS' : 'FAIL', { severity: 'blocker', detail: `element ${tag}` });
  }
}

test.describe('phase 7 a11y scan', () => {
  test.setTimeout(300_000);

  for (const route of ROUTES) {
    test(`scan ${route}`, async ({ page }, info) => {
      const project = info.project.name;
      const mobile = project === 'mobile';

      await page.goto(route);
      await settle(page);
      rec(project, route, 'viewport', 'PASS', { detail: JSON.stringify(page.viewportSize()) });

      await axe(page, project, route, 'default');
      await structure(page, project, route);

      await keyboardPass(page, project, route);
      await page.evaluate(() => (document.activeElement as HTMLElement | null)?.blur());
      await page.keyboard.press('Tab').catch(() => undefined);
      await page.reload();
      await settle(page);

      if (route === '/') {
        await tablistKeys(page, project, route);
        await tabStates(page, project, route);
        await cardKeys(page, project, route);
        await page.reload();
        await settle(page);
      }

      if (mobile) {
        await menuChecks(page, project, route);
        await page.reload();
        await settle(page);
        await touch(page, project, route, 'default');
      }
    });
  }
});

test.describe('phase 7 a11y reduced motion', () => {
  test.use({ reducedMotion: 'reduce' });
  test.setTimeout(240_000);

  for (const route of ROUTES) {
    test(`reduced motion ${route}`, async ({ page }, info) => {
      const project = info.project.name;
      await page.goto(route);
      await settle(page);
      const rm = await page.evaluate(() => matchMedia('(prefers-reduced-motion: reduce)').matches);
      rec(project, route, 'prefers-reduced-motion emulated', rm ? 'PASS' : 'FAIL', { severity: 'minor', detail: `matches=${rm}` });
      await axe(page, project, route, 'reduced motion');
    });
  }
});
