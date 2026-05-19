'use client';

import { useTranslations } from 'next-intl';
import { useMuseum } from '@/lib/hooks/use-museums';
import { DashboardShell } from '@/components/layout/dashboard-shell';
import { MuseumForm } from '@/components/museums/museum-form';
import { Skeleton } from '@/components/ui/skeleton';

interface EditMuseumPageProps {
  params: { id: string };
}

export default function EditMuseumPage({ params }: EditMuseumPageProps) {
  const t = useTranslations('museums');
  const { data: museum, isLoading, error } = useMuseum(params.id);

  return (
    <DashboardShell title={t('editMuseum')}>
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
      {museum && <MuseumForm museum={museum} />}
    </DashboardShell>
  );
}
