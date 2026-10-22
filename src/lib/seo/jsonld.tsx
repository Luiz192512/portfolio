import type { Profile, StackGroup } from '@/lib/content/schemas';
import { siteUrl } from '@/lib/site';

type PersonJsonLdObject = {
  '@context': 'https://schema.org';
  '@type': 'Person';
  name: string;
  alternateName?: string;
  jobTitle: string;
  url: string;
  image?: string;
  knowsAbout?: string[];
  sameAs: string[];
};

/** Public profile links only: personal, https, never email or phone (schemas guard both). */
function publicSameAs(profile: Profile): string[] {
  return profile.connect
    .filter((link) => link.personal && link.kind !== 'email' && link.url.startsWith('https://'))
    .map((link) => link.url);
}

/** Builds the schema.org Person object from owner data. No phone, no address, no invented facts. */
export function buildPersonJsonLd(profile: Profile, stack: readonly StackGroup[]): PersonJsonLdObject {
  const base = siteUrl();
  const knowsAbout = stack.flatMap((group) => group.items.map((item) => item.name));
  const data: PersonJsonLdObject = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: profile.name,
    jobTitle: profile.role,
    url: base,
    sameAs: publicSameAs(profile),
  };
  if (profile.shortName && profile.shortName !== profile.name) data.alternateName = profile.shortName;
  if (profile.photo.src) data.image = new URL(profile.photo.src, base).toString();
  if (knowsAbout.length > 0) data.knowsAbout = knowsAbout;
  return data;
}

/** JSON for an inline script. "<", ">" and "&" are escaped so the payload cannot close the script tag. */
export function serializeJsonLd(data: unknown): string {
  return JSON.stringify(data)
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/&/g, '\\u0026');
}

export function PersonJsonLd({ profile, stack }: { profile: Profile; stack: readonly StackGroup[] }) {
  const json = serializeJsonLd(buildPersonJsonLd(profile, stack));
  return (
    <script
      type="application/ld+json"
      // eslint-disable-next-line react/no-danger -- JSON-LD is the single allowed exception (architecture 6.4, 8.3); payload is escaped above.
      dangerouslySetInnerHTML={{ __html: json }}
    />
  );
}
