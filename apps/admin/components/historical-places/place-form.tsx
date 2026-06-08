'use client';

import { useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { Loader2, ArrowLeft } from 'lucide-react';
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
      {/* Back button */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href={ROUTES.HISTORICAL_PLACES}>
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            {isEdit ? t('historicalPlaces.editPlace') : t('historicalPlaces.createPlace')}
          </h2>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit, () => toast.error(t('validation.required')))} className="space-y-6">
          {/* Localized fields */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">
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
                          <FormLabel>{t('historicalPlaces.name')}</FormLabel>
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
                          <FormLabel>{t('historicalPlaces.description')}</FormLabel>
                          <FormControl>
                            <Textarea rows={5} {...field} />
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
                          <FormLabel>{t('historicalPlaces.ticketPrice')}</FormLabel>
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

          {/* Location & metadata */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                {t('historicalPlaces.city')} / {t('historicalPlaces.latitude')} / {t('historicalPlaces.longitude')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('historicalPlaces.city')}</FormLabel>
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
                    <FormLabel>{t('regions.region')}</FormLabel>
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
                      <FormLabel>{t('historicalPlaces.latitude')}</FormLabel>
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
                      <FormLabel>{t('historicalPlaces.longitude')}</FormLabel>
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
                  <FormItem className="flex items-center gap-3 rounded-lg border p-4">
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">
                        {t('historicalPlaces.isPublished')}
                      </FormLabel>
                    </div>
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Submit */}
          <div className="flex items-center gap-4">
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {t('common.save')}
            </Button>
            <Button type="button" variant="outline" asChild>
              <Link href={ROUTES.HISTORICAL_PLACES}>{t('common.cancel')}</Link>
            </Button>
          </div>
        </form>
      </Form>

      {/* Photo management - only for existing places */}
      {isEdit && place && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t('historicalPlaces.managePhotos')}</CardTitle>
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
