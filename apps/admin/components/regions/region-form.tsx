'use client';

import * as React from 'react';
import { useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { Loader2, ChevronLeft } from 'lucide-react';
import { regionSchema, type RegionFormValues } from '@/lib/validations/region';
import { useCreateRegion, useUpdateRegion } from '@/lib/hooks/use-regions';
import { Link, useRouter } from '@/i18n/navigation';
import { ROUTES } from '@/lib/constants';
import { emptyLocalizedField } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import { LanguageTabs } from '@/components/shared/language-tabs';
import type { Region } from '@/lib/types';

interface RegionFormProps {
  region?: Region;
}

export function RegionForm({ region }: RegionFormProps) {
  const t = useTranslations();
  const router = useRouter();
  const isEdit = !!region;

  const createMutation = useCreateRegion();
  const updateMutation = useUpdateRegion(region?.id || '');

  const form = useForm<RegionFormValues>({
    resolver: zodResolver(regionSchema),
    defaultValues: region
      ? {
          name: region.name,
          slug: region.slug,
          orderIdx: region.orderIdx,
        }
      : {
          name: emptyLocalizedField(),
          slug: '',
          orderIdx: 0,
        },
  });

  const isPending = createMutation.isPending || updateMutation.isPending;

  const watchNameUz = form.watch('name.uz');
  React.useEffect(() => {
    if (!isEdit && watchNameUz) {
      const slug = watchNameUz
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');
      if (slug) {
        form.setValue('slug', slug, { shouldValidate: true });
      }
    }
  }, [watchNameUz, isEdit, form]);

  async function onSubmit(data: RegionFormValues) {
    try {
      if (isEdit) {
        await updateMutation.mutateAsync(data);
        toast.success(t('regions.regionUpdated'));
      } else {
        await createMutation.mutateAsync(data);
        toast.success(t('regions.regionCreated'));
        router.push(ROUTES.REGIONS);
      }
    } catch {
      toast.error(t('common.error'));
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild className="rounded-xl">
          <Link href={ROUTES.REGIONS}>
            <ChevronLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h2 className="text-xl font-bold tracking-tight">
            {isEdit ? t('regions.editRegion') : t('regions.createRegion')}
          </h2>
        </div>
      </div>

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit, () =>
            toast.error(t('validation.required'))
          )}
          className="space-y-5"
        >
          <Card>
            <CardHeader>
              <CardTitle>{t('regions.name')}</CardTitle>
            </CardHeader>
            <CardContent>
              <LanguageTabs>
                {(lang) => (
                  <FormField
                    control={form.control}
                    name={
                      `name.${lang}` as `name.uz` | `name.ru` | `name.en`
                    }
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[13px] text-muted-foreground font-medium">{t('regions.name')}</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </LanguageTabs>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t('regions.slug')} & {t('regions.orderIdx')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="slug"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[13px] text-muted-foreground font-medium">{t('regions.slug')}</FormLabel>
                    <FormControl>
                      <Input {...field} className="font-mono" />
                    </FormControl>
                    <FormDescription className="text-[12px]">
                      {t('regions.slugDescription')}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="orderIdx"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[13px] text-muted-foreground font-medium">{t('regions.orderIdx')}</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        onChange={(e) =>
                          field.onChange(
                            e.target.value === ''
                              ? ''
                              : parseInt(e.target.value, 10)
                          )
                        }
                      />
                    </FormControl>
                    <FormDescription className="text-[12px]">
                      {t('regions.orderIdxDescription')}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <div className="flex items-center gap-3 pt-2">
            <Button type="submit" disabled={isPending} className="min-w-[120px]">
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {t('common.save')}
            </Button>
            <Button type="button" variant="ghost" asChild>
              <Link href={ROUTES.REGIONS}>{t('common.cancel')}</Link>
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
