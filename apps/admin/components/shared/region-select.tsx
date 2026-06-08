'use client';

import { useTranslations, useLocale } from 'next-intl';
import { useRegionsDropdown } from '@/lib/hooks/use-regions';
import { getLocalizedValue } from '@/lib/utils';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface RegionSelectProps {
  value: string | null | undefined;
  onValueChange: (value: string | null) => void;
  placeholder?: string;
  /** If true, shows "All regions" option instead of "No region" */
  filterMode?: boolean;
}

const NONE_VALUE = '__none__';

export function RegionSelect({
  value,
  onValueChange,
  placeholder,
  filterMode = false,
}: RegionSelectProps) {
  const t = useTranslations('regions');
  const locale = useLocale();
  const { data: regions, isLoading } = useRegionsDropdown();

  return (
    <Select
      value={value || NONE_VALUE}
      onValueChange={(v) => onValueChange(v === NONE_VALUE ? null : v)}
    >
      <SelectTrigger className="w-full">
        <SelectValue
          placeholder={placeholder || t('selectRegion')}
        />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={NONE_VALUE}>
          {filterMode ? t('allRegions') : t('noRegion')}
        </SelectItem>
        {isLoading && (
          <SelectItem value="__loading__" disabled>
            {t('loading')}
          </SelectItem>
        )}
        {regions?.map((region) => (
          <SelectItem key={region.id} value={region.id}>
            {getLocalizedValue(region.name, locale)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
