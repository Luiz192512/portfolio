import { copy } from '@/lib/copy';
import { Navbar } from './Navbar';

export function Header() {
  return (
    <header className="pointer-events-none fixed inset-x-0 top-0 z-50 px-4 pt-4 md:px-10">
      <Navbar links={copy.nav.links} />
    </header>
  );
}
