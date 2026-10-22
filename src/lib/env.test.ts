import { describe, expect, it, vi } from 'vitest';

vi.mock('server-only', () => ({}));

import { commentsEnabled, getContactEnv, getDbEnv, getRateLimitSalt } from './env';

describe('env', () => {
  it('returns null when contact settings are missing or blank', () => {
    expect(getContactEnv({})).toBeNull();
    expect(
      getContactEnv({ RESEND_API_KEY: ' ', CONTACT_TO_EMAIL: 'a@b.c', CONTACT_FROM_EMAIL: 'x' }),
    ).toBeNull();
  });

  it('parses complete contact settings', () => {
    expect(
      getContactEnv({ RESEND_API_KEY: 'k', CONTACT_TO_EMAIL: 'a@b.c', CONTACT_FROM_EMAIL: 'x' }),
    ).toEqual({ RESEND_API_KEY: 'k', CONTACT_TO_EMAIL: 'a@b.c', CONTACT_FROM_EMAIL: 'x' });
  });

  it('requires a salt of 16+ chars for the DB settings', () => {
    expect(getDbEnv({ DATABASE_URL: 'u', RATE_LIMIT_SALT: 'short' })).toBeNull();
    expect(getDbEnv({ DATABASE_URL: 'u', RATE_LIMIT_SALT: 's'.repeat(16) })).not.toBeNull();
    expect(getRateLimitSalt({})).toBeNull();
  });

  it('enables comments only for the literal "true"', () => {
    expect(commentsEnabled({ COMMENTS_ENABLED: 'true' })).toBe(true);
    expect(commentsEnabled({ COMMENTS_ENABLED: 'TRUE' })).toBe(false);
    expect(commentsEnabled({})).toBe(false);
  });
});
