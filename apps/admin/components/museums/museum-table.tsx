'use client';

import { useMemo, useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { type ColumnDef } from '@tanstack/react-table';
import { MoreHorizontal, Pencil, Trash2, RotateCcw, ImageIcon } from 'lucide-react';
import { toast } from 'sonner';
import { DataTable } from '@/components/shared/data-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ConfirmDialog } from '@/components/shared/confirm-dialog';
import { Link } from '@/i18n/navigation';
import { useMuseums, useDeleteMuseum, useRestoreMuseum } from '@/lib/hooks/use-museums';
import { ROUTES } from '@/lib/constants';
import { getLocalizedValue, formatDate, truncate } from '@/lib/utils';
import type { Museum, ListParams } from '@/lib/types';

export function MuseumTable() {
  const t = useTranslations();
  const locale = useLocale();
  const [params, setParams] = useState<ListParams>({
    page: 1,
    limit: 20,
    search: '',
    status: 'all',
  });

  const { data, isLoading } = useMuseums(params);
  const deleteMuseum = useDeleteMuseum();
  const restoreMuseum = useRestoreMuseum();

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [restoreDialogOpen, setRestoreDialogOpen] = useState(false);
  const [selectedMuseum, setSelectedMuseum] = useState<Museum | null>(null);

  const handleDelete = (museum: Museum) => {
    setSelectedMuseum(museum);
    setDeleteDialogOpen(true);
  };

  const handleRestore = (museum: Museum) => {
    setSelectedMuseum(museum);
    setRestoreDialogOpen(true);
  };

  const confirmDelete = () => {
    if (!selectedMuseum) return;
    deleteMuseum.mutate(selectedMuseum.id, {
      onSuccess: () => {
        toast.success(t('museums.museumDeleted'));
      },
      onError: (error) => {
        toast.error(error.message);
      },
    });
  };

  const confirmRestore = () => {
    if (!selectedMuseum) return;
    restoreMuseum.mutate(selectedMuseum.id, {
      onSuccess: () => {
        toast.success(t('museums.museumRestored'));
      },
      onError: (error) => {
        toast.error(error.message);
      },
    });
  };

  const columns: ColumnDef<Museum>[] = useMemo(
    () => [
      {
        accessorKey: 'name',
        header: t('museums.name'),
        cell: ({ row }) => {
          const name = getLocalizedValue(row.original.name, locale);
          return (
            <div className="max-w-[250px]">
              <Link
                href={ROUTES.MUSEUM_EDIT(row.original.id)}
                className="font-medium text-primary hover:underline"
              >
                {truncate(name, 50)}
              </Link>
            </div>
          );
        },
      },
      {
        accessorKey: 'city',
        header: t('museums.city'),
        cell: ({ row }) => (
          <span className="text-sm">{row.original.city}</span>
        ),
      },
      {
        accessorKey: 'isPublished',
        header: t('common.status'),
        cell: ({ row }) => {
          if (row.original.deletedAt) {
            return <Badge variant="destructive">{t('common.deleted')}</Badge>;
          }
          return row.original.isPublished ? (
            <Badge variant="success">{t('common.published')}</Badge>
          ) : (
            <Badge variant="secondary">{t('common.draft')}</Badge>
          );
        },
      },
      {
        accessorKey: 'photos',
        header: t('museums.photos'),
        cell: ({ row }) => (
          <span className="text-sm text-muted-foreground">
            {row.original.photos?.length || 0}
          </span>
        ),
      },
      {
        accessorKey: 'updatedAt',
        header: t('common.updatedAt'),
        cell: ({ row }) => (
          <span className="text-sm text-muted-foreground">
            {formatDate(row.original.updatedAt, locale)}
          </span>
        ),
      },
      {
        id: 'actions',
        header: t('common.actions'),
        cell: ({ row }) => {
          const museum = row.original;
          const isDeleted = !!museum.deletedAt;

          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link href={ROUTES.MUSEUM_EDIT(museum.id)}>
                    <Pencil className="mr-2 h-4 w-4" />
                    {t('common.edit')}
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href={ROUTES.MUSEUM_PHOTOS(museum.id)}>
                    <ImageIcon className="mr-2 h-4 w-4" />
                    {t('museums.managePhotos')}
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                {isDeleted ? (
                  <DropdownMenuItem onClick={() => handleRestore(museum)}>
                    <RotateCcw className="mr-2 h-4 w-4" />
                    {t('common.restore')}
                  </DropdownMenuItem>
                ) : (
                  <DropdownMenuItem
                    className="text-destructive"
                    onClick={() => handleDelete(museum)}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    {t('common.delete')}
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
      },
    ],
    [t, locale]
  );

  const statusFilter = (
    <Select
      value={params.status || 'all'}
      onValueChange={(value) =>
        setParams((prev) => ({
          ...prev,
          page: 1,
          status: value as ListParams['status'],
        }))
      }
    >
      <SelectTrigger className="w-[160px]">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">{t('common.all')}</SelectItem>
        <SelectItem value="published">{t('museums.filterPublished')}</SelectItem>
        <SelectItem value="draft">{t('museums.filterDraft')}</SelectItem>
        <SelectItem value="deleted">{t('museums.filterDeleted')}</SelectItem>
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
        searchValue={params.search}
        onSearchChange={(search) =>
          setParams((prev) => ({ ...prev, search, page: 1 }))
        }
        isLoading={isLoading}
        filterSlot={statusFilter}
      />

      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title={t('museums.deleteMuseum')}
        description={t('museums.deleteConfirm')}
        onConfirm={confirmDelete}
        variant="destructive"
        loading={deleteMuseum.isPending}
      />

      <ConfirmDialog
        open={restoreDialogOpen}
        onOpenChange={setRestoreDialogOpen}
        title={t('museums.restoreMuseum')}
        description={t('museums.restoreConfirm')}
        onConfirm={confirmRestore}
        variant="default"
        loading={restoreMuseum.isPending}
      />
    </>
  );
}
