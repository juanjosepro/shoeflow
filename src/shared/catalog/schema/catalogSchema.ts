import z from "zod";

export const catalogSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "El nombre es obligatorio")
    .max(100, "Máximo 100 caracteres"),
  description: z.string(),
  is_active: z.boolean(),
});

export type CatalogFormInput = z.input<typeof catalogSchema>;
export type CatalogFormData = z.output<typeof catalogSchema>;

export const getDefaultSpecialtyFormValues = (): CatalogFormInput => ({
  name: "",
  description: "",
  is_active: true,
});
