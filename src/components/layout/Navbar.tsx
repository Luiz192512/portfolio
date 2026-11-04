'use client';

import { usePathname } from 'next/navigation';
import { m } from 'motion/react';
import { EntryItem } from '@/components/motion/EntryItem';
import { EASE_EXPO_OUT } from '@/components/motion/tokens';
import { copy } from '@/lib/copy';
import { SECTION_IDS } from '@/lib/site';
import { MobileMenu } from './MobileMenu';
import { NavAnchor } from './NavAnchor';
import type { NavLink } from './nav-types';
import { useScrollSpy } from './use-scroll-spy';


export function Navbar({ links }: { links: readonly NavLink[] }) {
  const pathname = usePathname();
  const onHome = pathname === '/';
  const active = useScrollSpy(SECTION_IDS, onHome);
  const hrefFor = (id: string) => (onHome ? `#${id}` : `/#${id}`);

  return (
    <EntryItem step="navbar" className="pointer-events-auto mx-auto max-w-[1080px]">
      <nav
        aria-label={copy.nav.ariaLabel}
        className="glass flex min-h-14 items-center justify-between rounded-full pl-5 pr-2 md:pr-5"
      >
        <Wordmark href={hrefFor('home')} onHome={onHome} />

        <ul className="hidden items-center gap-1 md:flex">
          {links.map((link) => {
            const isActive = active === link.id;
            return (
              <li key={link.id}>
                <NavAnchor
                  href={hrefFor(link.id)}
                  onHome={onHome}
                  aria-current={isActive ? 'true' : undefined}
                  className={[
                    'relative inline-flex min-h-11 items-center px-4 font-mono text-sm transition-colors duration-[180ms]',
                    isActive ? 'text-text' : 'text-text-muted hover:text-text',
                  ].join(' ')}
                >
                  {link.label}
                  {isActive ? (
                    <m.span
                      layoutId="nav-underline"
                      className="absolute inset-x-4 bottom-1.5 h-px bg-accent"
                      transition={{ duration: 0.3, ease: EASE_EXPO_OUT }}
                    />
                  ) : null}
                </NavAnchor>
              </li>
            );
          })}
        </ul>

        <MobileMenu links={links} hrefFor={hrefFor} onHome={onHome} active={active} />
      </nav>
    </EntryItem>
  );
}

function Wordmark({ href, onHome }: { href: string; onHome: boolean }) {
  const [first = '', second = ''] = copy.nav.wordmark.split('.');
  return (
    <NavAnchor
      href={href}
      onHome={onHome}
      aria-label={copy.nav.wordmark}
      className="inline-flex min-h-11 items-center text-xl font-bold tracking-[-0.02em]"
    >
      <span aria-hidden="true">
        {first}
        <span className="text-accent">.</span>
        {second}
      </span>
    </NavAnchor>
  );
}
