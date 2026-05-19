'use client';

import { useTranslations } from 'next-intl';
import { Plus } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { ROUTES } from '@/lib/constants';
import { DashboardShell } from '@/components/layout/dashboard-shell';
import { Button } from '@/components/ui/button';
import { MuseumTable } from '@/components/museums/museum-table';

export default function MuseumsPage() {
  const t = useTranslations('museums');

  return (
    <DashboardShell
      title={t('title')}
      description={t('subtitle')}
      headerActions={
        <Button asChild>
          <Link href={ROUTES.MUSEUM_NEW}>
            <Plus className="mr-2 h-4 w-4" />
            {t('addMuseum')}
          </Link>
        </Button>
      }
    >
      <MuseumTable />
    </DashboardShell>
  );
}
