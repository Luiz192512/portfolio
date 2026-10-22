import type { ReactNode } from 'react';

/** Non-interactive tag. */
export function Chip({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span
      className={[
        'inline-flex items-center rounded-full border border-line-strong bg-white/[0.03] px-3.5 py-2',
        'font-mono text-[13px] leading-none text-text',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {children}
    </span>
  );
}
