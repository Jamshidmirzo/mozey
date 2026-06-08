'use client';

import { useTranslations } from 'next-intl';
import { DashboardShell } from '@/components/layout/dashboard-shell';
import { RegionForm } from '@/components/regions/region-form';

export default function NewRegionPage() {
  const t = useTranslations('regions');

  return (
    <DashboardShell title={t('createRegion')}>
      <RegionForm />
    </DashboardShell>
  );
}
