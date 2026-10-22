import { describe, expect, it } from 'vitest';
import { CommentInput, commentMessages, looksLikeBot } from './comment';
import { ContactInput, contactMessages, toFieldErrors } from './contact';

const validContact = { name: 'Ana', email: 'ana@example.com', message: 'Olá, quero conversar.' };

describe('ContactInput', () => {
  it('accepts valid input and trims', () => {
    const r = ContactInput.safeParse({ ...validContact, name: '  Ana  ' });
    expect(r.success && r.data.name).toBe('Ana');
  });

  it('maps field errors to codes', () => {
    const r = ContactInput.safeParse({ name: '   ', email: 'nope', message: 'curta' });
    expect(r.success).toBe(false);
    if (!r.success) {
      expect(toFieldErrors(r.error)).toEqual({
        name: 'name_required',
        email: 'email_invalid',
        message: 'message_too_short',
      });
    }
  });

  it('reports an empty message as message_required', () => {
    for (const message of ['', '   ']) {
      const r = ContactInput.safeParse({ ...validContact, message });
      expect(!r.success && toFieldErrors(r.error).message).toBe('message_required');
    }
    expect(contactMessages.message_required).toBe('Escreva uma mensagem.');
  });

  it('enforces length boundaries', () => {
    expect(ContactInput.safeParse({ ...validContact, message: 'a'.repeat(10) }).success).toBe(true);
    expect(ContactInput.safeParse({ ...validContact, message: 'a'.repeat(9) }).success).toBe(false);
    expect(ContactInput.safeParse({ ...validContact, message: 'a'.repeat(2000) }).success).toBe(true);
    const long = ContactInput.safeParse({ ...validContact, message: 'a'.repeat(2001) });
    expect(!long.success && toFieldErrors(long.error).message).toBe('message_too_long');
    expect(ContactInput.safeParse({ ...validContact, name: 'a'.repeat(81) }).success).toBe(false);
  });

  it('rejects unknown keys and a filled honeypot', () => {
    expect(ContactInput.safeParse({ ...validContact, extra: 1 }).success).toBe(false);
    expect(ContactInput.safeParse({ ...validContact, company: 'Acme' }).success).toBe(false);
    expect(ContactInput.safeParse({ ...validContact, company: '' }).success).toBe(true);
  });

  it('has pt-BR messages for every code', () => {
    expect(contactMessages.message_too_short).toBe('Escreva pelo menos 10 caracteres.');
    expect(contactMessages.message_too_long).toBe('A mensagem passou de 2000 caracteres.');
  });
});

describe('CommentInput', () => {
  const ok = { name: 'José da Silva', body: 'Ótimo portfólio!' };

  it('accepts unicode names', () => {
    expect(CommentInput.safeParse(ok).success).toBe(true);
    expect(CommentInput.safeParse({ ...ok, name: "O'Brien-Ünal_2" }).success).toBe(true);
  });

  it('rejects an HTML payload as name', () => {
    const r = CommentInput.safeParse({ ...ok, name: '<img src=x onerror=alert(1)>' });
    expect(r.success).toBe(false);
    if (!r.success) expect(toFieldErrors(r.error).name).toBe('name_invalid');
  });

  it('keeps an HTML payload in the body as inert plain text', () => {
    const r = CommentInput.safeParse({ ...ok, body: '<img src=x onerror=alert(1)>' });
    expect(r.success && r.data.body).toBe('<img src=x onerror=alert(1)>');
  });

  it('sanitizes before measuring length', () => {
    const r = CommentInput.safeParse({ ...ok, body: '​‮   ' });
    expect(!r.success && toFieldErrors(r.error).body).toBe('body_required');
    expect(CommentInput.safeParse({ ...ok, body: 'a​'.repeat(500) }).success).toBe(true);
    expect(CommentInput.safeParse({ ...ok, body: 'a'.repeat(501) }).success).toBe(false);
  });

  it('enforces name length 1 to 40 and rejects empty', () => {
    expect(CommentInput.safeParse({ ...ok, name: 'a'.repeat(40) }).success).toBe(true);
    expect(CommentInput.safeParse({ ...ok, name: 'a'.repeat(41) }).success).toBe(false);
    expect(CommentInput.safeParse({ ...ok, name: '' }).success).toBe(false);
  });

  it('has the pt-BR messages from the doc', () => {
    expect(commentMessages.name_invalid).toBe('Use só letras, números e espaços no nome.');
    expect(commentMessages.body_too_long).toBe('O comentário passou de 500 caracteres.');
  });
});

describe('looksLikeBot', () => {
  it('flags honeypot, missing or too-recent startedAt', () => {
    const now = 100_000;
    expect(looksLikeBot({ website: 'x', startedAt: 0 }, now)).toBe(true);
    expect(looksLikeBot({ startedAt: now - 2999 }, now)).toBe(true);
    expect(looksLikeBot({}, now)).toBe(true);
    expect(looksLikeBot({ website: '', startedAt: now - 3000 }, now)).toBe(false);
  });
});
