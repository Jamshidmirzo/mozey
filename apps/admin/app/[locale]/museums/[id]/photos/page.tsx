'use client';

import { useTranslations } from 'next-intl';
import { ArrowLeft } from 'lucide-react';
import { useMuseum } from '@/lib/hooks/use-museums';
import { DashboardShell } from '@/components/layout/dashboard-shell';
import { PhotoUpload } from '@/components/museums/photo-upload';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Link } from '@/i18n/navigation';
import { ROUTES } from '@/lib/constants';
import { getLocalizedValue } from '@/lib/utils';
import { useLocale } from 'next-intl';

interface PhotosPageProps {
  params: { id: string };
}

export default function MuseumPhotosPage({ params }: PhotosPageProps) {
  const t = useTranslations();
  const locale = useLocale();
  const { data: museum, isLoading, error } = useMuseum(params.id);

  const museumName = museum ? getLocalizedValue(museum.name, locale) : '';

  return (
    <DashboardShell
      title={t('museums.managePhotos')}
      description={museumName}
      headerActions={
        <Button variant="outline" asChild>
          <Link href={ROUTES.MUSEUM_EDIT(params.id)}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            {t('common.back')}
          </Link>
        </Button>
      }
    >
      {isLoading && (
        <div className="space-y-4">
          <Skeleton className="h-8 w-64" />
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="aspect-square" />
            ))}
          </div>
        </div>
      )}
      {error && (
        <div className="rounded-md bg-destructive/10 p-4 text-sm text-destructive">
          {(error as Error).message}
        </div>
      )}
      {museum && (
        <PhotoUpload
          entityType="museum"
          entityId={museum.id}
          photos={museum.photos}
        />
      )}
    </DashboardShell>
  );
}
