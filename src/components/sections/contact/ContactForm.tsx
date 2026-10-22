'use client';

import { useId, useState, type FormEvent } from 'react';
import { Button } from '@/components/ui/Button';
import { copy } from '@/lib/copy';
import { checkContact, type ContactCode } from './client-validation';
import { errorClass, fieldClass, honeypotClass, labelClass } from './field-styles';

type FieldErrors = Partial<Record<'name' | 'email' | 'message', string>>;
type Status =
  | { kind: 'idle' }
  | { kind: 'sending' }
  | { kind: 'success' }
  | { kind: 'error'; text: string };

const E = copy.contact.errors;

const CODE_TO_TEXT: Record<ContactCode, string> = {
  name_required: E.name,
  name_too_long: E.name,
  email_invalid: E.email,
  message_required: E.message,
  message_too_short: E.messageShort,
  message_too_long: E.messageLong,
};

/** Maps validation codes (client or server) to pt-BR copy. Unknown codes fall back to the field default. */
export function mapFieldErrors(codes: Record<string, string>): FieldErrors {
  const out: FieldErrors = {};
  const fallback = { name: E.name, email: E.email, message: E.message } as const;
  for (const field of ['name', 'email', 'message'] as const) {
    const code = codes[field];
    if (code) out[field] = CODE_TO_TEXT[code as ContactCode] ?? fallback[field];
  }
  return out;
}

export function ContactForm() {
  const uid = useId();
  const [errors, setErrors] = useState<FieldErrors>({});
  const [status, setStatus] = useState<Status>({ kind: 'idle' });
  const sending = status.kind === 'sending';

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (sending) return;
    const form = event.currentTarget;
    const data = new FormData(form);
    const input = {
      name: String(data.get('name') ?? ''),
      email: String(data.get('email') ?? ''),
      message: String(data.get('message') ?? ''),
      company: String(data.get('company') ?? ''),
    };

    const found = checkContact(input);
    if (Object.keys(found).length > 0) {
      setErrors(mapFieldErrors(found));
      setStatus({ kind: 'idle' });
      return;
    }
    setErrors({});
    setStatus({ kind: 'sending' });

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      });
      if (res.ok) {
        form.reset();
        setStatus({ kind: 'success' });
        return;
      }
      if (res.status === 400) {
        const body = (await res.json().catch(() => null)) as { errors?: Record<string, string> } | null;
        if (body?.errors) {
          setErrors(mapFieldErrors(body.errors));
          setStatus({ kind: 'idle' });
          return;
        }
      }
      setStatus({ kind: 'error', text: res.status === 429 ? E.rateLimit : E.generic });
    } catch {
      setStatus({ kind: 'error', text: E.generic });
    }
  }

  const ids = {
    name: `${uid}-name`,
    email: `${uid}-email`,
    message: `${uid}-message`,
  };

  return (
    <form onSubmit={onSubmit} noValidate className="relative grid gap-5" aria-label={copy.contact.formTitle}>
      <div className="grid gap-2">
        <label htmlFor={ids.name} className={labelClass}>
          {copy.contact.labels.name}
        </label>
        <input
          id={ids.name}
          name="name"
          type="text"
          required
          maxLength={80}
          autoComplete="name"
          placeholder={copy.contact.placeholders.name}
          aria-invalid={errors.name ? true : undefined}
          aria-describedby={errors.name ? `${ids.name}-error` : undefined}
          className={fieldClass(Boolean(errors.name), 'h-12')}
        />
        {errors.name ? (
          <p id={`${ids.name}-error`} className={errorClass}>
            {errors.name}
          </p>
        ) : null}
      </div>

      <div className="grid gap-2">
        <label htmlFor={ids.email} className={labelClass}>
          {copy.contact.labels.email}
        </label>
        <input
          id={ids.email}
          name="email"
          type="email"
          required
          maxLength={254}
          autoComplete="email"
          placeholder={copy.contact.placeholders.email}
          aria-invalid={errors.email ? true : undefined}
          aria-describedby={errors.email ? `${ids.email}-error` : undefined}
          className={fieldClass(Boolean(errors.email), 'h-12')}
        />
        {errors.email ? (
          <p id={`${ids.email}-error`} className={errorClass}>
            {errors.email}
          </p>
        ) : null}
      </div>

      <div className="grid gap-2">
        <label htmlFor={ids.message} className={labelClass}>
          {copy.contact.labels.message}
        </label>
        <textarea
          id={ids.message}
          name="message"
          required
          rows={5}
          maxLength={2100}
          placeholder={copy.contact.placeholders.message}
          aria-invalid={errors.message ? true : undefined}
          aria-describedby={errors.message ? `${ids.message}-error` : undefined}
          className={fieldClass(Boolean(errors.message), 'resize-y py-3')}
        />
        {errors.message ? (
          <p id={`${ids.message}-error`} className={errorClass}>
            {errors.message}
          </p>
        ) : null}
      </div>

      <div className={honeypotClass} aria-hidden="true">
        <label htmlFor={`${uid}-company`}>Company</label>
        <input id={`${uid}-company`} name="company" type="text" tabIndex={-1} autoComplete="off" defaultValue="" />
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <Button type="submit" aria-busy={sending} disabled={sending}>
          {sending ? copy.contact.sending : copy.contact.submit}
        </Button>
        <p
          role="status"
          className={['text-[14px]', status.kind === 'error' ? 'text-danger' : 'text-text-muted'].join(' ')}
        >
          {status.kind === 'success' ? copy.contact.success : null}
          {status.kind === 'error' ? status.text : null}
        </p>
      </div>
    </form>
  );
}
