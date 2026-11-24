import { getCopy } from '@/lib/i18n/server';

export async function SkipLink() {
  const copy = await getCopy();
  return (
    <a
      href="#conteudo"
      className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[70] focus:rounded-full focus:bg-accent focus:px-5 focus:py-3 focus:text-sm focus:font-bold focus:text-on-accent"
    >
      {copy.nav.skipLink}
    </a>
  );
}
