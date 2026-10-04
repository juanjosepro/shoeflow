import { z } from "zod";

export const dozenSchema = z.object({
    registered_at: z.date({
        error: "La fecha de registro es requerida",
      }),

  quantity: z
    .number({
      error: "La cantidad es requerida",
    })
    .refine(
      (val) => val === 0.5 || (val > 0 && Number.isInteger(val)),
      {
        message: "La cantidad debe ser 0.5 o un número entero mayor a 0",
      },
    ),

    model_id: z
        .number({
        error: "El modelo es requerido",
        })
        .nullable()
        .refine((value) => value !== null, {
        message: "El modelo es requerido",
        }),

  variant_id: z
    .number({
        error: "La variante es requerida",
    })
    .nullable()
    .refine((value) => value !== null, {
        message: "La variante es requerida",
    }),

  material: z.string().min(1, "El material es requerido"),

  color: z.string().min(1, "El color es requerido"),

  description: z.string().optional().default(""),

  worker_id: z.number().nullable().optional(),

  is_active: z.boolean().default(true),

  status: z.string().default("PENDIENTE"),
});

export type DozenFormInput = z.input<typeof dozenSchema>;
export type DozenFormData = z.output<typeof dozenSchema>;

export const getDefaultDozenFormValues = (): DozenFormInput => ({
    registered_at: new Date(),
    quantity: 1,
    model_id: null,
    variant_id: null,
    material: "",
    color: "",
    description: "",
    worker_id: null,
    is_active: true,
    status: "",
  });
