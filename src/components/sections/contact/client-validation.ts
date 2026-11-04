/**
 * Light client-side checks in plain TypeScript (no zod in the client bundle).
 * The route handlers stay authoritative and use the zod schemas.
 */
import { sanitizeSingleLine, sanitizeText } from '@/lib/security/sanitize';

export type ContactCode =
  | 'name_required'
  | 'name_too_long'
  | 'email_invalid'
  | 'message_required'
  | 'message_too_short'
  | 'message_too_long';

export type CommentCode =
  | 'name_required'
  | 'name_too_long'
  | 'name_invalid'
  | 'body_required'
  | 'body_too_long';

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const NAME_PATTERN = /^[\p{L}\p{M}\p{N} .'_-]+$/u;

export function checkContact(input: { name: string; email: string; message: string }): Record<string, string> {
  const errors: Record<string, string> = {};
  const name = input.name.trim();
  if (name.length < 1) errors.name = 'name_required';
  else if (name.length > 80) errors.name = 'name_too_long';
  const email = input.email.trim();
  if (!EMAIL.test(email) || email.length > 254) errors.email = 'email_invalid';
  const message = input.message.trim();
  if (message.length < 1) errors.message = 'message_required';
  else if (message.length < 10) errors.message = 'message_too_short';
  else if (message.length > 2000) errors.message = 'message_too_long';
  return errors;
}

export function checkComment(input: { name: string; body: string }): Record<string, string> {
  const errors: Record<string, string> = {};
  const name = sanitizeSingleLine(input.name);
  if (name.length < 1) errors.name = 'name_required';
  else if (name.length > 40) errors.name = 'name_too_long';
  else if (!NAME_PATTERN.test(name)) errors.name = 'name_invalid';
  const body = sanitizeText(input.body);
  if (body.length < 1) errors.body = 'body_required';
  else if (body.length > 500) errors.body = 'body_too_long';
  return errors;
}
