'use client';

import { useTranslations } from 'next-intl';
import { DashboardShell } from '@/components/layout/dashboard-shell';
import { MuseumForm } from '@/components/museums/museum-form';

export default function NewMuseumPage() {
  const t = useTranslations('museums');

  return (
    <DashboardShell title={t('createMuseum')}>
      <MuseumForm />
    </DashboardShell>
  );
}
