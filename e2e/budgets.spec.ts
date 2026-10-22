import { chromium, expect, test, type Browser, type BrowserContext, type Page } from '@playwright/test';
import { join } from 'node:path';
import {
  INIT_SCRIPT,
  PROFILES,
  ROUTES,
  SAVE_DATA_SCRIPT,
  ACTIVATE_SELECTOR,
  captureNet,
  hasHScroll,
  readMarks,
  tapCard,
  waitReady,
  median,
  newProfileContext,
  pct,
  rendererInfo,
  sampleFrames,
  settle,
  webVitalsScript,
  type Net,
  type ProfileName,
} from './helpers/probes';
import { buildReport, writeReport, type Results } from './helpers/report';

/* eslint-disable @typescript-eslint/no-explicit-any */

// Browser args that let headless Chromium create a WebGL context (software GL when no GPU).
const GL_ARGS = ['--ignore-gpu-blocklist', '--enable-unsafe-swiftshader', '--use-angle=swiftshader', '--use-gl=angle'];
const REPORT = join(process.cwd(), 'docs', 'pipeline', '06-budgets.md');
const R: Results = {
  meta: { date: new Date().toISOString().slice(0, 10), browser: '', headless: 'yes', args: GL_ARGS.join(' ') },
  issues: [] as string[],
};

test.describe.configure({ mode: 'serial' });
test.setTimeout(180_000);
test.beforeEach(({ browserName }, info) => {
  void browserName;
  test.skip(info.project.name !== 'desktop', 'both profiles are driven inside this spec');
});

let browser: Browser;

test.beforeAll(async () => {
  browser = await chromium.launch({ args: GL_ARGS });
  R.meta.browser = `Chromium ${browser.version()}`;
});

test.afterAll(async () => {
  await browser?.close();
  if (R.desktop && R.mobile && R.desktop.fps && R.mobile.routes) {
    writeReport(REPORT, buildReport(R));
  }
});

async function cpuThrottle(ctx: BrowserContext, page: Page, rate: number) {
  const cdp = await ctx.newCDPSession(page);
  await cdp.send('Emulation.setCPUThrottlingRate', { rate });
  return cdp;
}

async function scrollAll(page: Page) {
  const h = await page.evaluate(() => document.documentElement.scrollHeight);
  const vh = page.viewportSize()!.height;
  for (let y = 0; y < h; y += Math.round(vh * 0.6)) {
    await page.evaluate((yy) => window.scrollTo(0, yy), y);
    await page.waitForTimeout(180);
  }
  await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
  await page.waitForTimeout(400);
}

function tbtOf(m: any, upTo: number): number {
  const fcp = m.fcp ?? 0;
  return m.longtasks.filter((t: any) => t.s >= fcp && t.s <= upTo).reduce((s: number, t: any) => s + Math.max(0, t.d - 50), 0);
}

async function loadHome(page: Page, net: Net, waitReadyMs = 8000) {
  await page.goto('/', { waitUntil: 'load' });
  if (waitReadyMs > 0) {
    await page
      .waitForFunction(() => (window as any).__m.regionAt !== null, null, { timeout: waitReadyMs })
      .catch(() => undefined);
  } else {
    await page.waitForTimeout(3500);
  }
  await settle(net);
}

/** Mobile: tap the card, wait for lanyard:ready, collect post-tap metrics. */
async function tapAndMeasure(page: Page, net: Net, how: 'tap' | 'enter' | 'space' = 'tap') {
  const m0 = await page.evaluate(() => JSON.parse(JSON.stringify((window as any).__m)));
  const jsBefore = net.js.length;
  const tapAt = await tapCard(page, how);
  const ready = await waitReady(page, 25_000);
  await page.waitForTimeout(3000);
  await settle(net);
  const m1 = await page.evaluate(() => JSON.parse(JSON.stringify((window as any).__m)));
  const end = await page.evaluate(() => performance.now());
  const marks = await readMarks(page);
  const lt = m1.longtasks.filter((t: any) => t.s >= tapAt);
  return {
    ready,
    tapAt,
    importAt: marks.importAt,
    readyAt: marks.readyAt,
    toReady: marks.readyAt != null ? marks.readyAt - tapAt : null,
    tbt: lt.reduce((s: number, t: any) => s + Math.max(0, t.d - 50), 0),
    longest: Math.max(0, ...lt.map((t: any) => t.d)),
    nLong: lt.length,
    clsAfter: m1.cls - m0.cls,
    chunks: net.js.slice(jsBefore).map((j) => ({ url: j.url, gz: j.gz, raw: j.raw, at: j.at, hasRapier: j.hasRapier })),
    canvas: (await page.locator('canvas').count()) > 0,
    region: (await page.locator('[role="region"][aria-label^="Crach"]').count()) > 0,
    end,
  };
}

