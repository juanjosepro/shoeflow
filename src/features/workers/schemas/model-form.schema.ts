import { z } from 'zod';

export const workerFormSchema = z.object({
  name: z.string().min(3),
  code_prefix: z.string().min(2),
  description: z.string().min(5),
  is_active: z.boolean().optional(),
});
