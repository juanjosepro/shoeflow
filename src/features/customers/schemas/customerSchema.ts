// [PED] ARCHIVO NUEVO ─ features/customers/schemas/customerSchema.ts
import { z } from "zod";

export const customerSchema = z.object({
  name: z.string().trim().min(2, "El nombre es requerido (mínimo 2 letras)").max(150, "Máximo 150 caracteres"),
  // DNI (8) o RUC (11). Opcional, pero si se escribe no se puede repetir
  document: z
    .string()
    .trim()
    .regex(/^([A-Za-z0-9]{8,15})?$/, "Documento inválido (8 a 15 caracteres, sin espacios)")
    .optional()
    .default(""),
  phone: z
    .string()
    .trim()
    .regex(/^([0-9+\s-]{6,20})?$/, "Teléfono inválido")
    .optional()
    .default(""),
  email: z.union([z.literal(""), z.email("Correo inválido")]).optional().default(""),
  address: z.string().trim().max(255, "Máximo 255 caracteres").optional().default(""),
  notes: z.string().optional().default(""),
  is_active: z.boolean().default(true),
});

export type CustomerFormInput = z.input<typeof customerSchema>;
export type CustomerFormValues = z.output<typeof customerSchema>;

export const getDefaultCustomerValues = (): CustomerFormInput => ({
  name: "",
  document: "",
  phone: "",
  email: "",
  address: "",
  notes: "",
  is_active: true,
});
