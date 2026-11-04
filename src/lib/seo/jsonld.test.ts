import { describe, expect, it } from 'vitest';
import type { Profile, StackGroup } from '@/lib/content/schemas';
import { buildPersonJsonLd, PersonJsonLd, serializeJsonLd } from './jsonld';

const profile = {
  name: 'Luiz Gustavo Lorençone Enz',
  shortName: 'Luiz Gustavo Enz',
  nameLines: ['Luiz', 'Gustavo', 'Enz'],
  role: 'Desenvolvedor Full Stack',
  roleShort: 'Full Stack',
  location: 'Maringá, PR',
  available: true,
  heroIntro: 'Intro',
  bio: 'Bio',
  typewriterPhrases: ['Full Stack'],
  heroChips: ['Next.js'],
  hints: [],
  photo: { src: '/images/photo-480.webp', alt: 'Foto de Luiz Gustavo Enz', fit: 'cover' },
  cvPath: '/cv/luiz-gustavo-enz-cv.pdf',
  connect: [
    { kind: 'linkedin', label: 'LinkedIn', display: 'in/x', url: 'https://linkedin.com/in/x', personal: true },
    { kind: 'github', label: 'GitHub', display: 'x', url: 'https://github.com/x', personal: true },
    { kind: 'site', label: 'Site', display: 'enz', url: 'https://enzsoftwares.com', personal: false },
    { kind: 'email', label: 'E-mail', display: 'a@b.com', url: 'mailto:a@b.com', personal: true },
  ],
} as unknown as Profile;

const stack: StackGroup[] = [
  {
    category: 'languages',
    items: [{ name: 'TypeScript', monogram: 'TS', category: 'languages' }],
  },
];

function scriptHtml(): string {
  const el = PersonJsonLd({ profile, stack }) as unknown as {
    props: { type: string; dangerouslySetInnerHTML: { __html: string } };
  };
  expect(el.props.type).toBe('application/ld+json');
  return el.props.dangerouslySetInnerHTML.__html;
}

describe('buildPersonJsonLd', () => {
  it('builds a schema.org Person with owner facts', () => {
    const data = buildPersonJsonLd(profile, stack);
    expect(data['@context']).toBe('https://schema.org');
    expect(data['@type']).toBe('Person');
    expect(data.name).toBe(profile.name);
    expect(data.alternateName).toBe(profile.shortName);
    expect(data.jobTitle).toBe(profile.role);
    expect(data.url).toMatch(/^https?:\/\//);
    expect(data.image).toMatch(/\/images\/photo-480\.webp$/);
    expect(data.knowsAbout).toEqual(['TypeScript']);
  });

  it('lists only personal https profile links in sameAs', () => {
    const data = buildPersonJsonLd(profile, stack);
    expect(data.sameAs).toEqual(['https://linkedin.com/in/x', 'https://github.com/x']);
  });

  it('never includes phone, WhatsApp or tel data', () => {
    const json = scriptHtml();
    expect(json).not.toMatch(/tel:|wa\.me|whatsapp|telephone/i);
  });
});

describe('PersonJsonLd', () => {
  it('renders a ld+json script whose payload cannot break out of the tag', () => {
    const hostile = { ...profile, name: '</script><script>alert(1)</script>' } as Profile;
    const el = PersonJsonLd({ profile: hostile, stack: [] }) as unknown as {
      props: { dangerouslySetInnerHTML: { __html: string } };
    };
    const html = el.props.dangerouslySetInnerHTML.__html;
    expect(html).not.toContain('<');
    expect(html).not.toContain('>');
    expect(JSON.parse(html).name).toBe('</script><script>alert(1)</script>');
  });
});

describe('serializeJsonLd', () => {
  it('escapes angle brackets and ampersands', () => {
    const out = serializeJsonLd({ a: '<b>&' });
    expect(out).toBe('{"a":"\\u003cb\\u003e\\u0026"}');
    expect(JSON.parse(out)).toEqual({ a: '<b>&' });
  });
});
