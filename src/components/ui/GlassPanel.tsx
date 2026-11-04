import type { ElementType, HTMLAttributes } from 'react';

export type GlassRadius = 'tile' | 'card' | 'panel';

const RADIUS: Record<GlassRadius, string> = {
  tile: 'rounded-tile',
  card: 'rounded-card',
  panel: 'rounded-panel',
};

type GlassPanelProps = HTMLAttributes<HTMLElement> & {
  as?: ElementType;
  radius?: GlassRadius;
};

export function GlassPanel({ as: Tag = 'div', radius = 'card', className, ...rest }: GlassPanelProps) {
  return <Tag className={['glass', RADIUS[radius], className].filter(Boolean).join(' ')} {...rest} />;
}
