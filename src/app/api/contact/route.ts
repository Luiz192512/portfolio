import { getContactEnv, getRateLimitSalt } from '@/lib/env';
import { getDb } from '@/lib/db/client';
import { sendContactEmail } from '@/lib/email/resend';
import { checkRateLimit, getClientIp, hashKey } from '@/lib/security/rate-limit';
import { isAllowedOrigin } from '@/lib/security/request';
import { ContactInput, toFieldErrors } from '@/lib/validation/contact';

const MAX_BYTES = 8 * 1024;

function json(body: unknown, status: number, extra: Record<string, string> = {}): Response {
  return Response.json(body, { status, headers: { 'Cache-Control': 'no-store', ...extra } });
}

export async function POST(request: Request): Promise<Response> {
  // 1. Content type and size.
  const type = request.headers.get('content-type') ?? '';
  if (!type.toLowerCase().startsWith('application/json')) {
    return json({ ok: false, code: 'unsupported_media_type' }, 415);
  }
  const declared = Number(request.headers.get('content-length') ?? 0);
  if (Number.isFinite(declared) && declared > MAX_BYTES) {
    return json({ ok: false, code: 'payload_too_large' }, 413);
  }

  // 2. Origin allow-list.
  if (!isAllowedOrigin(request.headers.get('origin'))) {
    return json({ ok: false, code: 'forbidden' }, 403);
  }

  // 3. Parse JSON. The real size is checked too: content-length can lie or be absent.
  let payload: unknown;
  try {
    const text = await request.text();
    if (new TextEncoder().encode(text).length > MAX_BYTES) {
      return json({ ok: false, code: 'payload_too_large' }, 413);
    }
    payload = JSON.parse(text);
  } catch {
    return json({ ok: false, code: 'bad_request' }, 400);
  }
  if (typeof payload !== 'object' || payload === null || Array.isArray(payload)) {
    return json({ ok: false, code: 'bad_request' }, 400);
  }

  // Silent honeypot: pretend success, do nothing.
  const company = (payload as Record<string, unknown>).company;
  if (typeof company === 'string' && company.length > 0) {
    return json({ ok: true }, 200);
  }

  // 4. Validation.
  const parsed = ContactInput.safeParse(payload);
  if (!parsed.success) {
    return json({ ok: false, errors: toFieldErrors(parsed.error) }, 400);
  }

  // 5. Rate limit (DB when available, memory fallback otherwise; fails open).
  const salt = getRateLimitSalt() ?? 'portfolio-memory-fallback';
  const key = hashKey(getClientIp(request.headers), salt);
  const limited = await checkRateLimit({
    db: getDb(),
    failMode: 'open',
    memoryFallback: true,
    windows: [
      { bucket: 'contact:10m', key, max: 3, window: '10 minutes' },
      { bucket: 'contact:24h', key, max: 10, window: '24 hours' },
    ],
  });
  if (!limited.ok) {
    return json({ ok: false, code: 'rate_limited' }, 429, { 'Retry-After': String(limited.retryAfterSec) });
  }

  // 6. Configuration.
  if (!getContactEnv()) return json({ ok: false, code: 'not_configured' }, 503);

  // 7. Send (plain text only). Log only codes, never the body or address.
  const { name, email, message } = parsed.data;
  const result = await sendContactEmail({ name, email, message });
  if (!result.ok) {
    console.error(result.code, result.errorName ?? '');
    return json({ ok: false, code: result.code }, result.code === 'not_configured' ? 503 : 502);
  }
  return json({ ok: true }, 200);
}
