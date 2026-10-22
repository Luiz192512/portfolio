import { sql } from 'drizzle-orm';
import {
  boolean,
  char,
  check,
  index,
  integer,
  pgEnum,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';

export const commentStatus = pgEnum('comment_status', ['pending', 'approved', 'hidden']);

export const comments = pgTable(
  'comments',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    name: varchar('name', { length: 40 }).notNull(),
    body: varchar('body', { length: 500 }).notNull(),
    imageUrl: text('image_url'), // always null in v1 (images deferred)
    status: commentStatus('status').notNull().default('pending'),
    pinned: boolean('pinned').notNull().default(false),
    ipHash: char('ip_hash', { length: 64 }).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    moderatedAt: timestamp('moderated_at', { withTimezone: true }),
  },
  (t) => [
    index('comments_public_idx').on(t.status, t.pinned, t.createdAt),
    check('comments_pinned_requires_approved', sql`NOT ${t.pinned} OR ${t.status} = 'approved'`),
  ],
);

export const rateLimits = pgTable(
  'rate_limits',
  {
    bucket: varchar('bucket', { length: 32 }).notNull(), // e.g. 'contact:10m'
    keyHash: char('key_hash', { length: 64 }).notNull(),
    windowStart: timestamp('window_start', { withTimezone: true }).notNull(),
    hits: integer('hits').notNull().default(1),
  },
  (t) => [primaryKey({ columns: [t.bucket, t.keyHash, t.windowStart] })],
);

export type CommentRow = typeof comments.$inferSelect;
export type NewComment = typeof comments.$inferInsert;
