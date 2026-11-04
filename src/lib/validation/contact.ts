import { z } from 'zod';

export const ContactInput = z.strictObject({
  name: z.string().trim().min(1, 'name_required').max(80, 'name_too_long'),
  email: z.email('email_invalid').max(254, 'email_invalid'),
  message: z
    .string()
    .trim()
    .min(1, 'message_required')
    .min(10, 'message_too_short')
    .max(2000, 'message_too_long'),
  // Honeypot: must stay empty. The route checks it before validation.
  company: z.string().max(0).optional(),
});

export type ContactInputType = z.infer<typeof ContactInput>;

export type ContactErrorCode =
  | 'name_required'
  | 'name_too_long'
  | 'email_invalid'
  | 'message_required'
  | 'message_too_short'
  | 'message_too_long';

/** pt-BR messages (architecture 12.2). The UI copy module may re-export these. */
export const contactMessages: Record<ContactErrorCode, string> = {
  name_required: 'Preencha seu nome.',
  name_too_long: 'O nome é longo demais.',
  email_invalid: 'Informe um e-mail válido.',
  message_required: 'Escreva uma mensagem.',
  message_too_short: 'Escreva pelo menos 10 caracteres.',
  message_too_long: 'A mensagem passou de 2000 caracteres.',
};

export const contactRateLimitMessage = 'Muitas mensagens seguidas. Tente de novo em alguns minutos.';

/** Maps a ZodError to `{ field: code }` (first issue per field). */
export function toFieldErrors(error: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const field = String(issue.path[0] ?? '_form');
    if (!(field in out)) out[field] = issue.message;
  }
  return out;
}
