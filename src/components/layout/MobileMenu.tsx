'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { m } from 'motion/react';
import { EASE_EXPO_OUT } from '@/components/motion/tokens';
import { Icon } from '@/components/ui/Icon';
import { copy } from '@/lib/copy';
import { NavAnchor } from './NavAnchor';
import type { NavLink } from './nav-types';

type MobileMenuProps = {
  links: readonly NavLink[];
  hrefFor: (id: string) => string;
  onHome: boolean;
  active: string | null;
};

/** Native <dialog>: showModal() gives focus trap, Esc and an inert background. */
export function MobileMenu({ links, hrefFor, onHome, active }: MobileMenuProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  const dialogId = useId();

  const show = () => {
    const dialog = dialogRef.current;
    if (!dialog || dialog.open) return;
    dialog.showModal();
    setOpen(true);
  };

  const hide = () => {
    const dialog = dialogRef.current;
    if (dialog?.open) dialog.close();
    setOpen(false);
  };

  // Keep state in sync when the browser closes the dialog itself (Esc).
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    const onClose = () => {
      setOpen(false);
      toggleRef.current?.focus();
    };
    dialog.addEventListener('close', onClose);
    return () => dialog.removeEventListener('close', onClose);
  }, []);

  // Close if the viewport grows past the mobile breakpoint.
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 768px)');
    const onChange = () => {
      if (mq.matches) hide();
    };
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  return (
    <>
      <button
        ref={toggleRef}
        type="button"
        aria-expanded={open}
        aria-controls={dialogId}
        aria-label={copy.nav.openMenu}
        onClick={open ? hide : show}
        className="inline-flex size-11 items-center justify-center rounded-full text-text transition-colors hover:bg-white/5 md:hidden"
      >
        <Icon name={open ? 'close' : 'menu'} />
      </button>

      <dialog
        ref={dialogRef}
        id={dialogId}
        aria-label={copy.nav.ariaLabel}
        className="menu-sheet"
        onKeyDown={(event) => {
          // Keep Tab and Shift+Tab looping inside the sheet (WCAG 2.4.3). Esc closes natively.
          if (event.key !== 'Tab') return;
          const focusable = Array.from(
            event.currentTarget.querySelectorAll<HTMLElement>('a[href], button:not([disabled])'),
          );
          const first = focusable[0];
          const last = focusable[focusable.length - 1];
          if (!first || !last) return;
          const current = document.activeElement;
          if (event.shiftKey && (current === first || current === event.currentTarget)) {
            event.preventDefault();
            last.focus();
          } else if (!event.shiftKey && current === last) {
            event.preventDefault();
            first.focus();
          }
        }}
        onClick={(event) => {
          // Backdrop click: the target is the dialog element itself.
          if (event.target === event.currentTarget) hide();
        }}
      >
        {open ? (
          <m.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: EASE_EXPO_OUT }}
            className="glass mx-4 mt-4 rounded-panel p-3"
          >
            <div className="mb-1 flex justify-end">
              <button
                type="button"
                aria-label={copy.nav.closeMenu}
                onClick={hide}
                className="inline-flex size-11 items-center justify-center rounded-full text-text hover:bg-white/5"
              >
                <Icon name="close" />
              </button>
            </div>
            <ul>
              {links.map((link) => (
                <li key={link.id}>
                  <NavAnchor
                    href={hrefFor(link.id)}
                    onHome={onHome}
                    onClick={hide}
                    aria-current={active === link.id ? 'true' : undefined}
                    className={[
                      'flex min-h-12 items-center rounded-tile px-4 font-mono text-base',
                      active === link.id ? 'text-accent' : 'text-text-muted hover:text-text',
                    ].join(' ')}
                  >
                    {link.label}
                  </NavAnchor>
                </li>
              ))}
            </ul>
          </m.div>
        ) : null}
      </dialog>
    </>
  );
}
