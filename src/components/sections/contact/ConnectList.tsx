import { Icon } from '@/components/ui/Icon';
import { copy } from '@/lib/copy';
import type { Profile } from '@/lib/content/schemas';

type ConnectEntry = Profile['connect'][number];

const KINDS: ReadonlyArray<ConnectEntry['kind']> = ['linkedin', 'github', 'site', 'email'];

/** Only LinkedIn, GitHub, the Enz Softwares site and e-mail. No phone, no WhatsApp. */
export function selectConnectEntries(connect: Profile['connect']): ConnectEntry[] {
  return KINDS.flatMap((kind) => connect.filter((entry) => entry.kind === kind).slice(0, 1));
}

export function ConnectList({ connect }: { connect: Profile['connect'] }) {
  const entries = selectConnectEntries(connect);
  return (
    <div>
      <h3 className="font-mono text-xs uppercase tracking-[0.2em] text-accent">{copy.contact.connectHeading}</h3>
      <ul className="mt-4 grid gap-3">
        {entries.map((entry) => {
          const isMail = entry.kind === 'email';
          return (
            <li key={entry.kind}>
              <a
                href={entry.url}
                {...(isMail ? {} : { target: '_blank', rel: 'noopener noreferrer' })}
                className="glass flex min-h-12 items-center justify-between gap-3 rounded-tile px-4 py-3 transition-colors duration-[180ms] ease-micro hover:border-line-strong-hover"
              >
                <span className="grid">
                  <span className="text-[15px] font-bold text-text">{entry.label}</span>
                  <span className="font-mono text-xs text-text-muted">{entry.display}</span>
                </span>
                <Icon name={isMail ? 'mail' : 'arrow-up-right'} size={18} className="shrink-0 text-accent" />
              </a>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
