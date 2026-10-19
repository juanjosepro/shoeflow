import { z } from "zod";

// Un id obligatorio: empieza en null (nada elegido) y no deja guardar así
const requiredId = (message: string) =>
  z
    .number({ error: message })
    .nullable()
    .refine((value) => value !== null, { message });

export const dozenSchema = z.object({
  registered_at: z.date({
    error: "La fecha de registro es requerida",
  }),

  // Cuántas docenas crear con estos mismos datos (cada una con su código).
  // Solo se usa al crear.
  count: z
    .number({ error: "La cantidad es requerida" })
    .int("Debe ser un número entero")
    .min(1, "Mínimo 1 docena")
    .max(100, "Máximo 100 docenas"),

  // Pares de cada docena: 12 = docena completa, menos = fracción
  pairs: z
    .number({ error: "Los pares son requeridos" })
    .int("Debe ser un número entero")
    .min(1, "Mínimo 1 par")
    .max(12, "Máximo 12 pares"),

  model_id: requiredId("El modelo es requerido"),
  size_id: requiredId("La talla es requerida"),
  material_type_id: requiredId("El material es requerido"),
  color_id: requiredId("El color es requerido"),
  plant_type_id: requiredId("El tipo de planta es requerido"),

  priority: z.string().min(1, "La prioridad es requerida"),

  description: z.string().optional().default(""),

  is_active: z.boolean().default(true),

  status: z.string().default("PENDIENTE"),
});

export type DozenFormInput = z.input<typeof dozenSchema>;
export type DozenFormData = z.output<typeof dozenSchema>;

// Lo que se envía al backend: igual que el formulario, pero la fecha va como texto ISO
export type DozenPayload = Omit<DozenFormData, "registered_at"> & {
  registered_at: string;
};

export const getDefaultDozenFormValues = (): DozenFormInput => ({
  registered_at: new Date(),
  count: 1,
  pairs: 12,
  model_id: null,
  size_id: null,
  material_type_id: null,
  color_id: null,
  plant_type_id: null,
  priority: "NORMAL",
  description: "",
  is_active: true,
  status: "PENDIENTE",
});