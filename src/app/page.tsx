import { AboutSection } from '@/components/sections/about/AboutSection';
import { ContactSection } from '@/components/sections/contact/ContactSection';
import { HeroSection } from '@/components/sections/hero/HeroSection';
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
import { PersonJsonLd } from '@/lib/seo/jsonld';

export default async function Page() {
  const [profile, experience, stack, projects, certificates] = await Promise.all([
    getProfile(),
    getExperience(),
    getStack(),
    getProjects(),
    getCertificates(),
  ]);
  const stats = computeStats({ projects, certificates, experience });

  return (
    <>
      <PersonJsonLd profile={profile} stack={stack} />
      <HeroSection profile={profile} />
      <AboutSection profile={profile} stats={stats} />
      <PortfolioSection projects={projects} certificates={certificates} stack={stack} />
      <ContactSection profile={profile} commentsEnabled={commentsEnabled()} />
    </>
  );
}
