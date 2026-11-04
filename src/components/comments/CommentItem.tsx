import { copy } from '@/lib/copy';

export type PublicComment = {
  id: string;
  name: string;
  body: string;
  createdAt: string;
  pinned: boolean;
};

/** First grapheme, uppercased. Falls back to the first code point without Intl.Segmenter. */
export function avatarInitial(name: string): string {
  const trimmed = name.trim();
  if (!trimmed) return '?';
  const Segmenter = (Intl as unknown as {
    Segmenter?: new (
      locale?: string,
      options?: { granularity: 'grapheme' },
    ) => { segment(input: string): Iterable<{ segment: string }> };
  }).Segmenter;
  let first: string | undefined;
  if (Segmenter) {
    for (const part of new Segmenter('pt-BR', { granularity: 'grapheme' }).segment(trimmed)) {
      first = part.segment;
      break;
    }
  }
  return (first ?? Array.from(trimmed)[0] ?? '?').toLocaleUpperCase('pt-BR');
}

export function formatCommentDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  return new Intl.DateTimeFormat('pt-BR', { dateStyle: 'medium', timeZone: 'America/Sao_Paulo' }).format(date);
}

/**
 * User text is rendered only as React text nodes (escaped by React). No
 * dangerouslySetInnerHTML, no markdown, no auto-linking.
 */
export function CommentItem({ comment }: { comment: PublicComment }) {
  const date = formatCommentDate(comment.createdAt);
  return (
    <li
      className={[
        'flex gap-3 rounded-tile border p-4',
        comment.pinned ? 'border-accent/35 bg-accent/[0.06]' : 'border-line bg-white/[0.02]',
      ].join(' ')}
    >
      <span
        aria-hidden="true"
        className="flex size-10 shrink-0 items-center justify-center rounded-full border border-line-strong font-mono text-sm text-accent"
      >
        {avatarInitial(comment.name)}
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <span className="break-words text-[15px] font-bold text-text">{comment.name}</span>
          {date ? (
            <time dateTime={comment.createdAt} className="font-mono text-xs text-text-subtle">
              {date}
            </time>
          ) : null}
          {comment.pinned ? (
            <span className="rounded-full bg-accent px-2 py-0.5 font-mono text-[10px] text-on-accent">
              {copy.comments.pinned}
            </span>
          ) : null}
        </div>
        <p className="mt-1 whitespace-pre-line break-words text-[15px] text-text-muted">{comment.body}</p>
      </div>
    </li>
  );
}

export function CommentSkeleton() {
  return (
    <div role="status" aria-label={copy.comments.loading} className="grid gap-3">
      <span className="sr-only">{copy.comments.loading}</span>
      {[0, 1].map((i) => (
        <div key={i} aria-hidden="true" className="flex animate-pulse gap-3 rounded-tile border border-line p-4">
          <span className="size-10 shrink-0 rounded-full bg-white/10" />
          <span className="grid flex-1 gap-2">
            <span className="h-3 w-1/3 rounded bg-white/10" />
            <span className="h-3 w-full rounded bg-white/5" />
          </span>
        </div>
      ))}
    </div>
  );
}
