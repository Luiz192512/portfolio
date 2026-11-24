import { getCopy } from '@/lib/i18n/server';

export async function Footer() {
  const copy = await getCopy();
  return (
    <footer className="border-t border-line">
      <div className="container-site flex flex-col gap-2 py-8 font-mono text-xs text-text-subtle md:flex-row md:items-center md:justify-between">
        <p>{copy.footer.rights}</p>
        <p>{copy.footer.built}</p>
      </div>
    </footer>
  );
}
