import { useEffect, useRef, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { MultiSelect } from "primereact/multiselect";
import { InputText } from "primereact/inputtext";
import { InputNumber } from "primereact/inputnumber";
import api from "@/shared/lib/axios";
import type { Worker, Specialty } from "../types/worker";
import { InputSwitch } from "primereact/inputswitch";

const schema = z.object({
  specialties_ids: z.array(z.number()),
  names: z.string().min(1, "El nombre es obligatorio"),
  dni: z.string().min(8, "El DNI es obligatorio"),
  phone: z.string().optional().or(z.literal("")),
  address: z.string().optional().or(z.literal("")),
  email: z.string().email("Email inválido").optional().or(z.literal("")),
  password: z
    .string()
    .min(6, "La contraseña debe tener al menos 6 caracteres")
    .optional()
    .or(z.literal("")),
  is_active: z.boolean(),
  // Extra por docena de cada etapa, por id de especialidad (vacío o 0 = sin extra; puede ser negativo)
  extras: z.record(z.string(), z.number().nullable()),
});

type FormData = z.infer<typeof schema>;

// Lo que el formulario entrega: los extras ya en el formato del backend
export type WorkerSubmitData = Omit<FormData, "extras"> & {
  specialty_extras: { specialty: number; extra_price: number }[];
};

interface Props {
  worker?: Worker | null;
  visible: boolean;
  onHide: () => void;
  onSubmit: (data: WorkerSubmitData) => Promise<void>;
  isLoading: boolean;
}

export const WorkerForm = ({
  worker = null,
  visible,
  onHide,
  onSubmit,
  isLoading,
}: Props) => {
  const [specialties, setSpecialties] = useState<Specialty[]>([]);
  const [loadingData, setLoadingData] = useState(false);
  const loaded = useRef(false);

  const {
    handleSubmit,
    control,
    reset,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      specialties_ids: [],
      names: "",
      dni: "",
      phone: "",
      address: "",
      email: "",
      password: "",
      is_active: true,
      extras: {},
    },
  });

  useEffect(() => {
    if (!visible || loaded.current) return;

    loaded.current = true;

    const load = async () => {
      setLoadingData(true);

      try {
        const response = await api.get<Specialty[]>(
          "staff/specialties/?no_pagination=true",
        );

        setSpecialties(response.data);
      } catch {
        loaded.current = false;
      } finally {
        setLoadingData(false);
      }
    };

    load();
  }, [visible]);

  useEffect(() => {
    if (worker) {
      reset({
        specialties_ids: worker.specialties.map((specialty) => specialty.id),
        names: worker.names,
        dni: worker.dni,
        phone: worker.phone,
        address: worker.address,
        email: worker.email,
        password: worker.password,
        is_active: worker.is_active,
        extras: Object.fromEntries(
          (worker.rate_extras ?? []).map((extra) => [
            extra.specialty,
            Number(extra.extra_price),
          ]),
        ),
      });
    } else {
      reset({
        specialties_ids: [],
        names: "",
        dni: "",
        phone: "",
        address: "",
        email: "",
        password: "",
        is_active: true,
        extras: {},
      });
    }
  }, [worker, reset]);

  // Etapas elegidas ahora mismo: de ellas salen las filas de extra
  const selectedIds = watch("specialties_ids");
  const selectedSpecialties = selectedIds.map((id) => ({
    id,
    name:
      specialties.find((specialty) => specialty.id === id)?.name ??
      worker?.specialties.find((specialty) => specialty.id === id)?.name ??
      `Etapa ${id}`,
  }));

  // Convierte los extras del formulario al formato del backend.
  // Se envían todas las etapas elegidas: vacío cuenta como 0 y elimina el extra.
  const submit = handleSubmit(async ({ extras, ...data }) => {
    await onSubmit({
      ...data,
      specialty_extras: data.specialties_ids.map((id) => ({
        specialty: id,
        extra_price: extras[id] ?? 0,
      })),
    });
  });

  const footer = (
    <div className="flex justify-content-end align-items-center">
      <Button
        label="Cancelar"
        icon="pi pi-times"
        severity="secondary"
        outlined
        onClick={onHide}
        disabled={isLoading}
      />
      <Button
        label={isLoading ? "Guardando..." : "Guardar"}
        icon="pi pi-check"
        severity={worker ? "warning" : "success"}
        loading={isLoading}
        onClick={submit}
      />
    </div>
  );

  return (
    <Dialog
      visible={visible}
      onHide={() => {
        if (isLoading) return;
        onHide();
      }}
      header={worker ? "Editar Trabajador" : "Nuevo Trabajador"}
      footer={footer}
      closable={!isLoading}
      className="p-fluid sf-dialog"
      style={{ width: "40vw" }}
      breakpoints={{ "960px": "75vw", "641px": "90vw" }}
    >
      {loadingData ? (
        <div
          className="flex align-items-center justify-content-center"
          style={{ minHeight: "200px" }}
        >
          <i className="pi pi-spin pi-spinner" style={{ fontSize: "2rem" }} />
        </div>
      ) : (
        <div className="flex flex-column gap-3 pt-2">
          {/* Especialidades */}
          <div className="flex flex-column gap-1">
            <label className="font-bold">Especialidades *</label>

            <Controller
              name="specialties_ids"
              control={control}
              render={({ field }) => (
                <MultiSelect
                  value={field.value}
                  options={specialties}
                  onChange={(e) => field.onChange(e.value)}
                  optionLabel="name"
                  optionValue="id"
                  placeholder="Seleccione una o varias especialidades"
                  display="chip"
                  filter
                  className="sf-multiselect w-full"
                  invalid={!!errors.specialties_ids}
                  maxSelectedLabels={3}
                  selectedItemsLabel="{0} especialidades seleccionadas"
                />
              )}
            />

            {errors.specialties_ids && (
              <small className="p-error">
                {errors.specialties_ids.message}
              </small>
            )}
          </div>

          {/* Extra por etapa */}
          {selectedSpecialties.length > 0 && (
            <div className="flex flex-column gap-2">
              <label className="font-bold">Extra por docena (opcional)</label>
              <small className="text-color-secondary">
                Se suma a la tarifa base de la etapa. Usa un valor negativo para
                pagar menos. Vacío = sin extra.
              </small>

              <Controller
                name="extras"
                control={control}
                render={({ field }) => (
                  <div className="flex flex-column gap-2">
                    {selectedSpecialties.map((specialty) => (
                      <div
                        key={specialty.id}
                        className="flex align-items-center justify-content-between gap-3"
                      >
                        <span className="sf-tag amber">{specialty.name}</span>
                        <InputNumber
                          value={field.value[specialty.id] ?? null}
                          onValueChange={(e) =>
                            field.onChange({
                              ...field.value,
                              [specialty.id]: e.value ?? null,
                            })
                          }
                          mode="currency"
                          currency="PEN"
                          locale="es-PE"
                          placeholder="S/ 0.00"
                          inputStyle={{ width: "9rem" }}
                        />
                      </div>
                    ))}
                  </div>
                )}
              />
            </div>
          )}

          {/* Nombre */}
          <div className="flex flex-column gap-1">
            <label className="font-bold">Nombre *</label>
            <Controller
              name="names"
              control={control}
              render={({ field }) => (
                <InputText
                  {...field}
                  invalid={!!errors.names}
                  className="uppercase"
                />
              )}
            />
            {errors.names && (
              <small className="p-error">{errors.names.message}</small>
            )}
          </div>

          {/* DNI */}
          <div className="flex flex-column gap-1">
            <label className="font-bold">N° documento *</label>
            <Controller
              name="dni"
              control={control}
              render={({ field }) => (
                <InputText
                  {...field}
                  invalid={!!errors.dni}
                  className="uppercase"
                />
              )}
            />
            {errors.dni && (
              <small className="p-error">{errors.dni.message}</small>
            )}
          </div>

          {/* Teléfono */}
          <div className="flex flex-column gap-1">
            <label className="font-bold">Teléfono</label>
            <Controller
              name="phone"
              control={control}
              render={({ field }) => (
                <InputText {...field} invalid={!!errors.phone} />
              )}
            />
            {errors.phone && (
              <small className="p-error">{errors.phone.message}</small>
            )}
          </div>

          {/* Dirección */}
          <div className="flex flex-column gap-1">
            <label className="font-bold">Dirección</label>
            <Controller
              name="address"
              control={control}
              render={({ field }) => (
                <InputText
                  {...field}
                  invalid={!!errors.address}
                  className="uppercase"
                />
              )}
            />
            {errors.address && (
              <small className="p-error">{errors.address.message}</small>
            )}
          </div>

          {/* Email */}
          <div className="flex flex-column gap-1">
            <label className="font-bold">Email</label>
            <Controller
              name="email"
              control={control}
              render={({ field }) => (
                <InputText {...field} invalid={!!errors.email} />
              )}
            />
            {errors.email && (
              <small className="p-error">{errors.email.message}</small>
            )}
          </div>

          {/* Contraseña */}
          <div className="flex flex-column gap-1">
            <label className="font-bold">Contraseña</label>
            <Controller
              name="password"
              control={control}
              render={({ field }) => (
                <InputText
                  {...field}
                  type="password"
                  invalid={!!errors.password}
                />
              )}
            />
            {errors.password && (
              <small className="p-error">{errors.password.message}</small>
            )}
          </div>

          {/* Estado */}
          <div className="flex flex-column gap-1">
            <label className="font-bold">Estado</label>
            <Controller
              name="is_active"
              control={control}
              render={({ field }) => (
                <InputSwitch
                  checked={field.value}
                  onChange={(e) => field.onChange(e.value)}
                />
              )}
            />
          </div>
        </div>
      )}
    </Dialog>
  );
};
