'use client';

import { useTranslations } from 'next-intl';
import { useRegion } from '@/lib/hooks/use-regions';
import { DashboardShell } from '@/components/layout/dashboard-shell';
import { RegionForm } from '@/components/regions/region-form';
import { Skeleton } from '@/components/ui/skeleton';

interface EditRegionPageProps {
  params: { id: string };
}

export default function EditRegionPage({ params }: EditRegionPageProps) {
  const t = useTranslations('regions');
  const { data: region, isLoading, error } = useRegion(params.id);

  return (
    <DashboardShell title={t('editRegion')}>
      {isLoading && (
        <div className="space-y-6">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-[300px] w-full" />
        </div>
      )}
      {error && (
        <div className="rounded-md bg-destructive/10 p-4 text-sm text-destructive">
          {(error as Error).message}
        </div>
      )}
      {region && <RegionForm region={region} />}
    </DashboardShell>
  );
}
