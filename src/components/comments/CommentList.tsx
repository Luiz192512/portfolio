'use client';

import { useEffect, useRef } from 'react';
import { EmptyState } from '@/components/ui/EmptyState';
import { copy } from '@/lib/copy';
import { CommentItem, CommentSkeleton, type PublicComment } from './CommentItem';

export type CommentsState =
  | { kind: 'loading' }
  | { kind: 'error' }
  | { kind: 'ready'; total: number; items: PublicComment[] };

type CommentListProps = {
  state: CommentsState;
  /** Called once, the first time the list enters the viewport. */
  onVisible: () => void;
};

export function CommentList({ state, onVisible }: CommentListProps) {
  const ref = useRef<HTMLDivElement>(null);
  const onVisibleRef = useRef(onVisible);

  useEffect(() => {
    onVisibleRef.current = onVisible;
  }, [onVisible]);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    if (typeof IntersectionObserver === 'undefined') {
      onVisibleRef.current();
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          observer.disconnect();
          onVisibleRef.current();
        }
      },
      { rootMargin: '200px' },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref}>
      <CommentListBody state={state} />
    </div>
  );
}

export function CommentListBody({ state }: { state: CommentsState }) {
  if (state.kind === 'loading') return <CommentSkeleton />;
  if (state.kind === 'error') {
    return (
      <p role="status" className="text-[14px] text-danger">
        {copy.comments.errors.load}
      </p>
    );
  }
  if (state.items.length === 0) {
    return <EmptyState icon="quote" title={copy.comments.emptyTitle} text={copy.comments.emptyText} />;
  }
  return (
    <ul className="grid max-h-[480px] gap-3 overflow-y-auto pr-1">
      {state.items.map((comment) => (
        <CommentItem key={comment.id} comment={comment} />
      ))}
    </ul>
  );
}
