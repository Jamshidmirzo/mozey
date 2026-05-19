'use client';

import { useTranslations } from 'next-intl';
import { useHistoricalPlace } from '@/lib/hooks/use-historical-places';
import { DashboardShell } from '@/components/layout/dashboard-shell';
import { PlaceForm } from '@/components/historical-places/place-form';
import { Skeleton } from '@/components/ui/skeleton';

interface EditPlacePageProps {
  params: { id: string };
}

export default function EditHistoricalPlacePage({ params }: EditPlacePageProps) {
  const t = useTranslations('historicalPlaces');
  const { data: place, isLoading, error } = useHistoricalPlace(params.id);

  return (
    <DashboardShell title={t('editPlace')}>
      {isLoading && (
        <div className="space-y-6">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-[400px] w-full" />
          <Skeleton className="h-[200px] w-full" />
        </div>
      )}
      {error && (
        <div className="rounded-md bg-destructive/10 p-4 text-sm text-destructive">
          {(error as Error).message}
        </div>
      )}
      {place && <PlaceForm place={place} />}
    </DashboardShell>
  );
}
