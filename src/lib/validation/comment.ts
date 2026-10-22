import { z } from 'zod';
import { sanitizeSingleLine, sanitizeText } from '@/lib/security/sanitize';

const NAME_PATTERN = /^[\p{L}\p{M}\p{N} .'_-]+$/u;

export const CommentInput = z.strictObject({
  name: z
    .string()
    .transform(sanitizeSingleLine)
    .pipe(
      z
        .string()
        .min(1, 'name_required')
        .max(40, 'name_too_long')
        .regex(NAME_PATTERN, 'name_invalid'),
    ),
  body: z
    .string()
    .transform(sanitizeText)
    .pipe(z.string().min(1, 'body_required').max(500, 'body_too_long')),
  // Honeypot and timing field, handled by the route before validation.
  website: z.string().optional(),
  startedAt: z.number().optional(),
});

export type CommentInputType = z.infer<typeof CommentInput>;

export type CommentErrorCode =
  | 'name_required'
  | 'name_too_long'
  | 'name_invalid'
  | 'body_required'
  | 'body_too_long';

/** pt-BR messages (architecture 12.2). */
export const commentMessages: Record<CommentErrorCode, string> = {
  name_required: 'Preencha seu nome.',
  name_too_long: 'O nome passou de 40 caracteres.',
  name_invalid: 'Use só letras, números e espaços no nome.',
  body_required: 'Escreva um comentário.',
  body_too_long: 'O comentário passou de 500 caracteres.',
};

export const commentPendingMessage = 'Comentário recebido. Ele aparece aqui depois de aprovado.';
export const commentPublishErrorMessage = 'Não foi possível publicar agora. Tente de novo mais tarde.';
export const commentLoadErrorMessage = 'Não foi possível carregar os comentários.';

/** Honeypot filled, or form submitted in under 3 s: silently drop (route returns 202). */
export function looksLikeBot(
  input: { website?: unknown; startedAt?: unknown },
  now: number = Date.now(),
): boolean {
  if (typeof input.website === 'string' && input.website.length > 0) return true;
  if (typeof input.startedAt !== 'number' || !Number.isFinite(input.startedAt)) return true;
  return now - input.startedAt < 3000;
}
