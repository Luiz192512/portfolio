import Image from 'next/image';
import { ViewTransition } from 'react';
import type { ImageRef } from '@/lib/content/schemas';

/** Detail LCP element. Shares `project-cover-<slug>` with the card cover. */
export function ProjectCover({ slug, cover }: { slug: string; cover: ImageRef }) {
  return (
    <ViewTransition name={`project-cover-${slug}`}>
      <div className="glass relative aspect-video w-full overflow-hidden rounded-panel">
        <Image
          src={cover.src}
          alt={cover.alt}
          fill
          priority
          sizes="(min-width: 1024px) 1200px, 100vw"
          className={cover.fit === 'contain' ? 'object-contain p-10' : 'object-cover'}
        />
      </div>
    </ViewTransition>
  );
}
