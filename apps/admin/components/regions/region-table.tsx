'use client';

import { useMemo, useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { type ColumnDef } from '@tanstack/react-table';
import { MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
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
import { ConfirmDialog } from '@/components/shared/confirm-dialog';
import { Link } from '@/i18n/navigation';
import { useRegions, useDeleteRegion } from '@/lib/hooks/use-regions';
import { ROUTES } from '@/lib/constants';
import { getLocalizedValue, formatDate } from '@/lib/utils';
import type { Region } from '@/lib/types';

export function RegionTable() {
  const t = useTranslations();
  const locale = useLocale();
  const [search, setSearch] = useState('');

  const { data, isLoading } = useRegions(search || undefined);
  const deleteRegion = useDeleteRegion();

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedRegion, setSelectedRegion] = useState<Region | null>(null);

  const handleDelete = (region: Region) => {
    setSelectedRegion(region);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (!selectedRegion) return;
    deleteRegion.mutate(selectedRegion.id, {
      onSuccess: () => {
        toast.success(t('regions.regionDeleted'));
      },
      onError: (error) => {
        toast.error(error.message);
      },
    });
  };

  const columns: ColumnDef<Region>[] = useMemo(
    () => [
      {
        accessorKey: 'orderIdx',
        header: '#',
        cell: ({ row }) => (
          <span className="text-sm text-muted-foreground">
            {row.original.orderIdx}
          </span>
        ),
      },
      {
        accessorKey: 'name',
        header: t('regions.name'),
        cell: ({ row }) => {
          const name = getLocalizedValue(row.original.name, locale);
          return (
            <Link
              href={ROUTES.REGION_EDIT(row.original.id)}
              className="font-medium text-primary hover:underline"
            >
              {name}
            </Link>
          );
        },
      },
      {
        accessorKey: 'slug',
        header: 'Slug',
        cell: ({ row }) => (
          <Badge variant="outline" className="font-mono text-xs">
            {row.original.slug}
          </Badge>
        ),
      },
      {
        id: 'museumCount',
        header: t('regions.museumCount'),
        cell: ({ row }) => (
          <span className="text-sm">
            {row.original._count?.museums ?? 0}
          </span>
        ),
      },
      {
        id: 'placeCount',
        header: t('regions.placeCount'),
        cell: ({ row }) => (
          <span className="text-sm">
            {row.original._count?.historicalPlaces ?? 0}
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
          const region = row.original;
          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link href={ROUTES.REGION_EDIT(region.id)}>
                    <Pencil className="mr-2 h-4 w-4" />
                    {t('common.edit')}
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-destructive"
                  onClick={() => handleDelete(region)}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  {t('common.delete')}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
      },
    ],
    [t, locale]
  );

  return (
    <>
      <DataTable
        columns={columns}
        data={data?.items || []}
        total={data?.total || 0}
        page={1}
        pageSize={100}
        totalPages={1}
        onPageChange={() => {}}
        onPageSizeChange={() => {}}
        searchValue={search}
        onSearchChange={setSearch}
        isLoading={isLoading}
      />

      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title={t('regions.deleteRegion')}
        description={t('regions.deleteConfirm')}
        onConfirm={confirmDelete}
        variant="destructive"
        loading={deleteRegion.isPending}
      />
    </>
  );
}
