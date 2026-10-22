import { defineConfig } from 'drizzle-kit';

// `drizzle-kit generate` needs no connection. `migrate` uses the owner role,
// run locally only (DATABASE_MIGRATION_URL is never set on Vercel).
export default defineConfig({
  dialect: 'postgresql',
  schema: './src/lib/db/schema.ts',
  out: './drizzle',
  dbCredentials: { url: process.env.DATABASE_MIGRATION_URL ?? '' },
  strict: true,
  verbose: true,
});
