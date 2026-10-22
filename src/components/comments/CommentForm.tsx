'use client';

import { useId, useState, type FormEvent } from 'react';
import { Button } from '@/components/ui/Button';
import { errorClass, fieldClass, honeypotClass, labelClass } from '@/components/sections/contact/field-styles';
import { copy } from '@/lib/copy';
import { sanitizeText } from '@/lib/security/sanitize';
import { checkComment, type CommentCode } from '@/components/sections/contact/client-validation';

type FieldErrors = Partial<Record<'name' | 'body', string>>;
type Status =
  | { kind: 'idle' }
  | { kind: 'sending' }
  | { kind: 'pending' }
  | { kind: 'error'; text: string };

const E = copy.comments.errors;

const CODE_TO_TEXT: Record<CommentCode, string> = {
  name_required: E.name,
  name_too_long: E.name,
  name_invalid: E.nameChars,
  body_required: E.body,
  body_too_long: E.bodyLong,
};

export function mapCommentErrors(codes: Record<string, string>): FieldErrors {
  const out: FieldErrors = {};
  if (codes.name) out.name = CODE_TO_TEXT[codes.name as CommentCode] ?? E.name;
  if (codes.body) out.body = CODE_TO_TEXT[codes.body as CommentCode] ?? E.body;
  return out;
}

export function CommentForm() {
  const uid = useId();
  const [startedAt] = useState(() => Date.now());
  const [errors, setErrors] = useState<FieldErrors>({});
  const [status, setStatus] = useState<Status>({ kind: 'idle' });
  const [bodyLength, setBodyLength] = useState(0);
  const sending = status.kind === 'sending';

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (sending) return;
    const form = event.currentTarget;
    const data = new FormData(form);
    const input = {
      name: String(data.get('name') ?? ''),
      body: String(data.get('body') ?? ''),
      website: String(data.get('website') ?? ''),
      startedAt,
    };

    const found = checkComment(input);
    if (Object.keys(found).length > 0) {
      setErrors(mapCommentErrors(found));
      setStatus({ kind: 'idle' });
      return;
    }
    setErrors({});
    setStatus({ kind: 'sending' });

    try {
      const res = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      });
      if (res.status === 202) {
        form.reset();
        setBodyLength(0);
        setStatus({ kind: 'pending' });
        return;
      }
      if (res.status === 400) {
        const body = (await res.json().catch(() => null)) as { errors?: Record<string, string> } | null;
        if (body?.errors) {
          setErrors(mapCommentErrors(body.errors));
          setStatus({ kind: 'idle' });
          return;
        }
      }
      setStatus({ kind: 'error', text: res.status === 429 ? E.rateLimit : E.publish });
    } catch {
      setStatus({ kind: 'error', text: E.publish });
    }
  }

  const nameId = `${uid}-cname`;
  const bodyId = `${uid}-cbody`;

  return (
    <form onSubmit={onSubmit} noValidate className="relative grid gap-4" aria-label={copy.comments.title}>
      <div className="grid gap-2">
        <label htmlFor={nameId} className={labelClass}>
          {copy.comments.labels.name}
        </label>
        <input
          id={nameId}
          name="name"
          type="text"
          required
          maxLength={40}
          autoComplete="nickname"
          placeholder={copy.comments.placeholders.name}
          aria-invalid={errors.name ? true : undefined}
          aria-describedby={errors.name ? `${nameId}-error` : undefined}
          className={fieldClass(Boolean(errors.name), 'h-12')}
        />
        {errors.name ? (
          <p id={`${nameId}-error`} className={errorClass}>
            {errors.name}
          </p>
        ) : null}
      </div>

      <div className="grid gap-2">
        <label htmlFor={bodyId} className={labelClass}>
          {copy.comments.labels.body}
        </label>
        <textarea
          id={bodyId}
          name="body"
          required
          rows={4}
          maxLength={600}
          placeholder={copy.comments.placeholders.body}
          onChange={(e) => setBodyLength(sanitizeText(e.currentTarget.value).length)}
          aria-invalid={errors.body ? true : undefined}
          aria-describedby={[errors.body ? `${bodyId}-error` : null, `${bodyId}-count`]
            .filter(Boolean)
            .join(' ')}
          className={fieldClass(Boolean(errors.body), 'resize-y py-3')}
        />
        <div className="flex justify-between gap-3">
          <p id={`${bodyId}-error`} className={errorClass}>
            {errors.body ?? null}
          </p>
          <p
            id={`${bodyId}-count`}
            className={['font-mono text-xs', bodyLength > 500 ? 'text-danger' : 'text-text-subtle'].join(' ')}
          >
            {bodyLength}/500
          </p>
        </div>
      </div>

      <div className={honeypotClass} aria-hidden="true">
        <label htmlFor={`${uid}-website`}>Website</label>
        <input id={`${uid}-website`} name="website" type="text" tabIndex={-1} autoComplete="off" defaultValue="" />
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <Button type="submit" aria-busy={sending} disabled={sending}>
          {copy.comments.submit}
        </Button>
        <p
          role="status"
          className={['text-[14px]', status.kind === 'error' ? 'text-danger' : 'text-text-muted'].join(' ')}
        >
          {status.kind === 'pending' ? copy.comments.pending : null}
          {status.kind === 'error' ? status.text : null}
        </p>
      </div>
    </form>
  );
}
