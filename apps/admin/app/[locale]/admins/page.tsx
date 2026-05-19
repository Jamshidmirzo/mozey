'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Plus } from 'lucide-react';
import { DashboardShell } from '@/components/layout/dashboard-shell';
import { Button } from '@/components/ui/button';
import { AdminTable } from '@/components/admins/admin-table';
import { AdminForm } from '@/components/admins/admin-form';

export default function AdminsPage() {
  const t = useTranslations('admins');
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  return (
    <DashboardShell
      title={t('title')}
      description={t('subtitle')}
      headerActions={
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="mr-2 h-4 w-4" />
          {t('addAdmin')}
        </Button>
      }
    >
      <AdminTable />
      <AdminForm
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
      />
    </DashboardShell>
  );
}
