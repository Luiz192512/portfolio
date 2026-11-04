/** Shared form field classes (DESIGN.md: 48 tall inputs, radius 14, accent focus). */
export const labelClass = 'font-mono text-xs uppercase tracking-[0.12em] text-text-muted';

export function fieldClass(hasError: boolean, extra?: string): string {
  return [
    'w-full rounded-input border bg-white/[0.03] px-4 text-[15px] text-text',
    'placeholder:text-text-subtle transition-colors duration-[180ms] ease-micro',
    'focus-visible:border-accent',
    hasError ? 'border-danger' : 'border-line-strong',
    extra,
  ]
    .filter(Boolean)
    .join(' ');
}

/** Off-screen honeypot wrapper. Not display:none so naive bots still fill it. */
export const honeypotClass = 'absolute -left-[9999px] top-auto h-px w-px overflow-hidden';

export const errorClass = 'text-[13px] text-danger';
