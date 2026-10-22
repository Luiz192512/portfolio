import { cp, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { existsSync, readdirSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import {
  ContentError,
  readCertificates,
  readExperience,
  readProfile,
  readProject,
  readProjectSlugs,
  readProjects,
  readStack,
} from './reader';
import { ProfileSchema, ProjectSchema, isNotPhoneLink } from './schemas';
import { computeStats } from './stats';

const FIXTURES = path.join(process.cwd(), 'content', '__fixtures__');
const VALID = path.join(FIXTURES, 'valid');
const INVALID = path.join(FIXTURES, 'invalid');

describe('valid fixture', () => {
  it('loads profile, experience and stack', async () => {
    const profile = await readProfile(VALID);
    expect(profile.shortName).toBe('Fulano Teste');
    expect(await readExperience(VALID)).toHaveLength(2);
    const stack = await readStack(VALID);
    expect(stack.map((g) => g.category)).toEqual(['languages', 'data']);
  });

  it('sorts projects by featured, order, title and adds slugs', async () => {
    const projects = await readProjects(VALID);
    expect(projects.map((p) => p.slug)).toEqual(['beta', 'alpha']);
    expect(projects[0]?.cover.fit).toBe('contain');
    expect(projects[1]?.gallery).toEqual([]);
    expect(await readProjectSlugs(VALID)).toEqual(['beta', 'alpha']);
    expect((await readProject('alpha', VALID))?.title).toBe('Alpha');
    expect(await readProject('nope', VALID)).toBeNull();
  });

  it('sorts certificates by date desc and computes stats', async () => {
    const certs = await readCertificates(VALID);
    expect(certs.map((c) => c.slug)).toEqual(['curso-b', 'curso-a']);
    const stats = computeStats({
      projects: await readProjects(VALID),
      certificates: certs,
      experience: await readExperience(VALID),
    });
    expect(stats).toEqual({ projects: 2, certificates: 2, experiences: 2, experienceSource: 'Org A, Org B' });
  });

  it('returns no certificates when the directory is missing', async () => {
    expect(await readCertificates(path.join(FIXTURES, 'does-not-exist'))).toEqual([]);
  });
});

describe('invalid data', () => {
  it('throws a readable message naming file and field', async () => {
    const err = await readProjects(INVALID).catch((e: unknown) => e);
    expect(err).toBeInstanceOf(ContentError);
    const msg = (err as Error).message;
    expect(msg).toContain('content/projects/broken.json');
    expect(msg).toContain('summary');
    expect(msg).toMatch(/typo|Unrecognized key/);
  });

  it('names the file when it is missing', async () => {
    await expect(readProfile(INVALID)).rejects.toThrow('content/profile.json: file is missing');
  });
});

describe('privacy guard', () => {
  it('detects phone links', () => {
    expect(isNotPhoneLink('tel:+5544999999999')).toBe(false);
    expect(isNotPhoneLink('https://wa.me/5544999999999')).toBe(false);
    expect(isNotPhoneLink('https://api.whatsapp.com/send?phone=1')).toBe(false);
    expect(isNotPhoneLink('https://github.com/x')).toBe(true);
  });

  it('rejects phone links in profile.connect', async () => {
    const base = JSON.parse(
      await (await import('node:fs/promises')).readFile(path.join(VALID, 'profile.json'), 'utf8'),
    ) as Record<string, unknown>;
    for (const url of ['tel:+5544999999999', 'https://wa.me/5544999999999']) {
      const bad = { ...base, connect: [{ kind: 'site', label: 'Site', display: 'x', url, personal: false }] };
      const res = ProfileSchema.safeParse(bad);
      expect(res.success).toBe(false);
    }
  });

  it('rejects phone links in project link and repo url', () => {
    const base = {
      title: 'T',
      kind: 'K',
      summary: 'Resumo de teste com tamanho suficiente para passar.',
      cover: { src: '/projects/t/c.webp', alt: 'Capa de teste' },
      tech: ['a'],
      features: ['abc'],
      order: 0,
    };
    expect(ProjectSchema.safeParse({ ...base, link: { status: 'live', url: 'https://wa.me/55' } }).success).toBe(false);
    expect(ProjectSchema.safeParse({ ...base, link: { status: 'none' }, repoUrl: 'https://example.com/x' }).success).toBe(
      false,
    );
  });
});

describe('content without code changes', () => {
  let tmp = '';
  beforeAll(async () => {
    tmp = await mkdtemp(path.join(os.tmpdir(), 'content-'));
    await cp(VALID, tmp, { recursive: true });
  });
  afterAll(async () => {
    await rm(tmp, { recursive: true, force: true });
  });

  it('a new project file appears in the list and slugs', async () => {
    const raw = await (await import('node:fs/promises')).readFile(path.join(VALID, 'projects', 'alpha.json'), 'utf8');
    const gamma = raw.replace('Alpha', 'Gamma').replaceAll('alpha', 'gamma').replace('"order": 2', '"order": 9');
    await writeFile(path.join(tmp, 'projects', 'gamma.json'), gamma);
    const slugs = await readProjectSlugs(tmp);
    expect(slugs).toEqual(['beta', 'alpha', 'gamma']);
  });

  it('rejects duplicate order and mismatched cover path', async () => {
    const raw = await (await import('node:fs/promises')).readFile(path.join(VALID, 'projects', 'beta.json'), 'utf8');
    await writeFile(path.join(tmp, 'projects', 'dup.json'), raw.replaceAll('beta', 'dup'));
    await expect(readProjects(tmp)).rejects.toThrow(/order: duplicate value 1/);
    await writeFile(path.join(tmp, 'projects', 'dup.json'), raw.replace('"order": 1', '"order": 5'));
    await expect(readProjects(tmp)).rejects.toThrow(/dup\.json: cover\.src: must start with \/projects\/dup\//);
    await rm(path.join(tmp, 'projects', 'dup.json'));
  });
});

/** Validates the real content/ directory. Skips only while it is still empty. */
const CONTENT = path.join(process.cwd(), 'content');
const hasRealContent =
  existsSync(path.join(CONTENT, 'profile.json')) ||
  existsSync(path.join(CONTENT, 'stack.json')) ||
  (existsSync(path.join(CONTENT, 'projects')) &&
    readdirSync(path.join(CONTENT, 'projects')).some((n) => n.endsWith('.json')));

describe.skipIf(!hasRealContent)('real content/ directory', () => {
  it('validates every file', async () => {
    const [profile, experience, stack, projects, certificates] = await Promise.all([
      readProfile(),
      readExperience(),
      readStack(),
      readProjects(),
      readCertificates(),
    ]);
    expect(profile.connect.length).toBeGreaterThan(0);
    expect(experience.length).toBeGreaterThan(0);
    expect(stack.length).toBeGreaterThan(0);
    expect(projects.length).toBeGreaterThan(0);
    expect(Array.isArray(certificates)).toBe(true);
  });
});
