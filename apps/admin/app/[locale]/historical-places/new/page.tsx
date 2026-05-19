'use client';

import { useTranslations } from 'next-intl';
import { DashboardShell } from '@/components/layout/dashboard-shell';
import { PlaceForm } from '@/components/historical-places/place-form';

export default function NewHistoricalPlacePage() {
  const t = useTranslations('historicalPlaces');

  return (
    <DashboardShell title={t('createPlace')}>
      <PlaceForm />
    </DashboardShell>
  );
}
