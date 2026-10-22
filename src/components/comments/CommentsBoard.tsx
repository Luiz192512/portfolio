'use client';

import { useCallback, useRef, useState } from 'react';
import { copy } from '@/lib/copy';
import { CommentForm } from './CommentForm';
import { CommentList, type CommentsState } from './CommentList';

/** Client shell: header with count, form, and the lazily fetched list (one fetch per page view). */
export function CommentsBoard() {
  const [state, setState] = useState<CommentsState>({ kind: 'loading' });
  const started = useRef(false);

  const load = useCallback(async () => {
    if (started.current) return;
    started.current = true;
    try {
      const res = await fetch('/api/comments');
      if (!res.ok) throw new Error('load_failed');
      const data = (await res.json()) as { total: number; items: Array<Record<string, unknown>> };
      setState({
        kind: 'ready',
        total: data.total,
        items: data.items.map((item) => ({
          id: String(item.id),
          name: String(item.name),
          body: String(item.body),
          createdAt: String(item.createdAt),
          pinned: item.pinned === true,
        })),
      });
    } catch {
      setState({ kind: 'error' });
    }
  }, []);

  return (
    <div className="grid gap-6">
      <div className="flex items-baseline justify-between gap-3">
        <h3 className="text-[22px] font-bold leading-[1.15] tracking-[-0.02em]">{copy.comments.title}</h3>
        {state.kind === 'ready' ? (
          <span className="font-mono text-xs text-text-muted">{copy.comments.count(state.total)}</span>
        ) : null}
      </div>
      <CommentForm />
      <CommentList state={state} onVisible={load} />
    </div>
  );
}
