'use client';

import { useMemo, useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { type ColumnDef } from '@tanstack/react-table';
import { MoreHorizontal, Pencil, Trash2, RotateCcw, ImageIcon, Building2 } from 'lucide-react';
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
import { RegionSelect } from '@/components/shared/region-select';
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
            <Link
              href={ROUTES.MUSEUM_EDIT(row.original.id)}
              className="group flex items-center gap-2.5 max-w-[280px] ios-press"
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 transition-all duration-200 group-hover:from-primary/20 group-hover:to-primary/10">
                <Building2 className="h-4 w-4 text-primary" />
              </div>
              <span className="font-semibold text-foreground group-hover:text-primary transition-colors duration-200 truncate">
                {truncate(name, 50)}
              </span>
            </Link>
          );
        },
      },
      {
        accessorKey: 'city',
        header: t('museums.city'),
        cell: ({ row }) => (
          <span className="text-[13px] text-muted-foreground">{row.original.city}</span>
        ),
      },
      {
        id: 'region',
        header: t('museums.region'),
        cell: ({ row }) => {
          const region = row.original.region;
          if (!region) return <span className="text-[13px] text-muted-foreground">—</span>;
          return (
            <Badge variant="outline" className="text-[11px]">
              {getLocalizedValue(region.name, locale)}
            </Badge>
          );
        },
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
        cell: ({ row }) => {
          const count = row.original.photos?.length || 0;
          return (
            <Badge variant={count > 0 ? 'default' : 'secondary'}>
              {count}
            </Badge>
          );
        },
      },
      {
        accessorKey: 'updatedAt',
        header: t('common.updatedAt'),
        cell: ({ row }) => (
          <span className="text-[13px] text-muted-foreground">
            {formatDate(row.original.updatedAt, locale)}
          </span>
        ),
      },
      {
        id: 'actions',
        header: '',
        cell: ({ row }) => {
          const museum = row.original;
          const isDeleted = !!museum.deletedAt;

          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="glass-card min-w-[180px]">
                <DropdownMenuItem asChild className="rounded-lg">
                  <Link href={ROUTES.MUSEUM_EDIT(museum.id)}>
                    <Pencil className="mr-2 h-4 w-4" />
                    {t('common.edit')}
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="rounded-lg">
                  <Link href={ROUTES.MUSEUM_PHOTOS(museum.id)}>
                    <ImageIcon className="mr-2 h-4 w-4" />
                    {t('museums.managePhotos')}
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-border/40" />
                {isDeleted ? (
                  <DropdownMenuItem onClick={() => handleRestore(museum)} className="rounded-lg">
                    <RotateCcw className="mr-2 h-4 w-4" />
                    {t('common.restore')}
                  </DropdownMenuItem>
                ) : (
                  <DropdownMenuItem
                    className="text-destructive rounded-lg focus:text-destructive"
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
    <div className="flex items-center gap-2">
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
        <SelectTrigger className="w-[160px] h-10 rounded-xl border-0 bg-card ios-shadow-sm text-[13px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent className="glass-card">
          <SelectItem value="all">{t('common.all')}</SelectItem>
          <SelectItem value="published">{t('museums.filterPublished')}</SelectItem>
          <SelectItem value="draft">{t('museums.filterDraft')}</SelectItem>
          <SelectItem value="deleted">{t('museums.filterDeleted')}</SelectItem>
        </SelectContent>
      </Select>
      <div className="w-[200px]">
        <RegionSelect
          value={params.regionId || null}
          onValueChange={(v) =>
            setParams((prev) => ({
              ...prev,
              page: 1,
              regionId: v || undefined,
            }))
          }
          filterMode
        />
      </div>
    </div>
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
