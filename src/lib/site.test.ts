import { afterEach, describe, expect, it, vi } from 'vitest';
import { siteUrl } from './site';

afterEach(() => {
  vi.unstubAllEnvs();
});

function setEnv(site: string, vercel: string) {
  vi.stubEnv('NEXT_PUBLIC_SITE_URL', site);
  vi.stubEnv('VERCEL_PROJECT_PRODUCTION_URL', vercel);
}

describe('siteUrl', () => {
  it('prefers NEXT_PUBLIC_SITE_URL and normalizes to the origin', () => {
    setEnv('https://site.test/path/', 'prod.vercel.test');
    expect(siteUrl()).toBe('https://site.test');
  });

  it('uses https://$VERCEL_PROJECT_PRODUCTION_URL when the site URL is unset', () => {
    setEnv('', 'prod.vercel.test');
    expect(siteUrl()).toBe('https://prod.vercel.test');
  });

  it('falls through an invalid NEXT_PUBLIC_SITE_URL', () => {
    setEnv('not a url', 'prod.vercel.test');
    expect(siteUrl()).toBe('https://prod.vercel.test');
  });

  it('falls back to localhost when nothing is set', () => {
    setEnv('', '');
    expect(siteUrl()).toBe('http://localhost:3000');
  });
});
