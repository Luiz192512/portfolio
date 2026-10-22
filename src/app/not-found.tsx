import { ButtonLink } from '@/components/ui/Button';
import { copy } from '@/lib/copy';

export default function NotFound() {
  return (
    <section className="mx-auto flex min-h-[70vh] max-w-3xl flex-col items-start justify-center gap-6 px-4 py-24 md:px-8">
      <p className="font-mono text-sm text-accent">404</p>
      <h1 className="text-4xl font-extrabold text-text md:text-6xl">{copy.notFound.title}</h1>
      <p className="text-lg text-text-muted">{copy.notFound.text}</p>
      <ButtonLink href="/" internal>
        {copy.notFound.action}
      </ButtonLink>
    </section>
  );
}
