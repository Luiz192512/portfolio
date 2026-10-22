import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { gzipSync } from 'node:zlib';
import type { Browser, BrowserContext, Page, Response } from '@playwright/test';
import { devices } from '@playwright/test';

export type ProfileName = 'desktop' | 'mobile';

export const PROFILES: Record<ProfileName, { viewport: { width: number; height: number }; mobile: boolean }> = {
  desktop: { viewport: { width: 1440, height: 900 }, mobile: false },
  mobile: { viewport: { width: 390, height: 844 }, mobile: true },
};

export const ROUTES = [
  '/',
  '/portfolio/curbside',
  '/portfolio/enz-softwares',
  '/portfolio/tszr15',
  '/portfolio/msx-baterias',
  '/portfolio/g7-padel-crm',
];

/** DESIGN.md ENTRY TIMELINE, delays in ms (src/components/motion/tokens.ts mirrors this). */
export const ENTRY_TABLE: Record<string, { delay: number; duration: number }> = {
  background: { delay: 0, duration: 150 },
  h1: { delay: 160, duration: 1200 },
  badge: { delay: 260, duration: 800 },
  navbar: { delay: 350, duration: 1000 },
  typewriter: { delay: 360, duration: 800 },
  paragraph: { delay: 460, duration: 800 },
  chips: { delay: 560, duration: 800 },
  hints: { delay: 660, duration: 800 },
  scroll: { delay: 900, duration: 600 },
};

export async function newProfileContext(
  browser: Browser,
  profile: ProfileName,
  extra: Parameters<Browser['newContext']>[0] = {},
): Promise<BrowserContext> {
  const p = PROFILES[profile];
  const base = p.mobile ? devices['Pixel 7'] : devices['Desktop Chrome'];
  return browser.newContext({ ...base, viewport: p.viewport, ...extra });
}

/** Injected before any page script: entry sampler, vitals observers, rAF counter, mark spy. */
export const INIT_SCRIPT = `(() => {
  const w = window;
  w.__m = { entry: {}, cls: 0, clsEntries: [], lcp: null, longtasks: [], fcp: null,
            canvasAt: null, regionAt: null, rafCalls: 0, raf0: performance.now() };
  const nativeRaf = window.requestAnimationFrame.bind(window);
  w.__nativeRaf = nativeRaf;
  window.requestAnimationFrame = (cb) => { w.__m.rafCalls++; return nativeRaf(cb); };
  const parse = (t) => t;
  const tick = () => {
    const now = performance.now();
    const els = document.querySelectorAll('[data-entry]');
    for (const el of els) {
      const step = el.getAttribute('data-entry');
      if (step === 'reveal') continue;
      const tgt = step === 'chips' && el.firstElementChild ? el.firstElementChild : el;
      const cs = getComputedStyle(tgt);
      const op = parseFloat(cs.opacity);
      const tf = parse(cs.transform);
      let r = w.__m.entry[step];
      if (!r) { r = w.__m.entry[step] = { firstSeen: now, op0: op, tf0: tf, start: null, end: null, transformChanged: false, opacityChanged: false }; }
      if (r.start === null && (Math.abs(op - r.op0) > 0.01 || tf !== r.tf0)) r.start = now;
      if (tf !== r.tf0) r.transformChanged = true;
      if (r.prevTf !== undefined && tf !== r.prevTf && op > 0.1 && r.prevOp > 0.1) r.visibleTransformChange = true;
      r.prevTf = tf; r.prevOp = op;
      if (Math.abs(op - r.op0) > 0.01) r.opacityChanged = true;
      if (r.start !== null && r.end === null && op >= 0.99) r.end = now;
    }
    if (!w.__m.canvasAt && document.querySelector('canvas')) w.__m.canvasAt = now;
    if (!w.__m.regionAt && document.querySelector('[role="region"][aria-label^="Crach"]')) w.__m.regionAt = now;
    nativeRaf(tick);
  };
  nativeRaf(tick);
  try {
    new PerformanceObserver((l) => { for (const e of l.getEntries()) { if (!e.hadRecentInput) { w.__m.cls += e.value; w.__m.clsEntries.push({ t: e.startTime, v: e.value }); } } }).observe({ type: 'layout-shift', buffered: true });
    new PerformanceObserver((l) => { for (const e of l.getEntries()) w.__m.lcp = { t: e.startTime, size: e.size, tag: e.element ? e.element.tagName : null, url: e.url || null, id: e.element ? (e.element.id || e.element.getAttribute('data-entry') || '') : '' }; }).observe({ type: 'largest-contentful-paint', buffered: true });
    new PerformanceObserver((l) => { for (const e of l.getEntries()) w.__m.longtasks.push({ s: e.startTime, d: e.duration }); }).observe({ type: 'longtask', buffered: true });
    new PerformanceObserver((l) => { for (const e of l.getEntries()) if (e.name === 'first-contentful-paint') w.__m.fcp = e.startTime; }).observe({ type: 'paint', buffered: true });
  } catch (e) {}
})();`;

export function webVitalsScript(): string {
  const file = join(process.cwd(), 'node_modules', 'web-vitals', 'dist', 'web-vitals.iife.js');
  return (
    readFileSync(file, 'utf8') +
    `\n;window.__inp = []; webVitals.onINP((m) => { window.__inp.push({ v: m.value, rating: m.rating, name: (m.entries[0] && m.entries[0].name) || '' }); }, { reportAllChanges: true });`
  );
}

export const SAVE_DATA_SCRIPT = `Object.defineProperty(navigator, 'connection', { configurable: true, get: () => ({ saveData: true, effectiveType: '4g' }) });`;

