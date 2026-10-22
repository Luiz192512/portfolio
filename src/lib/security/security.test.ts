import { describe, expect, it, vi } from 'vitest';
import {
  checkRateLimit,
  createMemoryLimiter,
  getClientIp,
  hashKey,
  limit,
  limitAll,
  memoryLimiter,
  RateLimitUnavailableError,
  type RateLimitDb,
} from './rate-limit';
import { isAllowedOrigin } from './request';
import { sanitizeHeaderText, sanitizeSingleLine, sanitizeText } from './sanitize';

function fakeDb(): RateLimitDb & { calls: number } {
  const hits = new Map<string, number>();
  const db = {
    calls: 0,
    async execute(q: unknown) {
      db.calls += 1;
      // Bound parameters (bucket, key, window) appear as plain strings in queryChunks.
      const key = JSON.stringify(
        (q as { queryChunks: unknown[] }).queryChunks.filter((c) => typeof c === 'string'),
      );
      const n = (hits.get(key) ?? 0) + 1;
      hits.set(key, n);
      return { rows: [{ hits: n, retry_after: 42 }] };
    },
  };
  return db as RateLimitDb & { calls: number };
}

describe('sanitizeText', () => {
  it('keeps the XSS payload as inert plain text without control characters', () => {
    const out = sanitizeText('<img src=x onerror=alert(1)>');
    expect(out).toBe('<img src=x onerror=alert(1)>');
    expect(out).not.toMatch(/[\u0000-\u0008\u000B-\u001F]/);
  });

  it('strips controls, bidi overrides and zero-width characters', () => {
    expect(sanitizeText('a\u0000b\u0007c‮d⁦e​f﻿g\u009Fh')).toBe('abcdefgh');
  });

  it('normalizes CRLF and collapses newlines and spaces', () => {
    expect(sanitizeText('a\r\n\r\n\r\n\r\nb   c\r\nd')).toBe('a\n\nb c\nd');
  });

  it('normalizes to NFC and trims', () => {
    expect(sanitizeText('  é  ')).toBe('é');
  });

  it('single line converts newlines to spaces', () => {
    expect(sanitizeSingleLine('Ana\nMaria')).toBe('Ana Maria');
  });

  it('header text has no CR, LF and is capped', () => {
    const out = sanitizeHeaderText('x\r\nBcc: evil@example.com' + 'y'.repeat(300));
    expect(out).not.toMatch(/[\r\n]/);
    expect(out.length).toBeLessThanOrEqual(120);
  });
});

describe('rate limiting helpers', () => {
  it('hashes with salt and never contains the raw IP', () => {
    const h = hashKey('203.0.113.9', 'salt-a');
    expect(h).toMatch(/^[0-9a-f]{64}$/);
    expect(h).not.toContain('203');
    expect(h).not.toBe(hashKey('203.0.113.9', 'salt-b'));
    expect(h).toBe(hashKey('203.0.113.9', 'salt-a'));
  });

  it('picks the client IP in the documented order', () => {
    expect(getClientIp(new Headers({ 'x-forwarded-for': '1.1.1.1, 2.2.2.2', 'x-real-ip': '3.3.3.3' }))).toBe('1.1.1.1');
    expect(getClientIp(new Headers({ 'x-real-ip': '3.3.3.3' }))).toBe('3.3.3.3');
    expect(getClientIp(new Headers())).toBe('unknown');
  });
});

describe('limit (database)', () => {
  const opts = { bucket: 'contact:10m', key: 'k'.repeat(64), max: 3, window: '10 minutes' as const };

  it('allows up to max then blocks with retryAfter', async () => {
    const db = fakeDb();
    const results = [];
    for (let i = 0; i < 4; i++) results.push(await limit(db, opts));
    expect(results.map((r) => r.ok)).toEqual([true, true, true, false]);
    expect(results[3]?.retryAfterSec).toBe(42);
  });

  it('limitAll blocks if any window is exceeded', async () => {
    const db = fakeDb();
    const list = [opts, { ...opts, bucket: 'contact:24h', max: 10, window: '24 hours' as const }];
    for (let i = 0; i < 3; i++) expect((await limitAll(db, list)).ok).toBe(true);
    expect((await limitAll(db, list)).ok).toBe(false);
  });

  it('throws when the row is malformed', async () => {
    const db: RateLimitDb = { execute: async () => ({ rows: [] }) };
    await expect(limit(db, opts)).rejects.toBeInstanceOf(RateLimitUnavailableError);
  });
});

describe('memory limiter', () => {
  it('resets after the window', () => {
    let t = 0;
    const m = createMemoryLimiter(() => t);
    const o = { bucket: 'contact:10m', key: 'a', max: 1, window: '10 minutes' as const };
    expect(m.limit(o).ok).toBe(true);
    const blocked = m.limit(o);
    expect(blocked.ok).toBe(false);
    expect(blocked.retryAfterSec).toBe(600);
    t = 601_000;
    expect(m.limit(o).ok).toBe(true);
  });

  it('keeps keys independent', () => {
    const m = createMemoryLimiter(() => 0);
    const o = { bucket: 'b', max: 1, window: '10 minutes' as const };
    expect(m.limit({ ...o, key: 'a' }).ok).toBe(true);
    expect(m.limit({ ...o, key: 'b' }).ok).toBe(true);
  });
});

describe('checkRateLimit fail modes', () => {
  const windows = [{ bucket: 'x:10m', key: 'k', max: 1, window: '10 minutes' as const }];
  const broken: RateLimitDb = {
    execute: async () => {
      throw new Error('db down');
    },
  };

  it('fails open for contact on DB error', async () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    await expect(checkRateLimit({ db: broken, windows, failMode: 'open' })).resolves.toMatchObject({ ok: true });
    expect(spy).toHaveBeenCalledWith('rate_limit_unavailable');
    spy.mockRestore();
  });

  it('fails closed for comments on DB error', async () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    await expect(checkRateLimit({ db: broken, windows, failMode: 'closed' })).rejects.toBeInstanceOf(
      RateLimitUnavailableError,
    );
    spy.mockRestore();
  });

  it('uses memory fallback only when allowed and no DB', async () => {
    memoryLimiter.clear();
    expect((await checkRateLimit({ db: null, windows, failMode: 'open', memoryFallback: true })).ok).toBe(true);
    expect((await checkRateLimit({ db: null, windows, failMode: 'open', memoryFallback: true })).ok).toBe(false);
    await expect(checkRateLimit({ db: null, windows, failMode: 'closed' })).rejects.toBeInstanceOf(
      RateLimitUnavailableError,
    );
    memoryLimiter.clear();
  });
});

describe('isAllowedOrigin', () => {
  const env = { NEXT_PUBLIC_SITE_URL: 'https://site.example.com/', VERCEL_URL: 'p-abc.vercel.app' };
  it('accepts configured origins and rejects others', () => {
    expect(isAllowedOrigin('https://site.example.com', env)).toBe(true);
    expect(isAllowedOrigin('https://p-abc.vercel.app', env)).toBe(true);
    expect(isAllowedOrigin('https://evil.example.com', env)).toBe(false);
    expect(isAllowedOrigin(null, env)).toBe(false);
  });
  it('allows localhost only in development', () => {
    expect(isAllowedOrigin('http://localhost:3000', { ...env, NODE_ENV: 'development' })).toBe(true);
    expect(isAllowedOrigin('http://localhost:3000', { ...env, NODE_ENV: 'production' })).toBe(false);
  });
});
