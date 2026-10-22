import type { ReactNode } from 'react';

/** DM Mono hint with the "// " prefix. */
export function MonoHint({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <p className={['font-mono text-xs text-text-subtle md:text-[13px]', className].filter(Boolean).join(' ')}>
      <span aria-hidden="true">{'// '}</span>
      {children}
    </p>
  );
}
