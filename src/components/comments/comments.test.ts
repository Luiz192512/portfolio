import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';

vi.mock('server-only', () => ({}));

import { avatarInitial, CommentItem } from './CommentItem';
import { CommentListBody } from './CommentList';
import { mapCommentErrors } from './CommentForm';

const XSS = '<img src=x onerror=alert(1)>';

describe('comments rendering', () => {
  it('renders the XSS fixture as escaped text, not as an element', () => {
    const html = renderToStaticMarkup(
      createElement(CommentItem, {
        comment: { id: '1', name: XSS, body: XSS, createdAt: '2026-01-02T12:00:00Z', pinned: false },
      }),
    );
    expect(html).not.toContain('<img');
    expect(html).toContain('&lt;img src=x onerror=alert(1)&gt;');
  });

  it('shows the pinned badge only for pinned comments', () => {
    const make = (pinned: boolean) =>
      renderToStaticMarkup(
        createElement(CommentItem, {
          comment: { id: '1', name: 'Ana', body: 'oi', createdAt: '2026-01-02T12:00:00Z', pinned },
        }),
      );
    expect(make(true)).toContain('FIXADO');
    expect(make(false)).not.toContain('FIXADO');
  });

  it('renders skeleton, empty and error states', () => {
    const skeleton = renderToStaticMarkup(createElement(CommentListBody, { state: { kind: 'loading' } }));
    expect(skeleton).toContain('Carregando comentários');
    const empty = renderToStaticMarkup(
      createElement(CommentListBody, { state: { kind: 'ready', total: 0, items: [] } }),
    );
    expect(empty).toContain('Nenhum comentário ainda');
    const error = renderToStaticMarkup(createElement(CommentListBody, { state: { kind: 'error' } }));
    expect(error).toContain('Não foi possível carregar os comentários.');
  });

  it('computes the avatar initial and maps error codes to copy', () => {
    expect(avatarInitial('ana')).toBe('A');
    expect(avatarInitial('  ')).toBe('?');
    expect(mapCommentErrors({ name: 'name_invalid', body: 'body_too_long' })).toEqual({
      name: 'Use só letras, números e espaços no nome.',
      body: 'O comentário passou de 500 caracteres.',
    });
  });
});
