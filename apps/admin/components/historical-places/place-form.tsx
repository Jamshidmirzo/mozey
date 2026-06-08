'use client';

import { useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { Loader2, ChevronLeft } from 'lucide-react';
import {
  historicalPlaceSchema,
  type HistoricalPlaceFormValues,
} from '@/lib/validations/historical-place';
import {
  useCreateHistoricalPlace,
  useUpdateHistoricalPlace,
} from '@/lib/hooks/use-historical-places';
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
import { PhotoUpload } from '@/components/museums/photo-upload';
import type { HistoricalPlace } from '@/lib/types';

interface PlaceFormProps {
  place?: HistoricalPlace;
}

export function PlaceForm({ place }: PlaceFormProps) {
  const t = useTranslations();
  const router = useRouter();
  const isEdit = !!place;

  const createMutation = useCreateHistoricalPlace();
  const updateMutation = useUpdateHistoricalPlace(place?.id || '');

  const form = useForm<HistoricalPlaceFormValues>({
    resolver: zodResolver(historicalPlaceSchema),
    defaultValues: place
      ? {
          name: place.name,
          description: place.description,
          ticketPrice: place.ticketPrice,
          latitude: place.latitude,
          longitude: place.longitude,
          city: place.city,
          regionId: place.regionId || null,
          isPublished: place.isPublished,
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

  async function onSubmit(data: HistoricalPlaceFormValues) {
    try {
      if (isEdit) {
        await updateMutation.mutateAsync(data);
        toast.success(t('historicalPlaces.placeUpdated'));
      } else {
        await createMutation.mutateAsync(data);
        toast.success(t('historicalPlaces.placeCreated'));
        router.push(ROUTES.HISTORICAL_PLACES);
      }
    } catch {
      toast.error(t('common.error'));
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild className="rounded-xl">
          <Link href={ROUTES.HISTORICAL_PLACES}>
            <ChevronLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h2 className="text-xl font-bold tracking-tight">
            {isEdit ? t('historicalPlaces.editPlace') : t('historicalPlaces.createPlace')}
          </h2>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit, () => toast.error(t('validation.required')))} className="space-y-5">
          <Card>
            <CardHeader>
              <CardTitle>
                {t('historicalPlaces.name')} / {t('historicalPlaces.description')} / {t('historicalPlaces.ticketPrice')}
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
                          <FormLabel className="text-[13px] text-muted-foreground font-medium">{t('historicalPlaces.name')}</FormLabel>
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
                          <FormLabel className="text-[13px] text-muted-foreground font-medium">{t('historicalPlaces.description')}</FormLabel>
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
                          <FormLabel className="text-[13px] text-muted-foreground font-medium">{t('historicalPlaces.ticketPrice')}</FormLabel>
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
                {t('historicalPlaces.city')} / {t('historicalPlaces.latitude')} / {t('historicalPlaces.longitude')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[13px] text-muted-foreground font-medium">{t('historicalPlaces.city')}</FormLabel>
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
                    <FormLabel className="text-[13px] text-muted-foreground font-medium">{t('regions.region')}</FormLabel>
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
                      <FormLabel className="text-[13px] text-muted-foreground font-medium">{t('historicalPlaces.latitude')}</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="any"
                          {...field}
                          onChange={(e) =>
                            field.onChange(
                              e.target.value === '' ? '' : parseFloat(e.target.value)
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
                      <FormLabel className="text-[13px] text-muted-foreground font-medium">{t('historicalPlaces.longitude')}</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="any"
                          {...field}
                          onChange={(e) =>
                            field.onChange(
                              e.target.value === '' ? '' : parseFloat(e.target.value)
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
                        {t('historicalPlaces.isPublished')}
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
              <Link href={ROUTES.HISTORICAL_PLACES}>{t('common.cancel')}</Link>
            </Button>
          </div>
        </form>
      </Form>

      {isEdit && place && (
        <Card>
          <CardHeader>
            <CardTitle>{t('historicalPlaces.managePhotos')}</CardTitle>
          </CardHeader>
          <CardContent>
            <PhotoUpload
              entityType="historical-place"
              entityId={place.id}
              photos={place.photos}
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
