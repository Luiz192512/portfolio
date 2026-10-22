import { copy } from '@/lib/copy';
import type { StackGroup } from '@/lib/content/schemas';

export function TechStackGrid({ stack }: { stack: readonly StackGroup[] }) {
  return (
    <div className="grid gap-8">
      {stack.map((group) => (
        <section key={group.category} aria-label={copy.portfolio.stackGroups[group.category]}>
          <h3 className="mb-3 font-mono text-xs tracking-[0.16em] text-text-muted uppercase">
            {copy.portfolio.stackGroups[group.category]}
          </h3>
          <ul className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
            {group.items.map((item) => (
              <li key={item.name} className="glass flex min-h-11 items-center gap-3 rounded-tile px-3 py-2">
                <span
                  aria-hidden="true"
                  className="inline-flex size-8 shrink-0 items-center justify-center rounded-lg bg-accent/12 font-mono text-xs text-accent"
                >
                  {item.monogram}
                </span>
                <span className="text-[15px] font-semibold">{item.name}</span>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
