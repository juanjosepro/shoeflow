import { z } from "zod";

export const workerSchema = z.object({
  specialties_ids: z.array(z.number()),
  names: z.string().min(1, "El nombre es obligatorio"),
  dni: z.string().min(8, "El DNI es obligatorio"),
  phone: z.string().optional().or(z.literal("")),
  address: z.string().optional().or(z.literal("")),
  email: z.string().email("Email inválido").optional().or(z.literal("")),
  password: z
    .string()
    .min(4, "El PIN debe tener al menos 4 caracteres")
    .optional()
    .or(z.literal("")),
  is_active: z.boolean(),
  // Extra por docena de cada etapa, por id de especialidad (vacío o 0 = sin extra; puede ser negativo)
  extras: z.record(z.string(), z.number().nullable()),
});

export type WorkerFormInput = z.input<typeof workerSchema>;
export type WorkerFormData = z.output<typeof workerSchema>;

export const getDefaultWorkerFormValues = (): WorkerFormInput => ({
  specialties_ids: [],
  names: "",
  dni: "",
  is_active: true,
  extras: {},
  phone: "",
  address: "",
  email: "",
  password: "",
});

// Lo que el formulario entrega: los extras ya en el formato del backend
export type WorkerSubmitData = Omit<WorkerFormData, "extras"> & {
  specialty_extras: { specialty: number; extra_price: number }[];
};