async function regionBox(page: Page) {
  const box = await page.locator('[role="region"][aria-label^="Crach"], [role="img"][aria-label^="Foto"]').first().boundingBox();
  if (!box) throw new Error('lanyard box not found');
  return box;
}

for (const profile of ['desktop', 'mobile'] as ProfileName[]) {
  test.describe(profile, () => {
    const D: Record<string, any> = {};
    R[profile] = D;

    test('entry timeline, LCP, CLS, long tasks, JS inventory', async () => {
      const ctx = await newProfileContext(browser, profile);
      await ctx.addInitScript(INIT_SCRIPT);
      const page = await ctx.newPage();
      const net = captureNet(page);
      await loadHome(page, net, PROFILES[profile].mobile ? 0 : 8000);
      D.renderer = await rendererInfo(page);
      const m0 = await page.evaluate(() => JSON.parse(JSON.stringify((window as any).__m)));
      // 3 s after 3D ready (or 6 s when 3D never became ready) for the load-phase CLS.
      await page.waitForTimeout(m0.regionAt ? 3000 : 6000);
      const m1 = await page.evaluate(() => JSON.parse(JSON.stringify((window as any).__m)));
      const clsLoad = m1.cls;
      D.noTapJs = net.js.map((j) => ({ url: j.url, gz: j.gz, raw: j.raw }));
      D.noTapCanvas0 = (await page.locator('canvas').count()) > 0;
      const windowEnd = await page.evaluate(() => performance.now());
      await scrollAll(page);
      const m2 = await page.evaluate(() => JSON.parse(JSON.stringify((window as any).__m)));
      D.normal = { m: m2, net: JSON.parse(JSON.stringify({ ...net })), longtasks: m1.longtasks, tbt: tbtOf(m1, windowEnd) };
      D.cls = { load: clsLoad, total: m2.cls };
      D.marks = await readMarks(page);
      D.noTapCanvas = (await page.locator('canvas').count()) > 0;
      D.noTapButton = (await page.locator(ACTIVATE_SELECTOR).count()) > 0;
      // two more plain loads: LCP and TBT are noisy, report the median of three
      const lcps = [m2.lcp?.t ?? NaN];
      const tbts = [D.normal.tbt as number];
      const entryRuns: any[] = [m2.entry];
      for (let i = 0; i < 2; i++) {
        const pg = await ctx.newPage();
        const n2 = captureNet(pg);
        await pg.goto('/', { waitUntil: 'load' });
        await pg.waitForTimeout(5000);
        await settle(n2);
        const mm = await pg.evaluate(() => JSON.parse(JSON.stringify((window as any).__m)));
        const end = await pg.evaluate(() => performance.now());
        entryRuns.push(mm.entry);
        lcps.push(mm.lcp?.t ?? NaN);
        tbts.push(tbtOf(mm, end));
        await pg.close();
      }
      D.entryRuns = entryRuns;
      D.runs = { lcps, tbts, lcp: median(lcps), tbt: median(tbts) };
      await ctx.close();
      expect(m2.entry.h1).toBeTruthy();
    });

    if (profile === 'mobile') {
      test('mobile load under CPU 4x', async () => {
        const ctx = await newProfileContext(browser, profile);
        await ctx.addInitScript(INIT_SCRIPT);
        const page = await ctx.newPage();
        await cpuThrottle(ctx, page, 4);
        const net = captureNet(page);
        await loadHome(page, net, 0);
        await page.waitForTimeout(3000);
        const m = await page.evaluate(() => JSON.parse(JSON.stringify((window as any).__m)));
        const end = await page.evaluate(() => performance.now());
        D.slow = { m, longtasks: m.longtasks, tbt: tbtOf(m, end), cls: m.cls };
        D.slowTap = await tapAndMeasure(page, net);
        await ctx.close();
      });

      test('mobile tap path (unthrottled) and keyboard activation', async () => {
        const ctx = await newProfileContext(browser, profile);
        await ctx.addInitScript(INIT_SCRIPT);
        const page = await ctx.newPage();
        const net = captureNet(page);
        await loadHome(page, net, 0);
        D.tap = await tapAndMeasure(page, net);
        D.threeNet = JSON.parse(JSON.stringify({ ...net }));
        await ctx.close();
        D.kbd = {};
        for (const key of ['enter', 'space'] as const) {
          const c = await newProfileContext(browser, profile);
          await c.addInitScript(INIT_SCRIPT);
          const pg = await c.newPage();
          const n = captureNet(pg);
          await loadHome(pg, n, 0);
          const r = await tapAndMeasure(pg, n, key);
          D.kbd[key] = { ready: r.ready, canvas: r.canvas, region: r.region, toReady: r.toReady, errors: n.console.length + n.pageErrors.length };
          await c.close();
        }
      });
    }

    test('fallback: prefers-reduced-motion (also first-load JS baseline)', async () => {
      const ctx = await newProfileContext(browser, profile, { reducedMotion: 'reduce' });
      await ctx.addInitScript(INIT_SCRIPT);
      const page = await ctx.newPage();
      const net = captureNet(page);
      await page.goto('/', { waitUntil: 'load' });
      await page.waitForTimeout(3000);
      await settle(net);
      const m = await page.evaluate(() => JSON.parse(JSON.stringify((window as any).__m)));
      const residual = async () =>
        page.evaluate(() =>
          [...document.querySelectorAll('[data-entry]')]
            .map((e) => ({ step: e.getAttribute('data-entry'), tf: getComputedStyle(e).transform, op: parseFloat(getComputedStyle(e).opacity) }))
            .filter((e) => e.op > 0.5 && e.tf !== 'none' && e.tf !== 'matrix(1, 0, 0, 1, 0, 0)')
            .map((e) => `${e.step}:${e.tf}`),
        );
      const residualHero = await residual();
      const jsBefore = net.js.map((j) => ({ url: j.url, gz: j.gz, raw: j.raw }));
      const extraBefore = net.js.filter((j) => j.afterLoad && j.at > (net.loadAt ?? 0) + 200).length;
      await scrollAll(page);
      const residualAfterScroll = await residual();
      D.jsBase = jsBefore;
      const durs = Object.entries(m.entry as Record<string, any>)
        .filter(([, v]) => v.start != null && v.end != null)
        .map(([k, v]) => `${k} ${Math.round(v.end - v.start)}ms`)
        .join(' ');
      D.reduced = {
        canvas: await page.locator('canvas').count().then((n) => n > 0),
        caption: await page.getByText('ARRASTE O CRACHÁ').count().then((n) => n > 0),
        mark: await page.evaluate(() => performance.getEntriesByName('lanyard:import').length > 0),
        extraJs: extraBefore,
        transformSteps: Object.entries(m.entry as Record<string, any>).filter(([, v]) => v.visibleTransformChange).map(([k]) => k),
        durs: durs || 'n/a',
        durMax: Math.max(0, ...Object.values(m.entry as Record<string, any>).filter((v: any) => v.start != null && v.end != null).map((v: any) => v.end - v.start)),
        button: await page.locator(ACTIVATE_SELECTOR).count().then((n) => n > 0),
        residual: [...new Set([...residualHero, ...residualAfterScroll])],
        net,
      };
      await ctx.close();
    });

    test('fallback: WebGL disabled and Save-Data', async () => {
      const b2 = await chromium.launch({ args: ['--disable-webgl', '--disable-webgl2', '--disable-3d-apis'] });
      const ctx = await newProfileContext(b2, profile);
      await ctx.addInitScript(INIT_SCRIPT);
      const page = await ctx.newPage();
      const net = captureNet(page);
      await page.goto('/', { waitUntil: 'load' });
      await page.waitForTimeout(3500);
      await settle(net);
      const base = new Set((D.jsBase as any[]).map((j) => j.url));
      if (PROFILES[profile].mobile) {
        D.noglButtonBeforeTap = await page.locator(ACTIVATE_SELECTOR).count().then((n) => n > 0);
        await page.locator(ACTIVATE_SELECTOR).tap().catch(() => undefined);
        await page.waitForTimeout(2500);
        await settle(net);
      }
      D.nogl = {
        extraJs: net.js.filter((j) => !base.has(j.url)).length,
        canvas: await page.locator('canvas').count().then((n) => n > 0),
        staticImg: await page.locator('[role="img"][aria-label^="Foto"]').count().then((n) => n > 0),
        errors: net.console.length + net.pageErrors.length + net.failed.length,
        button: await page.locator(ACTIVATE_SELECTOR).count().then((n) => n > 0),
        webglAvailable: await page.evaluate(() => !!document.createElement('canvas').getContext('webgl')),
      };
      await ctx.close();
      await b2.close();

      const ctx2 = await newProfileContext(browser, profile, { extraHTTPHeaders: { 'Save-Data': 'on' } });
      await ctx2.addInitScript(SAVE_DATA_SCRIPT);
      const page2 = await ctx2.newPage();
      const net2 = captureNet(page2);
      await page2.goto('/', { waitUntil: 'load' });
      await page2.waitForTimeout(3500);
      await settle(net2);
      D.save = {
        extraJs: net2.js.filter((j) => !base.has(j.url)).length,
        canvas: await page2.locator('canvas').count().then((n) => n > 0),
        staticImg: await page2.locator('[role="img"][aria-label^="Foto"]').count().then((n) => n > 0),
        button: await page2.locator(ACTIVATE_SELECTOR).count().then((n) => n > 0),
      };
      await ctx2.close();
    });

    test('FPS idle and drag, pause rules, touch', async () => {
      const ctx = await newProfileContext(browser, profile, PROFILES[profile].mobile ? {} : {});
      await ctx.addInitScript(INIT_SCRIPT);
      const page = await ctx.newPage();
      const net = captureNet(page);
      await loadHome(page, net, PROFILES[profile].mobile ? 0 : 8000);
      if (PROFILES[profile].mobile) {
        const r = await tapAndMeasure(page, net);
        D.pauseTap = { ready: r.ready };
      }
      const hasCanvas = (await page.locator('canvas').count()) > 0;
      D.pause = { canvas: hasCanvas };
      if (!hasCanvas) {
        R.issues.push(`${profile}: 3D did not activate in this headless browser, so FPS and drag numbers measure the static page only.`);
      }
      await page.waitForTimeout(2500); // let the card settle

      // 0. rAF calls per second with the scene ready and nothing happening (render loop sleeping)
      {
        const a = await page.evaluate(() => (window as any).__m.rafCalls);
        await page.waitForTimeout(3000);
        const b = await page.evaluate(() => (window as any).__m.rafCalls);
        D.pause.rest = Math.round(((b - a) / 3) * 10) / 10;
      }

      // 1. idle
      const idle = await sampleFrames(page, 5000);
      const stat = (a: number[]) => ({ med: median(a), p95: pct(a, 95), n: a.length, fps: (a.length / a.reduce((s, x) => s + x, 0)) * 1000 });
      D.fps = { idle: stat(idle) };

      // 2. pixel change check then 5 s scripted drag
      const box = await regionBox(page);
      const cx = box.x + box.width / 2;
      const cy = box.y + box.height * 0.62;
      const region = page.locator('[role="region"][aria-label^="Crach"], [role="img"][aria-label^="Foto"]').first();
      const before = await region.screenshot();
      await page.mouse.move(cx, cy);
      await page.mouse.down();
      await page.mouse.move(cx + 110, cy + 20, { steps: 8 });
      await page.waitForTimeout(250);
      const during = await region.screenshot();
      D.drag = { mouseMoved: !before.equals(during) };
      const framesP = sampleFrames(page, 5000);
      const t0 = Date.now();
      while (Date.now() - t0 < 5000) {
        const a = ((Date.now() - t0) / 5000) * Math.PI * 6;
        await page.mouse.move(cx + Math.cos(a) * 90, cy + Math.sin(a) * 50);
      }
      const drag = await framesP;
      await page.mouse.up();
      D.fps.drag = stat(drag);
      await page.waitForTimeout(1500);

      // 3. pause rules (rAF calls per second; the sampler itself uses the native rAF)
      const count = async () => {
        const a = await page.evaluate(() => (window as any).__m.rafCalls);
        await page.waitForTimeout(1000);
        const b = await page.evaluate(() => (window as any).__m.rafCalls);
        return b - a;
      };
      await page.evaluate(() => window.scrollTo(0, 0));
      await page.waitForTimeout(500);
      D.pause.visible = await count();
      await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
      await page.waitForTimeout(800);
      D.pause.offscreen = await count();
      await page.evaluate(() => window.scrollTo(0, 0));
      await page.waitForTimeout(800);
      await page.evaluate(() => {
        Object.defineProperty(document, 'visibilityState', { configurable: true, get: () => 'hidden' });
        document.dispatchEvent(new Event('visibilitychange'));
      });
      await page.waitForTimeout(500);
      D.pause.hidden = await count();
      await page.evaluate(() => {
        Object.defineProperty(document, 'visibilityState', { configurable: true, get: () => 'visible' });
        document.dispatchEvent(new Event('visibilitychange'));
      });
      await page.waitForTimeout(800);
      D.pause.resumed = await count();

      // 4. touch drag (mobile profile has hasTouch)
      if (PROFILES[profile].mobile) {
        await page.evaluate(() => window.scrollTo(0, 0));
        await page.waitForTimeout(600);
        const b = await regionBox(page);
        const tx = b.x + b.width / 2;
        const ty = b.y + b.height * 0.55;
        const cdp = await ctx.newCDPSession(page);
        const touch = async (type: 'touchStart' | 'touchMove' | 'touchEnd', x: number, y: number) =>
          cdp.send('Input.dispatchTouchEvent', { type, touchPoints: type === 'touchEnd' ? [] : [{ x, y }] });
        const rb = await region.screenshot();
        await touch('touchStart', tx, ty);
        for (let i = 1; i <= 10; i++) {
          await touch('touchMove', tx + i * 8, ty + i * 1);
          await page.waitForTimeout(16);
        }
        await page.waitForTimeout(150);
        const rd = await region.screenshot();
        await touch('touchEnd', 0, 0);
        const scrollAfterDrag = await page.evaluate(() => window.scrollY);
        await page.waitForTimeout(800);
        await page.evaluate(() => window.scrollTo(0, 0));
        await page.waitForTimeout(500);
        await touch('touchStart', tx, ty + 60);
        for (let i = 1; i <= 12; i++) {
          await touch('touchMove', tx, ty + 60 - i * 18);
          await page.waitForTimeout(16);
        }
        await touch('touchEnd', 0, 0);
        await page.waitForTimeout(600);
        const scrollY = await page.evaluate(() => window.scrollY);
        D.touch = { moved: !rb.equals(rd), scrollAfterDrag, vSwipeScrolled: scrollY > 20, scrollY: Math.round(scrollY) };
      }
      await ctx.close();
    });

    for (const variant of (PROFILES[profile].mobile ? ['noTap', 'afterTap'] : ['noTap']) as ('noTap' | 'afterTap')[]) {
    test(`INP interactions under CPU 4x (${variant})`, async () => {
      const ctx = await newProfileContext(browser, profile);
      await ctx.addInitScript(webVitalsScript());
      const page = await ctx.newPage();
      await cpuThrottle(ctx, page, 4);
      await page.goto('/', { waitUntil: 'load' });
      await page.waitForTimeout(3000);
      const log: string[] = [];
      let tapInp: number | null = null;
      if (variant === 'afterTap') {
        await tapCard(page);
        await waitReady(page, 30_000);
        await page.waitForTimeout(2000);
        const first = await page.evaluate(() => (window as any).__inp as { v: number }[]);
        tapInp = first.length ? Math.max(...first.map((i) => i.v)) : null;
        log.push('card tap');
      }
      await page.locator('#portfolio').scrollIntoViewIfNeeded();
      await page.waitForTimeout(500);
      const tabs = page.locator('#portfolio [role="tab"]');
      const n = await tabs.count();
      for (let i = 0; i < 3 && n > 0; i++) {
        await tabs.nth((i + 1) % n).click();
        await page.waitForTimeout(500);
      }
      log.push(`tabs x3 (${n} tabs)`);
      const more = page.getByRole('button', { name: /Ver mais/i }).first();
      if (await more.count()) {
        await more.scrollIntoViewIfNeeded();
        await more.click();
        await page.waitForTimeout(500);
        log.push('Ver mais');
      }
      if (PROFILES[profile].mobile) {
        await page.evaluate(() => window.scrollTo(0, 0));
        await page.waitForTimeout(400);
        const open = page.getByRole('button', { name: 'Abrir menu' });
        if (await open.count()) {
          await open.click();
          await page.waitForTimeout(700);
          await page.getByRole('button', { name: 'Fechar menu' }).last().click();
          await page.waitForTimeout(500);
          log.push('menu open/close');
        }
      }
      const name = page.locator('input[name="name"]');
      if (await name.count()) {
        await name.scrollIntoViewIfNeeded();
        await name.click();
        await name.pressSequentially('Teste de digitacao', { delay: 20 });
        log.push('form typing');
      }
      await page.waitForTimeout(800);
      await page.locator('body').click({ position: { x: 5, y: 5 } }).catch(() => undefined);
      await page.waitForTimeout(500);
      const inp = await page.evaluate(() => (window as any).__inp as { v: number; rating: string; name: string }[]);
      const value = inp.length ? Math.max(...inp.map((i) => i.v)) : null;
      D[variant === 'afterTap' ? 'inpTap' : 'inp'] = { value, tapInp, log: `${log.join(', ')}; reports ${inp.length}` };
      await ctx.close();
    });
    }

    test('console errors and failed requests on all routes', async () => {
      const ctx = await newProfileContext(browser, profile);
      const out: Record<string, any> = {};
      for (const route of ROUTES) {
        const page = await ctx.newPage();
        const net = captureNet(page);
        const res = await page.goto(route, { waitUntil: 'load' });
        await page.waitForTimeout(3500);
        await scrollAll(page);
        await settle(net);
        const hs = await hasHScroll(page);
        out[route] = {
          hscroll: hs,
          console: [...net.console],
          pageErrors: [...net.pageErrors],
          failed: [...net.failed],
          bad: [...net.bad, ...(res && res.status() >= 400 ? [`${res.status()} ${route}`] : [])],
        };
        await page.close();
      }
      D.routes = out;
      await ctx.close();
    });
  });
}

test('collect issues', async () => {
  for (const p of ['desktop', 'mobile'] as ProfileName[]) {
    const d = R[p];
    if (!d?.normal) continue;
    if (p === 'desktop' && !d.normal.m.canvasAt) R.issues.push('desktop: 3D never activated in the normal run (static fallback chosen).');
    if (p === 'mobile' && !d.tap?.canvas) R.issues.push('mobile: 3D did not activate after the tap in this headless browser.');
    if (p === 'desktop' && (d.marks?.importAt == null || d.marks?.readyAt == null)) R.issues.push('desktop: lanyard:import or lanyard:ready mark missing.');
  }
  expect(true).toBe(true);
});
