import { after } from 'next/server';
import { count, desc, eq, sql } from 'drizzle-orm';
import { commentsEnabled, getRateLimitSalt } from '@/lib/env';
import { getDb } from '@/lib/db/client';
import { comments } from '@/lib/db/schema';
import { sendCommentNotification } from '@/lib/email/resend';
import { checkRateLimit, getClientIp, hashKey } from '@/lib/security/rate-limit';
import { isAllowedOrigin } from '@/lib/security/request';
import { CommentInput, looksLikeBot } from '@/lib/validation/comment';
import { toFieldErrors } from '@/lib/validation/contact';

const MAX_BYTES = 4 * 1024;
const NO_STORE = { 'Cache-Control': 'no-store' } as const;

function json(body: unknown, status: number, headers: Record<string, string> = NO_STORE): Response {
  return Response.json(body, { status, headers });
}

function notFound(): Response {
  return json({ code: 'not_found' }, 404);
}

export async function GET(): Promise<Response> {
  if (!commentsEnabled()) return notFound();
  const db = getDb();
  if (!db) return notFound();

  try {
    const [items, totals] = await Promise.all([
      db
        .select({
          id: comments.id,
          name: comments.name,
          body: comments.body,
          createdAt: comments.createdAt,
          pinned: comments.pinned,
        })
        .from(comments)
        .where(eq(comments.status, 'approved'))
        .orderBy(desc(comments.pinned), desc(comments.createdAt))
        .limit(50),
      db.select({ total: count() }).from(comments).where(eq(comments.status, 'approved')),
    ]);
    return json(
      {
        total: Number(totals[0]?.total ?? items.length),
        items: items.map((row) => ({
          id: row.id,
          name: row.name,
          body: row.body,
          createdAt: row.createdAt instanceof Date ? row.createdAt.toISOString() : String(row.createdAt),
          pinned: row.pinned,
        })),
      },
      200,
      { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300' },
    );
  } catch {
    console.error('comments_list_failed');
    return json({ code: 'list_failed' }, 500);
  }
}

export async function POST(request: Request): Promise<Response> {
  if (!commentsEnabled()) return notFound();
  const db = getDb();
  if (!db) return notFound();

  // 1. Content type, size, origin.
  const type = request.headers.get('content-type') ?? '';
  if (!type.toLowerCase().startsWith('application/json')) {
    return json({ code: 'unsupported_media_type' }, 415);
  }
  const declared = Number(request.headers.get('content-length') ?? 0);
  if (Number.isFinite(declared) && declared > MAX_BYTES) return json({ code: 'payload_too_large' }, 413);
  if (!isAllowedOrigin(request.headers.get('origin'))) return json({ code: 'forbidden' }, 403);

  let payload: unknown;
  try {
    const text = await request.text();
    if (new TextEncoder().encode(text).length > MAX_BYTES) return json({ code: 'payload_too_large' }, 413);
    payload = JSON.parse(text);
  } catch {
    return json({ code: 'bad_request' }, 400);
  }
  if (typeof payload !== 'object' || payload === null || Array.isArray(payload)) {
    return json({ code: 'bad_request' }, 400);
  }

  // 2. Honeypot and timing: pretend success, store nothing.
  if (looksLikeBot(payload as { website?: unknown; startedAt?: unknown })) {
    return json({ status: 'pending' }, 202);
  }

  // 3. Validation (sanitizes first).
  const parsed = CommentInput.safeParse(payload);
  if (!parsed.success) return json({ errors: toFieldErrors(parsed.error) }, 400);

  // 4. Rate limit. Fails closed for comments.
  const salt = getRateLimitSalt();
  if (!salt) return json({ code: 'not_configured' }, 503);
  const key = hashKey(getClientIp(request.headers), salt);
  try {
    const limited = await checkRateLimit({
      db,
      failMode: 'closed',
      windows: [
        { bucket: 'comments:10m', key, max: 3, window: '10 minutes' },
        { bucket: 'comments:24h', key, max: 10, window: '24 hours' },
        { bucket: 'comments:global:24h', key: hashKey('global', salt), max: 50, window: '24 hours' },
      ],
    });
    if (!limited.ok) {
      return json({ code: 'rate_limited' }, 429, { ...NO_STORE, 'Retry-After': String(limited.retryAfterSec) });
    }
  } catch {
    // RateLimitUnavailableError or any DB failure: fail closed.
    return json({ code: 'unavailable' }, 503);
  }

  // 5. Insert as pending.
  const { name, body } = parsed.data;
  let id: string | undefined;
  try {
    const rows = await db
      .insert(comments)
      .values({ name, body, ipHash: key })
      .returning({ id: comments.id });
    id = rows[0]?.id;
  } catch {
    console.error('comment_insert_failed');
    return json({ code: 'insert_failed' }, 500);
  }

  // 6. Non-blocking: notify the owner and occasionally prune old rate-limit rows.
  after(async () => {
    try {
      if (id) await sendCommentNotification({ id, name, body });
      if (Math.random() < 0.02) {
        await db.execute(sql`DELETE FROM rate_limits WHERE window_start < now() - interval '2 days'`);
      }
    } catch {
      console.error('comment_after_failed');
    }
  });

  return json({ status: 'pending' }, 202);
}
