/** Disabled-with-reason action, e.g. "Sem demo no ar", "Repositório privado". */
export function UnavailableAction({ children, className }: { children: string; className?: string }) {
  return (
    <button
      type="button"
      disabled
      aria-disabled="true"
      className={[
        'inline-flex min-h-[52px] md:min-h-12 cursor-not-allowed items-center justify-center rounded-full',
        'border border-dashed border-line-strong-hover px-6 text-[15px] font-bold text-text-subtle',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {children}
    </button>
  );
}
