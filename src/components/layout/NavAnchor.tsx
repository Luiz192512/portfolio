'use client';

import type { ReactNode } from 'react';
import Link from 'next/link';

type NavAnchorProps = {
  href: string;
  onHome: boolean;
  className?: string;
  onClick?: () => void;
  children?: ReactNode;
  'aria-current'?: 'true';
  'aria-label'?: string;
};

/** Plain anchor on the home page, next/link elsewhere. */
export function NavAnchor({ href, onHome, ...rest }: NavAnchorProps) {
  if (onHome) return <a href={href} {...rest} />;
  return <Link href={href} {...rest} />;
}
