import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('server-only', () => ({}));

const sendContactEmail = vi.fn();
vi.mock('@/lib/email/resend', () => ({ sendContactEmail: (a: unknown) => sendContactEmail(a) }));
vi.mock('@/lib/db/client', () => ({ getDb: () => null }));

import { memoryLimiter } from '@/lib/security/rate-limit';
import { POST } from './route';

const ORIGIN = 'https://site.test';

function req(body: unknown, init: { origin?: string | null; type?: string; ip?: string } = {}): Request {
  const headers: Record<string, string> = {
    'content-type': init.type ?? 'application/json',
    'x-forwarded-for': init.ip ?? '203.0.113.7',
  };
  if (init.origin !== null) headers.origin = init.origin ?? ORIGIN;
  return new Request('https://site.test/api/contact', {
    method: 'POST',
    headers,
    body: typeof body === 'string' ? body : JSON.stringify(body),
  });
}

const valid = { name: 'Ana', email: 'ana@example.com', message: 'Olá, gostaria de conversar.' };

beforeEach(() => {
  vi.stubEnv('NEXT_PUBLIC_SITE_URL', ORIGIN);
  vi.stubEnv('RESEND_API_KEY', 'test-placeholder');
  vi.stubEnv('CONTACT_TO_EMAIL', 'to@example.com');
  vi.stubEnv('CONTACT_FROM_EMAIL', 'Portfolio <from@example.com>');
  vi.stubEnv('RATE_LIMIT_SALT', 'x'.repeat(24));
  memoryLimiter.clear();
  sendContactEmail.mockReset().mockResolvedValue({ ok: true });
});

describe('POST /api/contact', () => {
  it('sends on valid input', async () => {
    const res = await POST(req(valid));
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true });
    expect(res.headers.get('cache-control')).toBe('no-store');
    expect(sendContactEmail).toHaveBeenCalledTimes(1);
  });

  it('honeypot returns 200 and sends nothing', async () => {
    const res = await POST(req({ ...valid, company: 'Acme' }));
    expect(res.status).toBe(200);
    expect(sendContactEmail).not.toHaveBeenCalled();
  });

  it('returns field errors with 400', async () => {
    const res = await POST(req({ name: '', email: 'nope', message: 'curta' }));
    expect(res.status).toBe(400);
    const body = (await res.json()) as { errors: Record<string, string> };
    expect(body.errors).toMatchObject({
      name: 'name_required',
      email: 'email_invalid',
      message: 'message_too_short',
    });
    expect(sendContactEmail).not.toHaveBeenCalled();
  });

  it('returns 429 with Retry-After after 3 requests', async () => {
    for (let i = 0; i < 3; i += 1) expect((await POST(req(valid))).status).toBe(200);
    const res = await POST(req(valid));
    expect(res.status).toBe(429);
    expect(Number(res.headers.get('retry-after'))).toBeGreaterThan(0);
    expect(sendContactEmail).toHaveBeenCalledTimes(3);
  });

  it('rejects bad origin, content type, size and JSON', async () => {
    expect((await POST(req(valid, { origin: 'https://evil.test' }))).status).toBe(403);
    expect((await POST(req(valid, { origin: null }))).status).toBe(403);
    expect((await POST(req(valid, { type: 'text/plain' }))).status).toBe(415);
    expect((await POST(req({ ...valid, message: 'a'.repeat(9000) }))).status).toBe(413);
    expect((await POST(req('{not json'))).status).toBe(400);
  });

  it('returns 503 when not configured and a generic 502 on send failure', async () => {
    vi.stubEnv('RESEND_API_KEY', '');
    expect((await POST(req(valid))).status).toBe(503);
    vi.stubEnv('RESEND_API_KEY', 'test-placeholder');
    sendContactEmail.mockResolvedValue({ ok: false, code: 'send_failed', errorName: 'x' });
    vi.spyOn(console, 'error').mockImplementation(() => {});
    const res = await POST(req(valid, { ip: '198.51.100.9' }));
    expect(res.status).toBe(502);
    expect(JSON.stringify(await res.json())).not.toContain('ana@example.com');
  });
});
