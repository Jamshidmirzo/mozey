import { z } from 'zod';
import { localizedFieldSchema } from './shared';

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
