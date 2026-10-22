import type { Certificate, Experience, Project } from './schemas';

export type ContentStats = {
  projects: number;
  certificates: number;
  experiences: number;
  experienceSource: string;
};

export function computeStats(input: {
  projects: readonly Project[];
  certificates: readonly Certificate[];
  experience: readonly Experience[];
}): ContentStats {
  return {
    projects: input.projects.length,
    certificates: input.certificates.length,
    experiences: input.experience.length,
    experienceSource: input.experience.map((e) => e.short).join(', '),
  };
}
