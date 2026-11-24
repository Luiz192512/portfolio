import type { Project } from '@/lib/content/schemas';

/** Page-local strings for detail notes (the shared copy deck has no keys for them). */
export const projectNotes = {
  pt: { client: 'Trabalho feito para um cliente.', demoData: 'Os dados da demonstração são fictícios.' },
  en: { client: 'Work done for a client.', demoData: 'The demo data is fictional.' },
} as const;

export function isClientWork(project: Pick<Project, 'kind'>): boolean {
  return /^CLIENT(E|)/i.test(project.kind);
}

export function hasDemoDataNote(project: Pick<Project, 'summary'>): boolean {
  return /fictíci|fictional/i.test(project.summary);
}
