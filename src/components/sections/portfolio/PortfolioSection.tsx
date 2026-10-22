import { SectionHeading } from '@/components/ui/SectionHeading';
import { copy } from '@/lib/copy';
import type { Certificate, Project, StackGroup } from '@/lib/content/schemas';
import { CertificateGrid } from './CertificateGrid';
import { ProjectCard } from './ProjectCard';
import { ProjectGrid } from './ProjectGrid';
import { TabsList, TabsPanel, TabsRoot, TabsTab } from './Tabs';
import { TechStackGrid } from './TechStackGrid';

type PortfolioSectionProps = {
  projects: readonly Project[];
  certificates: readonly Certificate[];
  stack: readonly StackGroup[];
};

function CertificateCard({ certificate }: { certificate: Certificate }) {
  return (
    <article className="glass flex w-full flex-col gap-2 rounded-card p-6">
      <p className="font-mono text-[11px] tracking-[0.12em] text-text-subtle uppercase">{certificate.issuer}</p>
      <h3 className="text-xl leading-tight font-bold">{certificate.title}</h3>
      <p className="font-mono text-xs text-text-muted">{certificate.date}</p>
    </article>
  );
}

export function PortfolioSection({ projects, certificates, stack }: PortfolioSectionProps) {
  const t = copy.portfolio;
  return (
    <section id="portfolio" aria-labelledby="portfolio-title" className="container-content section-pad">
      <SectionHeading id="portfolio-title" eyebrow={t.eyebrow} title={t.title} intro={t.intro} />
      <div className="mt-10">
        <TabsRoot defaultValue="projects">
          <TabsList label={t.tabsLabel}>
            <TabsTab value="projects">{t.tabs.projects}</TabsTab>
            <TabsTab value="certificates">{t.tabs.certificates}</TabsTab>
            <TabsTab value="stack">
              <span className="sr-only">{t.tabs.stack}</span>
              <span aria-hidden="true">
                <span className="max-sm:hidden">{t.tabs.stack}</span>
                <span className="sm:hidden">{t.tabs.stackShort}</span>
              </span>
            </TabsTab>
          </TabsList>
          <TabsPanel value="projects">
            <ProjectGrid items={projects.map((p) => <ProjectCard key={p.slug} project={p} />)} />
          </TabsPanel>
          <TabsPanel value="certificates">
            <CertificateGrid items={certificates.map((c) => <CertificateCard key={c.slug} certificate={c} />)} />
          </TabsPanel>
          <TabsPanel value="stack">
            <TechStackGrid stack={stack} />
          </TabsPanel>
        </TabsRoot>
      </div>
    </section>
  );
}
