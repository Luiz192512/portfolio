import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { localePath, stripLocale } from '@/lib/i18n/locales';
import { DEFAULT_CONTENT_ROOT, readExperience, readProfile, readProjects } from './reader';

const EN_ROOT = path.join(DEFAULT_CONTENT_ROOT, 'en');

describe('English content mirrors Portuguese content', () => {
  it('has the same projects with the same structure', async () => {
    const [pt, en] = await Promise.all([readProjects(DEFAULT_CONTENT_ROOT), readProjects(EN_ROOT)]);
    expect(pt.length).toBe(10);
    expect(en.map((p) => p.slug)).toEqual(pt.map((p) => p.slug));
    for (const [i, p] of pt.entries()) {
      const e = en[i]!;
      expect(e.cover.src).toBe(p.cover.src);
      expect(e.tech).toEqual(p.tech);
      expect(e.link).toEqual(p.link);
      expect(e.repoUrl).toBe(p.repoUrl);
      expect(e.title).not.toBe('');
    }
  });

  it('has a profile with its own resume file and the same links', async () => {
    const [pt, en] = await Promise.all([readProfile(DEFAULT_CONTENT_ROOT), readProfile(EN_ROOT)]);
    expect(en.cvPath).not.toBe(pt.cvPath);
    expect(en.connect).toEqual(pt.connect);
  });

  it('has the same experience entries', async () => {
    const [pt, en] = await Promise.all([readExperience(DEFAULT_CONTENT_ROOT), readExperience(EN_ROOT)]);
    expect(en.map((x) => [x.start, x.end])).toEqual(pt.map((x) => [x.start, x.end]));
  });
});

describe('locale paths', () => {
  it('serves Portuguese at / and English under /en', () => {
    expect(localePath('pt')).toBe('/');
    expect(localePath('en')).toBe('/en');
    expect(localePath('en', '/portfolio/x')).toBe('/en/portfolio/x');
    expect(stripLocale('/en/portfolio/x')).toEqual({ locale: 'en', path: '/portfolio/x' });
    expect(stripLocale('/en')).toEqual({ locale: 'en', path: '/' });
    expect(stripLocale('/english')).toEqual({ locale: 'pt', path: '/english' });
  });
});
