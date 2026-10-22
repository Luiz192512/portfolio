import type { ReactNode } from 'react';
import { Eyebrow } from './Eyebrow';

type SectionHeadingProps = {
  /** id of the h2, referenced by the section's aria-labelledby. */
  id: string;
  eyebrow: string;
  title: ReactNode;
  intro?: string;
  className?: string;
};

export function SectionHeading({ id, eyebrow, title, intro, className }: SectionHeadingProps) {
  return (
    <header className={className}>
      <Eyebrow>{eyebrow}</Eyebrow>
      <h2
        id={id}
        className="mt-3 text-[40px] font-extrabold leading-none tracking-[-0.04em] md:text-[64px]"
      >
        {title}
      </h2>
      {intro ? <p className="mt-4 max-w-2xl text-base text-text-muted md:text-lg">{intro}</p> : null}
    </header>
  );
}
