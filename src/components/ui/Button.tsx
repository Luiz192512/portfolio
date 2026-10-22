import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from 'react';
import Link from 'next/link';

export type ButtonVariant = 'primary' | 'outline' | 'ghost';

const BASE =
  'inline-flex min-h-[52px] md:min-h-12 items-center justify-center gap-2 rounded-full px-6 text-[15px] ' +
  'select-none cursor-pointer transition-[transform,background-color,border-color,color] duration-[180ms] ease-micro ' +
  'disabled:cursor-not-allowed aria-busy:cursor-progress';

const VARIANTS: Record<ButtonVariant, string> = {
  primary:
    'bg-accent font-bold text-on-accent hover:-translate-y-0.5 hover:bg-accent-hover active:translate-y-0',
  outline:
    'border border-line-strong-hover bg-transparent font-bold text-text hover:border-accent',
  ghost: 'glass font-mono text-sm text-text hover:border-line-strong-hover',
};

export function buttonClass(variant: ButtonVariant, className?: string): string {
  return [BASE, VARIANTS[variant], className].filter(Boolean).join(' ');
}

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  children?: ReactNode;
};

export function Button({ variant = 'primary', className, type = 'button', ...rest }: ButtonProps) {
  return <button type={type} className={buttonClass(variant, className)} {...rest} />;
}

type ButtonLinkProps = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> & {
  href: string;
  variant?: ButtonVariant;
  /** Use next/link (client navigation). Default false: plain anchor, right for #hash and external. */
  internal?: boolean;
  children?: ReactNode;
};

export function ButtonLink({ variant = 'primary', internal = false, className, href, ...rest }: ButtonLinkProps) {
  const cls = buttonClass(variant, className);
  if (internal) return <Link href={href} className={cls} {...rest} />;
  const external = /^https?:/.test(href);
  return (
    <a
      href={href}
      className={cls}
      {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
      {...rest}
    />
  );
}
