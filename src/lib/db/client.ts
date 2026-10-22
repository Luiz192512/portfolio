import 'server-only';
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { getDbEnv } from '@/lib/env';
import * as schema from './schema';

function createDb(url: string) {
  return drizzle(neon(url), { schema });
}

export type Db = ReturnType<typeof createDb>;

let cached: Db | null = null;

/** Lazy Drizzle client over the Neon HTTP driver. Null when DATABASE_URL is missing. */
export function getDb(): Db | null {
  if (cached) return cached;
  const env = getDbEnv();
  if (!env) return null;
  cached = createDb(env.DATABASE_URL);
  return cached;
}
