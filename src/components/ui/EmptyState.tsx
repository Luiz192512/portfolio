import type { ReactNode } from 'react';
import { GlassPanel } from './GlassPanel';
import { Icon, type IconName } from './Icon';

type EmptyStateProps = {
  icon?: IconName;
  title: string;
  text: string;
  /** Rendered below the text, e.g. a Button or ButtonLink. */
  action?: ReactNode;
};

export function EmptyState({ icon = 'folder', title, text, action }: EmptyStateProps) {
  return (
    <GlassPanel radius="card" className="flex flex-col items-center gap-3 px-6 py-12 text-center">
      <span className="text-accent">
        <Icon name={icon} size={40} />
      </span>
      <h3 className="text-[22px] font-bold leading-[1.15] tracking-[-0.02em] md:text-[28px]">{title}</h3>
      <p className="max-w-md text-[15px] text-text-muted">{text}</p>
      {action ? <div className="mt-3">{action}</div> : null}
    </GlassPanel>
  );
}
