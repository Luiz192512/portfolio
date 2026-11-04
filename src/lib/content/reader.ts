import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import type { ZodType } from 'zod';
import {
  CertificateSchema,
  ExperienceListSchema,
  ProfileSchema,
  ProjectSchema,
  SLUG_PATTERN,
  StackSchema,
  TECH_CATEGORIES,
  type Certificate,
  type Experience,
  type Profile,
  type Project,
  type StackGroup,
} from './schemas';

/** Pure filesystem readers. They take the content root so tests can point at fixtures. */

export class ContentError extends Error {
  override name = 'ContentError';
}

export const DEFAULT_CONTENT_ROOT = path.join(process.cwd(), 'content');

function label(root: string, file: string): string {
  return `content/${path.relative(root, file).split(path.sep).join('/')}`;
}

async function readJson<T>(root: string, file: string, schema: ZodType<T>): Promise<T> {
  let raw: string;
  try {
    raw = await readFile(file, 'utf8');
  } catch {
    throw new ContentError(`${label(root, file)}: file is missing or unreadable`);
  }
  let json: unknown;
  try {
    json = JSON.parse(raw);
  } catch (e) {
    const detail = e instanceof Error ? e.message : 'unknown error';
    throw new ContentError(`${label(root, file)}: invalid JSON: ${detail}`);
  }
  const result = schema.safeParse(json);
  if (!result.success) {
    const lines = result.error.issues.map((i) => {
      const where = i.path.length > 0 ? i.path.join('.') : '(root)';
      return `${label(root, file)}: ${where}: ${i.message}`;
    });
    throw new ContentError(lines.join('\n'));
  }
  return result.data;
}

async function listJson(dir: string): Promise<string[]> {
  let names: string[];
  try {
    names = await readdir(dir);
  } catch {
    return [];
  }
  return names.filter((n) => n.endsWith('.json')).sort();
}

function slugOf(root: string, dir: string, name: string): string {
  const slug = name.slice(0, -'.json'.length);
  if (!SLUG_PATTERN.test(slug)) {
    throw new ContentError(`${label(root, path.join(dir, name))}: file name: slug must be kebab-case (a-z, 0-9, hyphen)`);
  }
  return slug;
}

export function readProfile(root = DEFAULT_CONTENT_ROOT): Promise<Profile> {
  return readJson(root, path.join(root, 'profile.json'), ProfileSchema);
}

export function readExperience(root = DEFAULT_CONTENT_ROOT): Promise<Experience[]> {
  return readJson(root, path.join(root, 'experience.json'), ExperienceListSchema);
}

export async function readStack(root = DEFAULT_CONTENT_ROOT): Promise<StackGroup[]> {
  const { items } = await readJson(root, path.join(root, 'stack.json'), StackSchema);
  return TECH_CATEGORIES.map((category) => ({
    category,
    items: items.filter((i) => i.category === category),
  })).filter((g) => g.items.length > 0);
}

export async function readProjects(root = DEFAULT_CONTENT_ROOT): Promise<Project[]> {
  const dir = path.join(root, 'projects');
  const names = await listJson(dir);
  const projects = await Promise.all(
    names.map(async (name) => {
      const slug = slugOf(root, dir, name);
      const file = path.join(dir, name);
      const data = await readJson(root, file, ProjectSchema);
      if (!data.cover.src.startsWith(`/projects/${slug}/`)) {
        throw new ContentError(`${label(root, file)}: cover.src: must start with /projects/${slug}/`);
      }
      return { ...data, slug } satisfies Project;
    }),
  );
  const seen = new Map<number, string>();
  for (const p of projects) {
    const other = seen.get(p.order);
    if (other !== undefined) {
      throw new ContentError(
        `content/projects/${p.slug}.json: order: duplicate value ${p.order} (also used by ${other}.json)`,
      );
    }
    seen.set(p.order, p.slug);
  }
  return projects.sort(
    (a, b) => Number(b.featured) - Number(a.featured) || a.order - b.order || a.title.localeCompare(b.title),
  );
}

export async function readProject(slug: string, root = DEFAULT_CONTENT_ROOT): Promise<Project | null> {
  return (await readProjects(root)).find((p) => p.slug === slug) ?? null;
}

export async function readProjectSlugs(root = DEFAULT_CONTENT_ROOT): Promise<string[]> {
  return (await readProjects(root)).map((p) => p.slug);
}

export async function readCertificates(root = DEFAULT_CONTENT_ROOT): Promise<Certificate[]> {
  const dir = path.join(root, 'certificates');
  const names = await listJson(dir);
  const certs = await Promise.all(
    names.map(async (name) => ({
      ...(await readJson(root, path.join(dir, name), CertificateSchema)),
      slug: slugOf(root, dir, name),
    })),
  );
  return certs.sort((a, b) => b.date.localeCompare(a.date) || a.title.localeCompare(b.title));
}
