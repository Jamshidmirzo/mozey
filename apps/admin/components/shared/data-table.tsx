'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { useTranslations } from 'next-intl';
import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { ChevronLeft, ChevronRight, Search } from 'lucide-react';
import { PAGE_SIZE_OPTIONS, SEARCH_DEBOUNCE_MS } from '@/lib/constants';
import { debounce } from '@/lib/utils';

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  total?: number;
  page?: number;
  pageSize?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  isLoading?: boolean;
  filterSlot?: React.ReactNode;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  total = 0,
  page = 1,
  pageSize = 20,
  totalPages = 1,
  onPageChange,
  onPageSizeChange,
  searchValue = '',
  onSearchChange,
  isLoading = false,
  filterSlot,
}: DataTableProps<TData, TValue>) {
  const t = useTranslations('common');
  const [localSearch, setLocalSearch] = useState(searchValue);

  useEffect(() => {
    setLocalSearch(searchValue);
  }, [searchValue]);

  const onSearchChangeRef = useRef(onSearchChange);
  onSearchChangeRef.current = onSearchChange;

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedSearch = useCallback(
    debounce((value: string) => {
      onSearchChangeRef.current?.(value);
    }, SEARCH_DEBOUNCE_MS),
    []
  );

  const handleSearchChange = (value: string) => {
    setLocalSearch(value);
    debouncedSearch(value);
  };

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    pageCount: totalPages,
  });

  if (isLoading) {
    return (
      <div className="space-y-4 animate-ios-fade-in">
        <div className="flex items-center gap-4">
          <Skeleton className="h-11 w-[300px] rounded-xl" />
          <Skeleton className="h-11 w-[150px] rounded-xl" />
        </div>
        <div className="rounded-2xl bg-card ios-shadow overflow-hidden">
          <div className="space-y-1 p-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-14 w-full rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {onSearchChange && (
          <div className="relative w-full sm:max-w-sm">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/60" />
            <Input
              placeholder={t('search')}
              value={localSearch}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-11 bg-card ios-shadow-sm"
            />
          </div>
        )}
        {filterSlot && (
          <div className="flex items-center gap-2">{filterSlot}</div>
        )}
      </div>

      <div className="rounded-2xl bg-card ios-shadow overflow-hidden">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="hover:bg-transparent border-border/40">
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-32 text-center text-muted-foreground"
                >
                  {t('noResults')}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {(onPageChange || onPageSizeChange) && (
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between animate-ios-fade-in">
          <div className="text-[13px] text-muted-foreground font-medium">
            {t('total')}: {total} {t('rows')}
          </div>
          <div className="flex items-center gap-3">
            {onPageSizeChange && (
              <div className="flex items-center gap-2">
                <span className="text-[13px] text-muted-foreground">
                  {t('perPage')}:
                </span>
                <Select
                  value={String(pageSize)}
                  onValueChange={(value) => onPageSizeChange(Number(value))}
                >
                  <SelectTrigger className="w-[70px] h-9 rounded-lg bg-card ios-shadow-sm border-0 text-[13px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="glass-card">
                    {PAGE_SIZE_OPTIONS.map((size) => (
                      <SelectItem key={size} value={String(size)}>
                        {size}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            {onPageChange && (
              <div className="flex items-center gap-1.5">
                <span className="text-[13px] text-muted-foreground mr-1">
                  {page} / {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-9 w-9 rounded-lg border-0 bg-card ios-shadow-sm"
                  onClick={() => onPageChange(page - 1)}
                  disabled={page <= 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-9 w-9 rounded-lg border-0 bg-card ios-shadow-sm"
                  onClick={() => onPageChange(page + 1)}
                  disabled={page >= totalPages}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
