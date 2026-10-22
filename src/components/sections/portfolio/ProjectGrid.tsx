'use client';

import { useId, useState, type ReactNode } from 'react';
import { Button } from '@/components/ui/Button';
import { copy } from '@/lib/copy';

export const VISIBLE_COUNT = 6;

/** Owns the "Ver mais" state. All items stay in the HTML; extras get `hidden`. */
export function ProjectGrid({ items }: { items: ReactNode[] }) {
  const [expanded, setExpanded] = useState(false);
  const gridId = useId();
  return (
    <div>
      <ul id={gridId} className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {items.map((item, index) => (
          <li key={index} hidden={!expanded && index >= VISIBLE_COUNT} className="flex">
            {item}
          </li>
        ))}
      </ul>
      {items.length > VISIBLE_COUNT ? (
        <div className="mt-8 flex justify-center">
          <Button
            variant="ghost"
            aria-expanded={expanded}
            aria-controls={gridId}
            onClick={() => setExpanded((v) => !v)}
          >
            {expanded ? copy.portfolio.showLess : copy.portfolio.showMore}
          </Button>
        </div>
      ) : null}
    </div>
  );
}
