/** Origin allow-list for POST routes (architecture 5, step 2). */

type Source = Record<string, string | undefined>;

function originOf(value: string | undefined): string | null {
  if (!value) return null;
  try {
    return new URL(value.includes('://') ? value : `https://${value}`).origin;
  } catch {
    return null;
  }
}

export function allowedOrigins(source: Source = process.env): string[] {
  const list = [
    originOf(source.NEXT_PUBLIC_SITE_URL),
    originOf(source.VERCEL_URL),
    originOf(source.VERCEL_BRANCH_URL),
  ];
  if (source.NODE_ENV === 'development') list.push('http://localhost:3000');
  return list.filter((o): o is string => o !== null);
}

export function isAllowedOrigin(origin: string | null | undefined, source: Source = process.env): boolean {
  if (!origin) return false;
  return allowedOrigins(source).includes(origin);
}
