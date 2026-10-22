import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('server-only', () => ({}));

const send = vi.fn();
vi.mock('resend', () => ({
  Resend: class {
    emails = { send };
  },
}));

import { sendCommentNotification, sendContactEmail } from './resend';

const env = {
  RESEND_API_KEY: 'test-placeholder',
  CONTACT_TO_EMAIL: 'owner@example.com',
  CONTACT_FROM_EMAIL: 'Portfolio <from@example.com>',
};

beforeEach(() => {
  send.mockReset();
  vi.unstubAllEnvs();
});

describe('sendContactEmail', () => {
  it('returns not_configured without env and never calls the SDK', async () => {
    vi.stubEnv('RESEND_API_KEY', '');
    const r = await sendContactEmail({ name: 'Ana', email: 'a@example.com', message: 'mensagem longa' });
    expect(r).toEqual({ ok: false, code: 'not_configured' });
    expect(send).not.toHaveBeenCalled();
  });

  it('sends text only with replyTo and a header-safe subject', async () => {
    for (const [k, v] of Object.entries(env)) vi.stubEnv(k, v);
    send.mockResolvedValue({ data: { id: '1' }, error: null });
    const r = await sendContactEmail({ name: 'Ana\r\nBcc: x@example.com', email: 'a@example.com', message: 'oi, tudo bem?' });
    expect(r).toEqual({ ok: true });
    const arg = send.mock.calls[0]?.[0];
    expect(arg.html).toBeUndefined();
    expect(arg.replyTo).toBe('a@example.com');
    expect(arg.to).toBe('owner@example.com');
    expect(arg.subject).not.toMatch(/[\r\n]/);
  });

  it('reports send_failed with only the error name', async () => {
    for (const [k, v] of Object.entries(env)) vi.stubEnv(k, v);
    send.mockResolvedValue({ data: null, error: { name: 'rate_limit_exceeded', message: 'secret detail' } });
    const r = await sendContactEmail({ name: 'Ana', email: 'a@example.com', message: 'oi, tudo bem?' });
    expect(r).toEqual({ ok: false, code: 'send_failed', errorName: 'rate_limit_exceeded' });
  });

  it('handles thrown errors', async () => {
    for (const [k, v] of Object.entries(env)) vi.stubEnv(k, v);
    send.mockRejectedValue(new TypeError('network'));
    const r = await sendContactEmail({ name: 'Ana', email: 'a@example.com', message: 'oi, tudo bem?' });
    expect(r).toEqual({ ok: false, code: 'send_failed', errorName: 'TypeError' });
  });
});

describe('sendCommentNotification', () => {
  it('includes the moderation SQL', async () => {
    for (const [k, v] of Object.entries(env)) vi.stubEnv(k, v);
    send.mockResolvedValue({ data: { id: '1' }, error: null });
    await sendCommentNotification({ id: 'abc', name: 'Ana', body: '<img src=x onerror=alert(1)>' });
    const arg = send.mock.calls[0]?.[0];
    expect(arg.text).toContain("WHERE id = 'abc'");
    expect(arg.html).toBeUndefined();
  });
});
