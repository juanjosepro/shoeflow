import { z } from 'zod';

export const modelSchema = z.object({
  name: z.string().min(1, "El nombre es obligatorio"),
  code_prefix: z.string().min(2, "El prefijo del código es obligatorio"),
  description: z.string().optional(),
  category_id: z.number({ message: "Seleccione una categoría" }),
  is_active: z.boolean(),
  // dentro de modelSchema:
  size_rates: z.array(
    z.object({
      specialty: z.number(),
      size: z.number(),
      price: z.number().min(0, "No puede ser negativo").nullable(),
    }),
  ),
});

export type ModelFormInput = z.input<typeof modelSchema>;
export type ModelFormData = z.output<typeof modelSchema>;

export const getDefaultModelFormValues = (): ModelFormInput => ({
  name: "",
  code_prefix: "",
  description: "",
  category_id: null,
  is_active: true,
  size_rates: [],
});
