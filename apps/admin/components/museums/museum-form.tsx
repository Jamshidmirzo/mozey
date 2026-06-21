'use client';

import * as React from 'react';
import { useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { Loader2, ChevronLeft } from 'lucide-react';
import { museumSchema, type MuseumFormValues } from '@/lib/validations/museum';
import { useCreateMuseum, useUpdateMuseum } from '@/lib/hooks/use-museums';
import { Link, useRouter } from '@/i18n/navigation';
import { ROUTES } from '@/lib/constants';
import { emptyLocalizedField } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { LanguageTabs } from '@/components/shared/language-tabs';
import { RegionSelect } from '@/components/shared/region-select';
import { PhotoUpload } from './photo-upload';
import type { Museum } from '@/lib/types';

interface MuseumFormProps {
  museum?: Museum;
}

export function MuseumForm({ museum }: MuseumFormProps) {
  const t = useTranslations();
  const router = useRouter();
  const isEdit = !!museum;

  const createMutation = useCreateMuseum();
  const updateMutation = useUpdateMuseum(museum?.id || '');

  const form = useForm<MuseumFormValues>({
    resolver: zodResolver(museumSchema),
    defaultValues: museum
      ? {
          name: museum.name,
          description: museum.description,
          ticketPrice: museum.ticketPrice,
          latitude: museum.latitude,
          longitude: museum.longitude,
          city: museum.city,
          regionId: museum.regionId || null,
          isPublished: museum.isPublished,
        }
      : {
          name: emptyLocalizedField(),
          description: emptyLocalizedField(),
          ticketPrice: emptyLocalizedField(),
          latitude: 41.311081,
          longitude: 69.240562,
          city: '',
          regionId: null,
          isPublished: false,
        },
  });

  const isPending = createMutation.isPending || updateMutation.isPending;

  async function onSubmit(data: MuseumFormValues) {
    try {
      if (isEdit) {
        await updateMutation.mutateAsync(data);
        toast.success(t('museums.museumUpdated'));
      } else {
        await createMutation.mutateAsync(data);
        toast.success(t('museums.museumCreated'));
        router.push(ROUTES.MUSEUMS);
      }
    } catch {
      toast.error(t('common.error'));
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild className="rounded-xl">
          <Link href={ROUTES.MUSEUMS}>
            <ChevronLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h2 className="text-xl font-bold tracking-tight">
            {isEdit ? t('museums.editMuseum') : t('museums.createMuseum')}
          </h2>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit, () => toast.error(t('validation.required')))} className="space-y-5">
          <Card>
            <CardHeader>
              <CardTitle>
                {t('museums.name')} / {t('museums.description')} / {t('museums.ticketPrice')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <LanguageTabs>
                {(lang) => (
                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name={`name.${lang}` as `name.uz` | `name.ru` | `name.en`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-[13px] text-muted-foreground font-medium">{t('museums.name')}</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`description.${lang}` as `description.uz` | `description.ru` | `description.en`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-[13px] text-muted-foreground font-medium">{t('museums.description')}</FormLabel>
                          <FormControl>
                            <Textarea rows={5} {...field} className="rounded-xl border-0 bg-secondary/70 ring-1 ring-border/50 focus-visible:ring-2 focus-visible:ring-primary/50 transition-all duration-200 ease-ios" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`ticketPrice.${lang}` as `ticketPrice.uz` | `ticketPrice.ru` | `ticketPrice.en`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-[13px] text-muted-foreground font-medium">{t('museums.ticketPrice')}</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}
              </LanguageTabs>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>
                {t('museums.city')} / {t('museums.latitude')} / {t('museums.longitude')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[13px] text-muted-foreground font-medium">{t('museums.city')}</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="regionId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[13px] text-muted-foreground font-medium">{t('museums.region')}</FormLabel>
                    <FormControl>
                      <RegionSelect
                        value={field.value}
                        onValueChange={field.onChange}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="latitude"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[13px] text-muted-foreground font-medium">{t('museums.latitude')}</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="any"
                          {...field}
                          onChange={(e) =>
                            field.onChange(
                              e.target.value === ''
                                ? ''
                                : parseFloat(e.target.value)
                            )
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="longitude"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[13px] text-muted-foreground font-medium">{t('museums.longitude')}</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="any"
                          {...field}
                          onChange={(e) =>
                            field.onChange(
                              e.target.value === ''
                                ? ''
                                : parseFloat(e.target.value)
                            )
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="isPublished"
                render={({ field }) => (
                  <FormItem className="flex items-center gap-3 rounded-2xl bg-secondary/50 p-4 transition-colors duration-200">
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-0.5">
                      <FormLabel className="text-sm font-semibold">
                        {t('museums.isPublished')}
                      </FormLabel>
                    </div>
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
              <Link href={ROUTES.MUSEUMS}>{t('common.cancel')}</Link>
            </Button>
          </div>
        </form>
      </Form>

      {isEdit && museum && (
        <Card>
          <CardHeader>
            <CardTitle>{t('museums.managePhotos')}</CardTitle>
          </CardHeader>
          <CardContent>
            <PhotoUpload
              entityType="museum"
              entityId={museum.id}
              photos={museum.photos}
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
