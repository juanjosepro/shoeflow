import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { InputTextarea } from "primereact/inputtextarea";
import { InputNumber } from "primereact/inputnumber";
import { InputSwitch } from "primereact/inputswitch";
import type { Specialty, SpecialtyFormData } from "../types/specialty";

const schema = z.object({
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
});

interface Props {
  specialty?: Specialty | null;
  nextOrder: number; // posición sugerida para una etapa nueva: al final del proceso
  visible: boolean;
  onHide: () => void;
  onSubmit: (data: SpecialtyFormData) => Promise<void>;
  isLoading: boolean;
}

export const SpecialtyForm = ({
  specialty = null,
  nextOrder,
  visible,
  onHide,
  onSubmit,
  isLoading,
}: Props) => {
  const {
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<SpecialtyFormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      description: "",
      order: nextOrder,
      is_active: true,
    },
  });

  // Al abrir: datos de la especialidad a editar, o formulario vacío con la posición al final
  useEffect(() => {
    if (!visible) return;
    reset(
      specialty
        ? {
            name: specialty.name,
            description: specialty.description ?? "",
            order: specialty.order,
            is_active: specialty.is_active,
          }
        : { name: "", description: "", order: nextOrder, is_active: true },
    );
  }, [visible, specialty, nextOrder, reset]);

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
        severity={specialty ? "warning" : "success"}
        loading={isLoading}
        onClick={handleSubmit(onSubmit)}
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
      header={specialty ? "Editar especialidad" : "Nueva especialidad"}
      footer={footer}
      closable={!isLoading}
      className="p-fluid sf-dialog"
      style={{ width: "30vw" }}
      breakpoints={{ "960px": "60vw", "641px": "90vw" }}
    >
      <div className="flex flex-column gap-3 pt-2">
        <div className="flex flex-column gap-1">
          <label className="font-bold">Nombre *</label>
          <Controller
            name="name"
            control={control}
            render={({ field }) => (
              <InputText
                {...field}
                autoFocus
                invalid={!!errors.name}
                placeholder="Ej: Aparado"
              />
            )}
          />
          {errors.name && (
            <small className="p-error">{errors.name.message}</small>
          )}
        </div>

        <div className="flex flex-column gap-1">
          <label className="font-bold">Descripción</label>
          <Controller
            name="description"
            control={control}
            render={({ field }) => (
              <InputTextarea {...field} rows={3} autoResize />
            )}
          />
        </div>

        <div className="flex flex-column gap-1">
          <label className="font-bold">Posición en el proceso *</label>
          <Controller
            name="order"
            control={control}
            render={({ field }) => (
              <InputNumber
                value={field.value}
                onValueChange={(e) => field.onChange(e.value ?? undefined)}
                min={0}
                useGrouping={false}
                showButtons
                invalid={!!errors.order}
              />
            )}
          />
          {errors.order && (
            <small className="p-error">{errors.order.message}</small>
          )}
          <small className="text-color-secondary">
            La más baja va primero. También puedes cambiar el orden arrastrando
            las filas en la tabla.
          </small>
        </div>

        <div className="flex flex-column gap-1">
          <label className="font-bold">Estado</label>
          <Controller
            name="is_active"
            control={control}
            render={({ field }) => (
              <div className="flex align-items-center gap-2">
                <InputSwitch
                  checked={field.value}
                  onChange={(e) => field.onChange(e.value)}
                />
                <span>{field.value ? "Activa" : "Inactiva"}</span>
              </div>
            )}
          />
          <small className="text-color-secondary">
            Solo las activas son etapas de la fábrica: aparecen al asignar una
            docena y cuentan para completarla.
          </small>
        </div>
      </div>
    </Dialog>
  );
};
