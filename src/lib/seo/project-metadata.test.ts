import { describe, expect, it } from 'vitest';
import type { Project } from '@/lib/content/schemas';
import { buildProjectMetadata } from './project-metadata';

const project = {
  title: 'Projeto X',
  summary: 'Resumo curto do projeto.',
  cover: { src: '/images/x.webp', alt: 'Capa X' },
} as unknown as Project;

describe('buildProjectMetadata', () => {
  it('uses og:type article with absolute url and image', () => {
    const md = buildProjectMetadata(project, 'x');
    const og = md.openGraph as { type: string; url: string; title: string; description: string; images: { url: string }[] };
    expect(og.type).toBe('article');
    expect(og.title).toBe('Projeto X');
    expect(og.description).toBe('Resumo curto do projeto.');
    expect(og.url).toMatch(/^https?:\/\/[^/]+\/portfolio\/x$/);
    expect(og.images[0]?.url).toMatch(/^https?:\/\/[^/]+\/images\/x\.webp$/);
  });
});
