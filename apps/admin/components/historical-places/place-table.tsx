'use client';

import { useMemo, useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { type ColumnDef } from '@tanstack/react-table';
import { MoreHorizontal, Pencil, Trash2, RotateCcw, Image } from 'lucide-react';
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
import {
  useHistoricalPlaces,
  useDeleteHistoricalPlace,
  useRestoreHistoricalPlace,
} from '@/lib/hooks/use-historical-places';
import { ROUTES } from '@/lib/constants';
import { getLocalizedValue, formatDate, truncate } from '@/lib/utils';
import type { HistoricalPlace, ListParams } from '@/lib/types';

export function PlaceTable() {
  const t = useTranslations();
  const locale = useLocale();
  const [params, setParams] = useState<ListParams>({
    page: 1,
    limit: 20,
    search: '',
    status: 'all',
  });

  const { data, isLoading } = useHistoricalPlaces(params);
  const deletePlace = useDeleteHistoricalPlace();
  const restorePlace = useRestoreHistoricalPlace();

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [restoreDialogOpen, setRestoreDialogOpen] = useState(false);
  const [selectedPlace, setSelectedPlace] = useState<HistoricalPlace | null>(null);

  const handleDelete = (place: HistoricalPlace) => {
    setSelectedPlace(place);
    setDeleteDialogOpen(true);
  };

  const handleRestore = (place: HistoricalPlace) => {
    setSelectedPlace(place);
    setRestoreDialogOpen(true);
  };

  const confirmDelete = () => {
    if (!selectedPlace) return;
    deletePlace.mutate(selectedPlace.id, {
      onSuccess: () => {
        toast.success(t('historicalPlaces.placeDeleted'));
      },
      onError: (error) => {
        toast.error(error.message);
      },
    });
  };

  const confirmRestore = () => {
    if (!selectedPlace) return;
    restorePlace.mutate(selectedPlace.id, {
      onSuccess: () => {
        toast.success(t('historicalPlaces.placeRestored'));
      },
      onError: (error) => {
        toast.error(error.message);
      },
    });
  };

  const columns: ColumnDef<HistoricalPlace>[] = useMemo(
    () => [
      {
        accessorKey: 'name',
        header: t('historicalPlaces.name'),
        cell: ({ row }) => {
          const name = getLocalizedValue(row.original.name, locale);
          return (
            <div className="max-w-[250px]">
              <Link
                href={ROUTES.HISTORICAL_PLACE_EDIT(row.original.id)}
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
        header: t('historicalPlaces.city'),
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
        header: t('historicalPlaces.photos'),
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
          const place = row.original;
          const isDeleted = !!place.deletedAt;

          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link href={ROUTES.HISTORICAL_PLACE_EDIT(place.id)}>
                    <Pencil className="mr-2 h-4 w-4" />
                    {t('common.edit')}
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                {isDeleted ? (
                  <DropdownMenuItem onClick={() => handleRestore(place)}>
                    <RotateCcw className="mr-2 h-4 w-4" />
                    {t('common.restore')}
                  </DropdownMenuItem>
                ) : (
                  <DropdownMenuItem
                    className="text-destructive"
                    onClick={() => handleDelete(place)}
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
        title={t('historicalPlaces.deletePlace')}
        description={t('historicalPlaces.deleteConfirm')}
        onConfirm={confirmDelete}
        variant="destructive"
        loading={deletePlace.isPending}
      />

      <ConfirmDialog
        open={restoreDialogOpen}
        onOpenChange={setRestoreDialogOpen}
        title={t('historicalPlaces.restorePlace')}
        description={t('historicalPlaces.restoreConfirm')}
        onConfirm={confirmRestore}
        variant="default"
        loading={restorePlace.isPending}
      />
    </>
  );
}
