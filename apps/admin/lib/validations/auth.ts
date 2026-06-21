import { z } from 'zod';

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'validation.required')
    .email('validation.email'),
  password: z
    .string()
    .min(1, 'validation.required')
    .min(8, 'validation.minLength'),
});

export type LoginFormValues = z.infer<typeof loginSchema>;
