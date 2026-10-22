'use client';

import { useEffect, useState } from 'react';

/**
 * Returns the id of the section under the reading line, or null before the first
 * observation or when disabled. One IntersectionObserver, no scroll listeners.
 */
export function useScrollSpy(ids: readonly string[], enabled = true): string | null {
  const [active, setActive] = useState<string | null>(null);

  useEffect(() => {
    if (!enabled) return;

    const elements = ids
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);
    if (elements.length === 0) return;

    const visible = new Set<string>();

    const resolve = () => {
      let next: string | null = null;
      if (window.scrollY < 8) {
        next = ids[0] ?? null;
      } else {
        // Last section in page order that intersects the reading line wins.
        for (const id of ids) if (visible.has(id)) next = id;
      }
      if (next !== null) setActive((prev) => (prev === next ? prev : next));
    };

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) visible.add(entry.target.id);
          else visible.delete(entry.target.id);
        }
        resolve();
      },
      { rootMargin: '-45% 0px -50% 0px', threshold: 0 },
    );

    for (const el of elements) observer.observe(el);
    return () => observer.disconnect();
  }, [ids, enabled]);

  return enabled ? active : null;
}
