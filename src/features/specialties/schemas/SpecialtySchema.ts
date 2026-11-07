import z from "zod";

export const specialtySchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "El nombre es obligatorio")
    .max(100, "Máximo 100 caracteres"),
  description: z.string(),
  order: z
    .number({ error: "Indica la posición" })
    .int()
    .min(0, "No puede ser negativo"),
  is_active: z.boolean(),
  excludes: z.array(z.number()),
  // Solo se pide al crear (se exige abajo, en el envío); al editar se cambia desde Tarifas
  base_price: z.number().min(0, "El precio no puede ser negativo").optional(),
});

export type SpecialtyFormInput = z.input<typeof specialtySchema>;
export type SpecialtyFormData = z.output<typeof specialtySchema>;

export const getDefaultSpecialtyFormValues = (): SpecialtyFormInput => ({
  name: "",
  description: "",
  order: 1,
  is_active: true,
  excludes: [],
  base_price: undefined
});
