import { CommentsPanel } from '@/components/comments/CommentsPanel';
import { GlassPanel } from '@/components/ui/GlassPanel';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { copy } from '@/lib/copy';
import type { Profile } from '@/lib/content/schemas';
import { ConnectList } from './ConnectList';
import { ContactForm } from './ContactForm';

type ContactSectionProps = {
  profile: Profile;
  commentsEnabled: boolean;
};

export function ContactSection({ profile, commentsEnabled }: ContactSectionProps) {
  return (
    <section
      id="contato"
      aria-labelledby="contato-title"
      data-comments={commentsEnabled ? 'on' : 'off'}
      className="container-content section-pad"
    >
      <SectionHeading
        id="contato-title"
        eyebrow={copy.contact.eyebrow}
        title={copy.contact.title}
        intro={copy.contact.intro}
      />
      <div className="mt-10 flex flex-wrap items-start gap-6">
        {/* Without comments the card spans the full row; with them it shares it. */}
        <GlassPanel
          radius="panel"
          className={[
            'grid gap-8 p-6 md:p-8',
            commentsEnabled ? 'min-w-0 flex-[1_1_480px]' : 'w-full',
          ].join(' ')}
        >
          <div className="grid gap-5">
            <h3 className="text-[22px] font-bold leading-[1.15] tracking-[-0.02em]">
              {copy.contact.formTitle}
            </h3>
            <ContactForm />
          </div>
          <ConnectList connect={profile.connect} />
        </GlassPanel>
        {commentsEnabled ? <CommentsPanel /> : null}
      </div>
    </section>
  );
}
