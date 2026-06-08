import { z } from 'zod';

const localizedFieldSchema = z.object({
  uz: z.string().min(1, 'validation.required'),
  ru: z.string().min(1, 'validation.required'),
  en: z.string().min(1, 'validation.required'),
});

export const regionSchema = z.object({
  name: localizedFieldSchema,
  slug: z
    .string()
    .min(1, 'validation.required')
    .regex(/^[a-z0-9-]+$/, 'validation.slugFormat'),
  orderIdx: z
    .number({ invalid_type_error: 'validation.number' })
    .int()
    .min(0),
});

export type RegionFormValues = z.infer<typeof regionSchema>;
