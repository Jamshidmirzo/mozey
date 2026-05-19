'use client';

import { useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { type ColumnDef } from '@tanstack/react-table';
import { Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { DataTable } from '@/components/shared/data-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/shared/confirm-dialog';
import { useAdmins, useDeleteAdmin } from '@/lib/hooks/use-admins';
import { formatDate } from '@/lib/utils';
import { getStoredAdmin } from '@/lib/auth';
import type { Admin } from '@/lib/types';

export function AdminTable() {
  const t = useTranslations();
  const { data, isLoading } = useAdmins();
  const deleteAdmin = useDeleteAdmin();
  const currentAdmin = getStoredAdmin();

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState<Admin | null>(null);

  const handleDelete = (admin: Admin) => {
    setSelectedAdmin(admin);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (!selectedAdmin) return;
    deleteAdmin.mutate(selectedAdmin.id, {
      onSuccess: () => {
        toast.success(t('admins.adminDeleted'));
      },
      onError: (error) => {
        toast.error(error.message);
      },
    });
  };

  const columns: ColumnDef<Admin>[] = useMemo(
    () => [
      {
        accessorKey: 'email',
        header: t('admins.email'),
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <span className="font-medium">{row.original.email}</span>
            {row.original.id === currentAdmin?.id && (
              <Badge variant="outline" className="text-xs">
                You
              </Badge>
            )}
          </div>
        ),
      },
      {
        accessorKey: 'role',
        header: t('admins.role'),
        cell: ({ row }) => (
          <Badge
            variant={
              row.original.role === 'superadmin' ? 'default' : 'secondary'
            }
          >
            {row.original.role === 'superadmin'
              ? t('admins.superadmin')
              : t('admins.editor')}
          </Badge>
        ),
      },
      {
        accessorKey: 'createdAt',
        header: t('common.createdAt'),
        cell: ({ row }) => (
          <span className="text-sm text-muted-foreground">
            {formatDate(row.original.createdAt)}
          </span>
        ),
      },
      {
        id: 'actions',
        header: t('common.actions'),
        cell: ({ row }) => {
          const admin = row.original;
          // Cannot delete yourself
          if (admin.id === currentAdmin?.id) return null;

          return (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-destructive hover:text-destructive"
              onClick={() => handleDelete(admin)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          );
        },
      },
    ],
    [t, currentAdmin?.id]
  );

  return (
    <>
      <DataTable
        columns={columns}
        data={data || []}
        isLoading={isLoading}
      />

      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title={t('admins.deleteAdmin')}
        description={t('admins.deleteConfirm')}
        onConfirm={confirmDelete}
        variant="destructive"
        loading={deleteAdmin.isPending}
      />
    </>
  );
}
