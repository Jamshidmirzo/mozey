import { z } from 'zod';

export const localizedFieldSchema = z.object({
  uz: z.string().min(1, 'validation.required'),
  ru: z.string().min(1, 'validation.required'),
  en: z.string().min(1, 'validation.required'),
});

export const localizedOptionalFieldSchema = z.object({
  uz: z.string(),
  ru: z.string(),
  en: z.string(),
});

export const entitySchema = z.object({
  name: localizedFieldSchema,
  description: localizedFieldSchema,
  ticketPrice: localizedOptionalFieldSchema,
  latitude: z
    .number({ invalid_type_error: 'validation.number' })
    .min(-90, 'validation.latitude')
    .max(90, 'validation.latitude'),
  longitude: z
    .number({ invalid_type_error: 'validation.number' })
    .min(-180, 'validation.longitude')
    .max(180, 'validation.longitude'),
  city: z.string().min(1, 'validation.required'),
  regionId: z.string().uuid().nullable().optional(),
  isPublished: z.boolean(),
});

export type EntityFormValues = z.infer<typeof entitySchema>;
