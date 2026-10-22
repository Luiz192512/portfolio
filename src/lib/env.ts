import 'server-only';
import { z } from 'zod';

/**
 * Lazy, server-only environment access. Nothing is parsed at module load, so
 * `next build` passes without secrets. Never import this file from client code.
 */

const contactSchema = z.object({
  RESEND_API_KEY: z.string().min(1),
  CONTACT_TO_EMAIL: z.string().min(1),
  CONTACT_FROM_EMAIL: z.string().min(1),
});

const dbSchema = z.object({
  DATABASE_URL: z.string().min(1),
  RATE_LIMIT_SALT: z.string().min(16),
});

export type ContactEnv = z.infer<typeof contactSchema>;
export type DbEnv = z.infer<typeof dbSchema>;

type Source = Record<string, string | undefined>;

function pick(source: Source, keys: readonly string[]): Source {
  const out: Source = {};
  for (const key of keys) {
    const value = source[key]?.trim();
    out[key] = value ? value : undefined;
  }
  return out;
}

/** Returns the contact settings, or null when any is missing (route answers 503). */
export function getContactEnv(source: Source = process.env): ContactEnv | null {
  const parsed = contactSchema.safeParse(pick(source, Object.keys(contactSchema.shape)));
  return parsed.success ? parsed.data : null;
}

/** Returns the database settings, or null when the DB is not configured. */
export function getDbEnv(source: Source = process.env): DbEnv | null {
  const parsed = dbSchema.safeParse(pick(source, Object.keys(dbSchema.shape)));
  return parsed.success ? parsed.data : null;
}

/** Only the literal string "true" enables comments. */
export function commentsEnabled(source: Source = process.env): boolean {
  return source.COMMENTS_ENABLED === 'true';
}

/** Salt for IP hashing. Null when missing or too short. */
export function getRateLimitSalt(source: Source = process.env): string | null {
  const value = source.RATE_LIMIT_SALT?.trim();
  return value && value.length >= 16 ? value : null;
}

/** Owner address for notifications, or null. */
export function getContactToEmail(source: Source = process.env): string | null {
  return source.CONTACT_TO_EMAIL?.trim() || null;
}
