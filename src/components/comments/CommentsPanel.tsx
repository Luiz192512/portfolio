import { GlassPanel } from '@/components/ui/GlassPanel';
import { commentsEnabled } from '@/lib/env';
import { CommentsBoard } from './CommentsBoard';

/** Server component. Renders nothing when the feature flag is off. */
export function CommentsPanel() {
  if (!commentsEnabled()) return null;
  return (
    <GlassPanel radius="panel" className="min-w-0 flex-[1_1_420px] p-6 md:p-8">
      <CommentsBoard />
    </GlassPanel>
  );
}
