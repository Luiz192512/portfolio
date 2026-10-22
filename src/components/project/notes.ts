import type { Project } from '@/lib/content/schemas';

/** Page-local pt-BR strings for detail notes (the shared copy deck has no keys for them). */
export const projectNotes = {
  client: 'Trabalho feito para um cliente.',
  demoData: 'Os dados da demonstração são fictícios.',
} as const;

export function isClientWork(project: Pick<Project, 'kind'>): boolean {
  return /^CLIENTE/i.test(project.kind);
}

export function hasDemoDataNote(project: Pick<Project, 'summary'>): boolean {
  return /fictíci/i.test(project.summary);
}
