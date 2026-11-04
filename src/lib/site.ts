export const SITE_NAME = 'Luiz Gustavo Enz';
export const SITE_TITLE = 'Luiz Gustavo Enz | Desenvolvedor Full Stack';
export const SITE_DESCRIPTION_MAX = 155;

/** The four home sections, in page order. Ids are the scroll-spy contract. */
export const SECTION_IDS = ['home', 'about', 'portfolio', 'contato'] as const;
export type SectionId = (typeof SECTION_IDS)[number];

const LOCAL_ORIGIN = 'http://localhost:3000';

function originOf(raw: string): string | null {
  try {
    return new URL(raw).origin;
  } catch {
    return null;
  }
}

/**
 * Canonical origin. Order: NEXT_PUBLIC_SITE_URL, then https://$VERCEL_PROJECT_PRODUCTION_URL
 * (a bare host set by Vercel), then localhost for dev and CI builds. An invalid value falls through.
 */
export function siteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (explicit) {
    const origin = originOf(explicit);
    if (origin) return origin;
  }
  const vercelHost = process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim();
  if (vercelHost) {
    const origin = originOf(`https://${vercelHost.replace(/^https?:\/\//, '')}`);
    if (origin) return origin;
  }
  return LOCAL_ORIGIN;
}

/** Cut at a word boundary, never beyond `max` characters. */
export function cutAtWord(text: string, max: number = SITE_DESCRIPTION_MAX): string {
  if (text.length <= max) return text;
  const slice = text.slice(0, max);
  const lastSpace = slice.lastIndexOf(' ');
  return (lastSpace > 0 ? slice.slice(0, lastSpace) : slice).trimEnd();
}
