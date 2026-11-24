import { getCopy } from '@/lib/i18n/server';
import { Navbar } from './Navbar';

export async function Header() {
  const copy = await getCopy();
  return (
    <header className="pointer-events-none fixed inset-x-0 top-0 z-50 px-4 pt-4 md:px-10">
      <Navbar links={copy.nav.links} />
    </header>
  );
}
