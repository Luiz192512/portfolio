import { StatCard } from '@/components/ui/StatCard';
import { copy } from '@/lib/copy';
import type { ContentStats } from '@/lib/content/stats';

export function AboutStats({ stats }: { stats: ContentStats }) {
  return (
    <div className="mt-12 grid grid-cols-3 gap-3 md:gap-6">
      <StatCard
        icon="folder"
        value={stats.projects}
        label={copy.about.stats.projects.label}
        caption={copy.about.stats.projects.caption}
      />
      <StatCard
        icon="award"
        value={stats.certificates}
        label={copy.about.stats.certificates.label}
        caption={copy.about.stats.certificates.caption}
      />
      <StatCard
        icon="briefcase"
        value={stats.experiences}
        label={copy.about.stats.experiences.label}
        caption={stats.experienceSource}
      />
    </div>
  );
}
