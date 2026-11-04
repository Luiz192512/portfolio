import 'server-only';
import { Resend } from 'resend';
import { getContactEnv } from '@/lib/env';
import { sanitizeHeaderText } from '@/lib/security/sanitize';

export type SendResult = { ok: true } | { ok: false; code: 'not_configured' | 'send_failed'; errorName?: string };

/** Sends a plain-text message only (no HTML body, so no HTML injection). */
async function sendText(args: { subject: string; text: string; replyTo?: string }): Promise<SendResult> {
  const env = getContactEnv();
  if (!env) return { ok: false, code: 'not_configured' };
  try {
    const client = new Resend(env.RESEND_API_KEY);
    const { error } = await client.emails.send({
      from: env.CONTACT_FROM_EMAIL,
      to: env.CONTACT_TO_EMAIL,
      ...(args.replyTo ? { replyTo: args.replyTo } : {}),
      subject: args.subject,
      text: args.text,
    });
    // Log only the error name. Never the body, address, IP or env values.
    if (error) return { ok: false, code: 'send_failed', errorName: error.name };
    return { ok: true };
  } catch (err) {
    return { ok: false, code: 'send_failed', errorName: err instanceof Error ? err.name : 'unknown' };
  }
}

export function sendContactEmail(input: { name: string; email: string; message: string }): Promise<SendResult> {
  return sendText({
    subject: sanitizeHeaderText(`Portfolio: mensagem de ${input.name}`),
    replyTo: input.email,
    text: `Nome: ${sanitizeHeaderText(input.name, 80)}\nE-mail: ${input.email}\n\n${input.message}`,
  });
}

export function sendCommentNotification(input: { id: string; name: string; body: string }): Promise<SendResult> {
  return sendText({
    subject: sanitizeHeaderText(`Portfolio: novo comentário de ${input.name}`),
    text: [
      `Nome: ${sanitizeHeaderText(input.name, 40)}`,
      '',
      input.body,
      '',
      `id: ${input.id}`,
      '',
      `UPDATE comments SET status = 'approved', moderated_at = now() WHERE id = '${input.id}';`,
      `UPDATE comments SET pinned = true WHERE id = '${input.id}';`,
    ].join('\n'),
  });
}
