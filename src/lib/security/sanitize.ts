/**
 * Plain-text sanitization (architecture 6.4). Output is stored as plain text and
 * escaped at render time by React text nodes. No HTML escaping on write.
 */

// C0 and C1 controls except \n (\r is normalized to \n first).
const CONTROL = /[\u0000-\u0009\u000B-\u001F\u007F-\u009F]/g;
// Bidi embeddings, overrides and isolates, plus zero-width characters.
const INVISIBLE = /[‪-‮⁦-⁩​-‍⁠﻿]/g;

export function sanitizeText(input: string): string {
  return input
    .normalize('NFC')
    .replace(/\r\n?/g, '\n')
    .replace(CONTROL, '')
    .replace(INVISIBLE, '')
    .replace(/[^\S\n]+/g, ' ')
    .replace(/ ?\n ?/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

/** Single-line variant (names): newlines become spaces. */
export function sanitizeSingleLine(input: string): string {
  return sanitizeText(input.replace(/[\r\n]+/g, ' '));
}

/** Header-safe text for e-mail subjects: no CR, LF or control chars, capped. */
export function sanitizeHeaderText(input: string, max = 120): string {
  return input
    .normalize('NFC')
    .replace(/[\u0000-\u001F\u007F-\u009F]/g, ' ')
    .replace(INVISIBLE, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, max);
}