export type Net = {
  js: { url: string; at: number; gz: number; raw: number; status: number; hasRapier: boolean; afterLoad: boolean }[];
  failed: string[];
  bad: string[];
  console: string[];
  pageErrors: string[];
  loadAt: number | null;
  t0: number;
};

/** Attaches network and console capture. Call before goto. */
export function captureNet(page: Page): Net {
  const net: Net = { js: [], failed: [], bad: [], console: [], pageErrors: [], loadAt: null, t0: Date.now() };
  const t0 = net.t0;
  page.on('load', () => {
    net.loadAt = Date.now() - t0;
  });
  page.on('console', (m) => {
    if (m.type() === 'error') net.console.push(m.text().slice(0, 300));
  });
  page.on('pageerror', (e) => net.pageErrors.push(String(e.message).slice(0, 300)));
  page.on('requestfailed', (r) => net.failed.push(`${r.method()} ${r.url()} ${r.failure()?.errorText ?? ''}`));
  const pending: Promise<void>[] = [];
  page.on('response', (res: Response) => {
    const url = res.url();
    const status = res.status();
    if (status >= 400) net.bad.push(`${status} ${url}`);
    const isJs = /\.js(\?|$)/.test(url) || (res.headers()['content-type'] ?? '').includes('javascript');
    if (!isJs) return;
    const at = Date.now() - t0;
    const afterLoad = net.loadAt !== null && at > net.loadAt;
    pending.push(
      res
        .body()
        .then((b) => {
          const text = b.toString('utf8');
          net.js.push({
            url,
            at,
            raw: b.length,
            gz: gzipSync(b, { level: 9 }).length,
            status,
            hasRapier: /rapier/i.test(url) || /rapier3d|RAPIER|AGFzbQ/.test(text.slice(0, 4_000_000)),
            afterLoad,
          });
        })
        .catch(() => {}),
    );
  });
  (net as Net & { settle?: () => Promise<void> }).settle = async () => {
    await Promise.all(pending);
  };
  return net;
}

export async function settle(net: Net): Promise<void> {
  await (net as Net & { settle: () => Promise<void> }).settle();
}

export function median(a: number[]): number {
  if (!a.length) return NaN;
  const s = [...a].sort((x, y) => x - y);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m]! : (s[m - 1]! + s[m]!) / 2;
}

export function pct(a: number[], p: number): number {
  if (!a.length) return NaN;
  const s = [...a].sort((x, y) => x - y);
  return s[Math.min(s.length - 1, Math.ceil((p / 100) * s.length) - 1)]!;
}

export const kb = (n: number) => `${(n / 1024).toFixed(1)} KB`;
export const ms = (n: number | null | undefined) => (n == null || Number.isNaN(n) ? 'n/a' : `${Math.round(n)} ms`);

/** In-page frame sampler. Resolves frame deltas (ms) collected for `durationMs`. */
export async function sampleFrames(page: Page, durationMs: number): Promise<number[]> {
  return page.evaluate((d) => {
    const raf = (window as unknown as { __nativeRaf: typeof requestAnimationFrame }).__nativeRaf;
    return new Promise<number[]>((resolve) => {
      const deltas: number[] = [];
      let last = performance.now();
      const start = last;
      const step = (t: number) => {
        deltas.push(t - last);
        last = t;
        if (t - start < d) raf(step);
        else resolve(deltas);
      };
      raf(step);
    });
  }, durationMs);
}

export async function rendererInfo(page: Page): Promise<string> {
  return page.evaluate(() => {
    const c = document.createElement('canvas');
    const gl = c.getContext('webgl2') ?? c.getContext('webgl');
    if (!gl) return 'no webgl';
    const ext = (gl as WebGLRenderingContext).getExtension('WEBGL_debug_renderer_info');
    return ext ? String((gl as WebGLRenderingContext).getParameter(ext.UNMASKED_RENDERER_WEBGL)) : 'unknown renderer';
  });
}

export function gzSum(files: { gz: number }[]): number {
  return files.reduce((s, f) => s + f.gz, 0);
}

export const ACTIVATE_SELECTOR = 'button[aria-label="Ativar o crachá 3D interativo"]';

/** Ms timestamps (page clock) of the 3D performance marks, null when absent. */
export async function readMarks(page: Page): Promise<{ importAt: number | null; readyAt: number | null }> {
  return page.evaluate(() => ({
    importAt: performance.getEntriesByName('lanyard:import')[0]?.startTime ?? null,
    readyAt: performance.getEntriesByName('lanyard:ready')[0]?.startTime ?? null,
  }));
}

/** Taps the transparent card button (mobile). Returns page-clock time of the tap. */
export async function tapCard(page: Page, how: 'tap' | 'enter' | 'space' = 'tap'): Promise<number> {
  const btn = page.locator(ACTIVATE_SELECTOR);
  await btn.waitFor({ state: 'visible', timeout: 10_000 });
  const at = await page.evaluate(() => performance.now());
  if (how === 'tap') await btn.tap();
  else {
    await btn.focus();
    await page.keyboard.press(how === 'enter' ? 'Enter' : 'Space');
  }
  return at;
}

export async function waitReady(page: Page, timeout = 20_000): Promise<boolean> {
  return page
    .waitForFunction(() => performance.getEntriesByName('lanyard:ready').length > 0, null, { timeout })
    .then(() => true)
    .catch(() => false);
}

export async function hasHScroll(page: Page): Promise<{ over: boolean; sw: number; cw: number }> {
  return page.evaluate(() => ({
    over: document.documentElement.scrollWidth > document.documentElement.clientWidth || document.body.scrollWidth > window.innerWidth,
    sw: document.documentElement.scrollWidth,
    cw: document.documentElement.clientWidth,
  }));
}
