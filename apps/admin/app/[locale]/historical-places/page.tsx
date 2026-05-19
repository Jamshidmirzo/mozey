'use client';

import { useTranslations } from 'next-intl';
import { Plus } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { ROUTES } from '@/lib/constants';
import { DashboardShell } from '@/components/layout/dashboard-shell';
import { Button } from '@/components/ui/button';
import { PlaceTable } from '@/components/historical-places/place-table';

export default function HistoricalPlacesPage() {
  const t = useTranslations('historicalPlaces');

  return (
    <DashboardShell
      title={t('title')}
      description={t('subtitle')}
      headerActions={
        <Button asChild>
          <Link href={ROUTES.HISTORICAL_PLACE_NEW}>
            <Plus className="mr-2 h-4 w-4" />
            {t('addPlace')}
          </Link>
        </Button>
      }
    >
      <PlaceTable />
    </DashboardShell>
  );
}
