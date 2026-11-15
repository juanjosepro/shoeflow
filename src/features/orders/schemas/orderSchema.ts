// [PED] ARCHIVO NUEVO ─ features/orders/schemas/orderSchema.ts
import { z } from "zod";

// Un id obligatorio: empieza en null (nada elegido) y no deja guardar así
const requiredId = (message: string) =>
  z
    .number({ error: message })
    .nullable()
    .refine((value) => value !== null, { message });

// Una línea del pedido (mismos campos que el formulario de docena)
export const orderLineSchema = z
  .object({
    model_id: requiredId("Elige el modelo"),
    size_id: requiredId("Elige la talla"),
    material_type_id: requiredId("Elige el material"),
    color_id: requiredId("Elige el color"),
    plant_type_id: z.number().nullable().optional(), // planta opcional
    count: z
      .number({ error: "Indica la cantidad" })
      .int("Debe ser entero")
      .min(1, "Mínimo 1")
      .max(100, "Máximo 100"),
    pairs: z
      .number({ error: "Indica los pares" })
      .int("Debe ser entero")
      .min(1, "Mínimo 1 par")
      .max(12, "Máximo 12 pares"),
    size_run: z.record(z.string(), z.number().int().min(1)).nullable().optional(),
    description: z.string().optional().default(""),
  })
  .superRefine((line, ctx) => {
    const run = line.size_run;
    if (!run || Object.keys(run).length === 0) return;
    const total = Object.values(run).reduce((sum, n) => sum + n, 0);
    if (total !== line.pairs) {
      ctx.addIssue({
        code: "custom",
        path: ["size_run"],
        message: `La serie suma ${total} pares y la docena tiene ${line.pairs}.`,
      });
    }
  });

export const orderSchema = z
  .object({
    customer_id: requiredId("Elige el cliente"),
    ordered_at: z.date({ error: "La fecha del pedido es requerida" }),
    due_date: z.date().nullable().optional(),
    priority: z.string().min(1, "La prioridad es requerida"),
    notes: z.string().optional().default(""),
    lines: z.array(orderLineSchema).min(1, "Agrega al menos una línea"),
  })
  .superRefine((data, ctx) => {
    if (data.due_date && data.ordered_at && data.due_date < data.ordered_at) {
      ctx.addIssue({
        code: "custom",
        path: ["due_date"],
        message: "La entrega no puede ser antes de la fecha del pedido",
      });
    }
  });

export type OrderLineInput = z.input<typeof orderLineSchema>;
export type OrderFormInput = z.input<typeof orderSchema>;
export type OrderFormValues = z.output<typeof orderSchema>;

export const getEmptyLine = (base?: Partial<OrderLineInput>): OrderLineInput => ({
  model_id: null,
  size_id: null,
  material_type_id: null,
  color_id: null,
  plant_type_id: null,
  count: 1,
  pairs: 12,
  size_run: null,
  description: "",
  ...base,
});

export const getDefaultOrderValues = (customerId: number | null = null): OrderFormInput => ({
  customer_id: customerId,
  ordered_at: new Date(),
  due_date: null,
  priority: "NORMAL",
  notes: "",
  lines: [getEmptyLine()],
});
