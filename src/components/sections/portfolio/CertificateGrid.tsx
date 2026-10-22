'use client';

import type { ReactNode } from 'react';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { copy } from '@/lib/copy';
import { ProjectGrid } from './ProjectGrid';
import { useTabs } from './Tabs';

/** Cards arrive pre-rendered. With none, shows the empty state whose action selects the projects tab. */
export function CertificateGrid({ items }: { items: ReactNode[] }) {
  const { actions } = useTabs();
  if (items.length === 0) {
    return (
      <EmptyState
        icon="award"
        title={copy.portfolio.certificatesEmpty.title}
        text={copy.portfolio.certificatesEmpty.text}
        action={
          <Button variant="outline" onClick={() => actions.select('projects')}>
            {copy.portfolio.certificatesEmpty.action}
          </Button>
        }
      />
    );
  }
  return <ProjectGrid items={items} />;
}
