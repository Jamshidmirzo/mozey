'use client';

import { useTranslations } from 'next-intl';
import { DashboardShell } from '@/components/layout/dashboard-shell';
import { AuditTable } from '@/components/audit-log/audit-table';

export default function AuditLogPage() {
  const t = useTranslations('auditLog');

  return (
    <DashboardShell title={t('title')} description={t('subtitle')}>
      <AuditTable />
    </DashboardShell>
  );
}
