import { AboutSection } from '@/components/sections/about/AboutSection';
import { ContactSection } from '@/components/sections/contact/ContactSection';
import { HeroSection } from '@/components/sections/hero/HeroSection';
import { TechMarquee } from '@/components/sections/hero/TechMarquee';
import { PortfolioSection } from '@/components/sections/portfolio/PortfolioSection';
import {
  getCertificates,
  getExperience,
  getProfile,
  getProjects,
  getStack,
} from '@/lib/content/load';
import { computeStats } from '@/lib/content/stats';
import { commentsEnabled } from '@/lib/env';
import { getLocale } from '@/lib/i18n/server';
import { PersonJsonLd } from '@/lib/seo/jsonld';

export default async function Page() {
  const locale = await getLocale();
  const [profile, experience, stack, projects, certificates] = await Promise.all([
    getProfile(locale),
    getExperience(locale),
    getStack(),
    getProjects(locale),
    getCertificates(),
  ]);
  const marqueeItems = stack
    .filter((g) => ['languages', 'frontend-mobile', 'backend'].includes(g.category))
    .flatMap((g) => g.items.map((i) => i.name));
  const stats = computeStats({ projects, certificates, experience });

  return (
    <>
      <PersonJsonLd profile={profile} stack={stack} />
      <HeroSection profile={profile} />
      <TechMarquee items={marqueeItems} />
      <AboutSection profile={profile} stats={stats} />
      <PortfolioSection projects={projects} certificates={certificates} stack={stack} />
      <ContactSection profile={profile} commentsEnabled={commentsEnabled()} />
    </>
  );
}
