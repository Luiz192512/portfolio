import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import type { Profile } from '@/lib/content/schemas';
import { ConnectList, selectConnectEntries } from './ConnectList';
import { checkContact } from './client-validation';
import { mapFieldErrors } from './ContactForm';

const connect = [
  { kind: 'linkedin', label: 'LinkedIn', display: 'in/x', url: 'https://linkedin.com/in/x', personal: true },
  { kind: 'github', label: 'GitHub', display: 'x', url: 'https://github.com/x', personal: true },
  { kind: 'instagram', label: 'Instagram', display: '@x', url: 'https://instagram.com/x', personal: false },
  { kind: 'site', label: 'Enz Softwares', display: 'enzsoftwares.com', url: 'https://enzsoftwares.com', personal: false },
  { kind: 'email', label: 'E-mail', display: 'a@b.c', url: 'mailto:a@b.c', personal: true },
] as Profile['connect'];

describe('contact section parts', () => {
  it('lists only LinkedIn, GitHub, site and e-mail', () => {
    expect(selectConnectEntries(connect).map((e) => e.kind)).toEqual(['linkedin', 'github', 'site', 'email']);
    const html = renderToStaticMarkup(createElement(ConnectList, { connect }));
    expect(html).toContain('mailto:a@b.c');
    expect(html).not.toMatch(/tel:|wa\.me|whatsapp|instagram/i);
  });

  it('maps validation codes to pt-BR copy', () => {
    expect(mapFieldErrors({ name: 'name_required', email: 'email_invalid', message: 'message_too_short' })).toEqual({
      name: 'Preencha seu nome.',
      email: 'Informe um e-mail válido.',
      message: 'Escreva pelo menos 10 caracteres.',
    });
  });

  it('reports an empty message as required, a short one as too short', () => {
    const base = { name: 'Ana', email: 'ana@example.com' };
    expect(checkContact({ ...base, message: '' }).message).toBe('message_required');
    expect(checkContact({ ...base, message: '   ' }).message).toBe('message_required');
    expect(checkContact({ ...base, message: 'curta' }).message).toBe('message_too_short');
    expect(mapFieldErrors(checkContact({ ...base, message: '' })).message).toBe('Escreva uma mensagem.');
  });
});
