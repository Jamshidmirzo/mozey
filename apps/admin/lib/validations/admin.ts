import { z } from 'zod';

export const adminSchema = z.object({
  email: z
    .string()
    .min(1, 'validation.required')
    .email('validation.email'),
  password: z
    .string()
    .min(1, 'validation.required')
    .min(8, 'validation.minLength'),
  role: z.enum(['superadmin', 'editor']),
});

export type AdminFormValues = z.infer<typeof adminSchema>;
