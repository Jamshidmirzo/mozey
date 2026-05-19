'use client';

import { useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { type ColumnDef } from '@tanstack/react-table';
import { Eye } from 'lucide-react';
import { DataTable } from '@/components/shared/data-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { useAuditLog } from '@/lib/hooks/use-audit-log';
import { formatDate } from '@/lib/utils';
import type { AuditLogEntry, AuditLogParams } from '@/lib/types';

function ActionBadge({ action }: { action: string }) {
  const variant = (() => {
    switch (action) {
      case 'create':
        return 'success' as const;
      case 'update':
        return 'warning' as const;
      case 'delete':
        return 'destructive' as const;
      case 'restore':
        return 'secondary' as const;
      default:
        return 'outline' as const;
    }
  })();
  return <Badge variant={variant}>{action}</Badge>;
}

export function AuditTable() {
  const t = useTranslations();
  const [params, setParams] = useState<AuditLogParams>({
    page: 1,
    limit: 20,
  });
  const [selectedEntry, setSelectedEntry] = useState<AuditLogEntry | null>(null);

  const { data, isLoading } = useAuditLog(params);

  const columns: ColumnDef<AuditLogEntry>[] = useMemo(
    () => [
      {
        accessorKey: 'admin',
        header: t('auditLog.admin'),
        cell: ({ row }) => (
          <span className="text-sm font-medium">
            {row.original.admin?.email || row.original.adminId.slice(0, 8)}
          </span>
        ),
      },
      {
        accessorKey: 'action',
        header: t('auditLog.action'),
        cell: ({ row }) => <ActionBadge action={row.original.action} />,
      },
      {
        accessorKey: 'entityType',
        header: t('auditLog.entityType'),
        cell: ({ row }) => {
          const type = row.original.entityType;
          return (
            <Badge variant="outline">
              {type === 'museum'
                ? t('auditLog.museum')
                : t('auditLog.historicalPlace')}
            </Badge>
          );
        },
      },
      {
        accessorKey: 'entityId',
        header: t('auditLog.entityId'),
        cell: ({ row }) => (
          <span className="font-mono text-xs text-muted-foreground">
            {row.original.entityId.slice(0, 8)}...
          </span>
        ),
      },
      {
        accessorKey: 'createdAt',
        header: t('auditLog.date'),
        cell: ({ row }) => (
          <span className="text-sm text-muted-foreground">
            {formatDate(row.original.createdAt)}
          </span>
        ),
      },
      {
        id: 'actions',
        header: '',
        cell: ({ row }) =>
          row.original.diff ? (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => setSelectedEntry(row.original)}
            >
              <Eye className="h-4 w-4" />
            </Button>
          ) : null,
      },
    ],
    [t]
  );

  const entityTypeFilter = (
    <Select
      value={params.entityType || 'all'}
      onValueChange={(value) =>
        setParams((prev) => ({
          ...prev,
          page: 1,
          entityType: value === 'all' ? undefined : value,
        }))
      }
    >
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder={t('auditLog.entityType')} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">{t('common.all')}</SelectItem>
        <SelectItem value="museum">{t('auditLog.museum')}</SelectItem>
        <SelectItem value="historical_place">
          {t('auditLog.historicalPlace')}
        </SelectItem>
      </SelectContent>
    </Select>
  );

  const actionFilter = (
    <Select
      value={params.action || 'all'}
      onValueChange={(value) =>
        setParams((prev) => ({
          ...prev,
          page: 1,
          action: value === 'all' ? undefined : value,
        }))
      }
    >
      <SelectTrigger className="w-[160px]">
        <SelectValue placeholder={t('auditLog.action')} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">{t('common.all')}</SelectItem>
        <SelectItem value="create">{t('auditLog.create')}</SelectItem>
        <SelectItem value="update">{t('auditLog.update')}</SelectItem>
        <SelectItem value="delete">{t('auditLog.deleteAction')}</SelectItem>
        <SelectItem value="restore">{t('auditLog.restoreAction')}</SelectItem>
      </SelectContent>
    </Select>
  );

  return (
    <>
      <DataTable
        columns={columns}
        data={data?.items || []}
        total={data?.total || 0}
        page={params.page || 1}
        pageSize={params.limit || 20}
        totalPages={data?.totalPages || 1}
        onPageChange={(page) => setParams((prev) => ({ ...prev, page }))}
        onPageSizeChange={(limit) =>
          setParams((prev) => ({ ...prev, limit, page: 1 }))
        }
        isLoading={isLoading}
        filterSlot={
          <div className="flex items-center gap-2">
            {entityTypeFilter}
            {actionFilter}
          </div>
        }
      />

      {/* Diff viewer dialog */}
      <Dialog
        open={!!selectedEntry}
        onOpenChange={(open) => !open && setSelectedEntry(null)}
      >
        <DialogContent className="max-h-[80vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{t('auditLog.diff')}</DialogTitle>
            <DialogDescription>
              {selectedEntry?.action} - {selectedEntry?.entityType} -{' '}
              {selectedEntry?.entityId?.slice(0, 8)}...
            </DialogDescription>
          </DialogHeader>
          {selectedEntry?.diff && (
            <pre className="mt-4 overflow-auto rounded-lg bg-muted p-4 text-sm">
              {JSON.stringify(selectedEntry.diff, null, 2)}
            </pre>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
