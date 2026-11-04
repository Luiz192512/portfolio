import { createHash } from 'node:crypto';
import { sql } from 'drizzle-orm';

/**
 * Shared fixed-window rate limiter (architecture 6.6). The raw IP is never
 * stored or logged: only sha256(salt + ':' + ip).
 */

export type RateWindow = '10 minutes' | '24 hours';

export interface LimitOptions {
  bucket: string; // e.g. 'contact:10m' (max 32 chars)
  key: string; // already hashed, see hashKey
  max: number;
  window: RateWindow;
}

export interface LimitResult {
  ok: boolean;
  retryAfterSec: number;
}

/** Minimal executor so the limiter can be tested without a database. */
export interface RateLimitDb {
  execute(query: ReturnType<typeof sql>): Promise<unknown>;
}

export class RateLimitUnavailableError extends Error {
  constructor() {
    super('rate_limit_unavailable');
    this.name = 'RateLimitUnavailableError';
  }
}

const WINDOW_SECONDS: Record<RateWindow, number> = {
  '10 minutes': 600,
  '24 hours': 86_400,
};

export function hashKey(ip: string, salt: string): string {
  return createHash('sha256').update(`${salt}:${ip}`).digest('hex');
}

/** First entry of x-forwarded-for, else x-real-ip, else the shared 'unknown' key. */
export function getClientIp(headers: Pick<Headers, 'get'>): string {
  const forwarded = headers.get('x-forwarded-for')?.split(',')[0]?.trim();
  if (forwarded) return forwarded;
  const real = headers.get('x-real-ip')?.trim();
  return real || 'unknown';
}

function rowsOf(result: unknown): Array<Record<string, unknown>> {
  if (Array.isArray(result)) return result as Array<Record<string, unknown>>;
  const rows = (result as { rows?: unknown } | null)?.rows;
  return Array.isArray(rows) ? (rows as Array<Record<string, unknown>>) : [];
}

/** Database limiter: one upsert per bucket. Throws on DB errors (caller picks fail mode). */
export async function limit(db: RateLimitDb, opts: LimitOptions): Promise<LimitResult> {
  const result = await db.execute(sql`
    INSERT INTO rate_limits (bucket, key_hash, window_start, hits)
    VALUES (${opts.bucket}, ${opts.key}, date_bin(${opts.window}::interval, now(), 'epoch'), 1)
    ON CONFLICT (bucket, key_hash, window_start) DO UPDATE SET hits = rate_limits.hits + 1
    RETURNING hits,
      ceil(extract(epoch from (window_start + ${opts.window}::interval - now())))::int AS retry_after
  `);
  const row = rowsOf(result)[0];
  const hits = Number(row?.hits);
  if (!Number.isFinite(hits)) throw new RateLimitUnavailableError();
  const retry = Number(row?.retry_after);
  const retryAfterSec = Number.isFinite(retry) && retry > 0 ? retry : WINDOW_SECONDS[opts.window];
  return { ok: hits <= opts.max, retryAfterSec };
}

/** Several windows in parallel. Blocked if any is exceeded; Retry-After is the longest. */
export async function limitAll(db: RateLimitDb, list: LimitOptions[]): Promise<LimitResult> {
  const results = await Promise.all(list.map((o) => limit(db, o)));
  const blocked = results.filter((r) => !r.ok);
  if (blocked.length === 0) return { ok: true, retryAfterSec: 0 };
  return { ok: false, retryAfterSec: Math.max(...blocked.map((r) => r.retryAfterSec)) };
}

/** Best-effort in-memory limiter, per instance. Used by contact when the DB is absent. */
export function createMemoryLimiter(now: () => number = Date.now) {
  const store = new Map<string, { hits: number; resetAt: number }>();
  return {
    limit(opts: LimitOptions): LimitResult {
      const t = now();
      for (const [k, v] of store) if (v.resetAt <= t) store.delete(k);
      const id = `${opts.bucket}|${opts.key}`;
      const entry = store.get(id) ?? { hits: 0, resetAt: t + WINDOW_SECONDS[opts.window] * 1000 };
      entry.hits += 1;
      store.set(id, entry);
      return {
        ok: entry.hits <= opts.max,
        retryAfterSec: Math.max(1, Math.ceil((entry.resetAt - t) / 1000)),
      };
    },
    clear: () => store.clear(),
  };
}

export const memoryLimiter = createMemoryLimiter();

export type FailMode = 'open' | 'closed';

/**
 * High-level entry. With a DB: windows checked in parallel. Without a DB: memory
 * limiter when `memoryFallback` is set, otherwise throws RateLimitUnavailableError.
 * On DB errors: 'open' allows (logs `rate_limit_unavailable`), 'closed' throws.
 */
export async function checkRateLimit(args: {
  db: RateLimitDb | null;
  windows: LimitOptions[];
  failMode: FailMode;
  memoryFallback?: boolean;
}): Promise<LimitResult> {
  const { db, windows, failMode, memoryFallback } = args;
  if (!db) {
    if (!memoryFallback) throw new RateLimitUnavailableError();
    const results = windows.map((w) => memoryLimiter.limit(w));
    const blocked = results.filter((r) => !r.ok);
    return blocked.length === 0
      ? { ok: true, retryAfterSec: 0 }
      : { ok: false, retryAfterSec: Math.max(...blocked.map((r) => r.retryAfterSec)) };
  }
  try {
    return await limitAll(db, windows);
  } catch {
    console.error('rate_limit_unavailable');
    if (failMode === 'open') return { ok: true, retryAfterSec: 0 };
    throw new RateLimitUnavailableError();
  }
}
