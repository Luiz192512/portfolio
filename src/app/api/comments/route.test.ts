import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('server-only', () => ({}));
vi.mock('next/server', () => ({ after: (fn: () => unknown) => void fn() }));

const sendCommentNotification = vi.fn();
vi.mock('@/lib/email/resend', () => ({
  sendCommentNotification: (a: unknown) => sendCommentNotification(a),
}));

const state = {
  hits: 1,
  rateThrows: false,
  inserted: [] as unknown[],
  items: [] as unknown[],
};

function makeDb() {
  const selectChain = (rows: () => unknown[]) => {
    const chain = {
      from: () => chain,
      where: () => chain,
      orderBy: () => chain,
      limit: () => Promise.resolve(rows()),
      then: (resolve: (v: unknown) => unknown) => Promise.resolve([{ total: rows().length }]).then(resolve),
    };
    return chain;
  };
  return {
    select: () => selectChain(() => state.items),
    insert: () => ({
      values: (v: unknown) => {
        state.inserted.push(v);
        return { returning: () => Promise.resolve([{ id: '00000000-0000-4000-8000-000000000000' }]) };
      },
    }),
    execute: () => {
      if (state.rateThrows) return Promise.reject(new Error('db down'));
      return Promise.resolve([{ hits: state.hits, retry_after: 120 }]);
    },
  };
}

vi.mock('@/lib/db/client', () => ({ getDb: () => (process.env.DATABASE_URL ? makeDb() : null) }));

import { GET, POST } from './route';

const ORIGIN = 'https://site.test';

function post(body: unknown, origin: string | null = ORIGIN): Request {
  const headers: Record<string, string> = { 'content-type': 'application/json', 'x-forwarded-for': '203.0.113.7' };
  if (origin) headers.origin = origin;
  return new Request('https://site.test/api/comments', {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });
}

const valid = () => ({ name: 'Ana', body: 'Belo portfólio!', website: '', startedAt: Date.now() - 10_000 });

beforeEach(() => {
  vi.stubEnv('NEXT_PUBLIC_SITE_URL', ORIGIN);
  vi.stubEnv('COMMENTS_ENABLED', 'true');
  vi.stubEnv('DATABASE_URL', 'postgres://placeholder');
  vi.stubEnv('RATE_LIMIT_SALT', 'x'.repeat(24));
  state.hits = 1;
  state.rateThrows = false;
  state.inserted = [];
  state.items = [];
  sendCommentNotification.mockReset().mockResolvedValue({ ok: true });
});

describe('/api/comments feature flag', () => {
  it('returns 404 for GET and POST when the flag is off', async () => {
    vi.stubEnv('COMMENTS_ENABLED', 'false');
    expect((await GET()).status).toBe(404);
    expect((await POST(post(valid()))).status).toBe(404);
    vi.stubEnv('COMMENTS_ENABLED', '');
    expect((await GET()).status).toBe(404);
  });

  it('returns 404 when DATABASE_URL is missing', async () => {
    vi.stubEnv('DATABASE_URL', '');
    expect((await GET()).status).toBe(404);
    expect((await POST(post(valid()))).status).toBe(404);
  });
});

describe('GET /api/comments', () => {
  it('returns only public fields with cache headers', async () => {
    state.items = [
      { id: 'a', name: 'Ana', body: 'oi', createdAt: new Date('2026-01-02T00:00:00Z'), pinned: true },
    ];
    const res = await GET();
    expect(res.status).toBe(200);
    expect(res.headers.get('cache-control')).toContain('s-maxage=60');
    const data = (await res.json()) as { total: number; items: Array<Record<string, unknown>> };
    expect(data.total).toBe(1);
    expect(Object.keys(data.items[0] ?? {}).sort()).toEqual(['body', 'createdAt', 'id', 'name', 'pinned']);
  });
});

describe('POST /api/comments', () => {
  it('stores as pending, answers 202 and notifies', async () => {
    const res = await POST(post(valid()));
    expect(res.status).toBe(202);
    expect(await res.json()).toEqual({ status: 'pending' });
    expect(res.headers.get('cache-control')).toBe('no-store');
    expect(state.inserted).toHaveLength(1);
    expect(sendCommentNotification).toHaveBeenCalledTimes(1);
  });

  it('stores the XSS fixture as plain text, unescaped', async () => {
    const xss = '<img src=x onerror=alert(1)>';
    const res = await POST(post({ ...valid(), body: xss }));
    expect(res.status).toBe(202);
    expect((state.inserted[0] as { body: string }).body).toBe(xss);
  });

  it('honeypot and fast submit return 202 and store nothing', async () => {
    expect((await POST(post({ ...valid(), website: 'http://spam' }))).status).toBe(202);
    expect((await POST(post({ ...valid(), startedAt: Date.now() }))).status).toBe(202);
    expect(state.inserted).toHaveLength(0);
  });

  it('returns 400 field errors', async () => {
    const res = await POST(post({ ...valid(), name: '', body: '' }));
    expect(res.status).toBe(400);
    const data = (await res.json()) as { errors: Record<string, string> };
    expect(data.errors).toMatchObject({ name: 'name_required', body: 'body_required' });
    expect((await POST(post({ ...valid(), name: 'a<b>' }))).status).toBe(400);
    expect((await POST(post({ ...valid(), body: 'x'.repeat(501) }))).status).toBe(400);
  });

  it('returns 429 with Retry-After when over the limit', async () => {
    state.hits = 4;
    const res = await POST(post(valid()));
    expect(res.status).toBe(429);
    expect(res.headers.get('retry-after')).toBe('120');
    expect(state.inserted).toHaveLength(0);
  });

  it('fails closed (503) when the rate limiter errors', async () => {
    state.rateThrows = true;
    vi.spyOn(console, 'error').mockImplementation(() => {});
    expect((await POST(post(valid()))).status).toBe(503);
    expect(state.inserted).toHaveLength(0);
  });

  it('rejects a foreign origin', async () => {
    expect((await POST(post(valid(), 'https://evil.test'))).status).toBe(403);
  });
});
