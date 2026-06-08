'use client';

import { useTranslations } from 'next-intl';
import { Plus } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { ROUTES } from '@/lib/constants';
import { DashboardShell } from '@/components/layout/dashboard-shell';
import { Button } from '@/components/ui/button';
import { RegionTable } from '@/components/regions/region-table';

export default function RegionsPage() {
  const t = useTranslations('regions');

  return (
    <DashboardShell
      title={t('title')}
      description={t('subtitle')}
      headerActions={
        <Button asChild>
          <Link href={ROUTES.REGION_NEW}>
            <Plus className="mr-2 h-4 w-4" />
            {t('addRegion')}
          </Link>
        </Button>
      }
    >
      <RegionTable />
    </DashboardShell>
  );
}
