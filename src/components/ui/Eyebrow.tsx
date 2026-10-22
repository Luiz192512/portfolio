import type { ReactNode } from 'react';

export function Eyebrow({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <p
      className={[
        'font-mono text-[11px] uppercase tracking-[0.2em] text-accent md:text-xs',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {children}
    </p>
  );
}
