import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  specialtySchema,
  getDefaultSpecialtyFormValues,
  type SpecialtyFormInput,
  type SpecialtyFormData,
} from "../schemas/SpecialtySchema";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { InputTextarea } from "primereact/inputtextarea";
import { InputNumber } from "primereact/inputnumber";
import { InputSwitch } from "primereact/inputswitch";
import type { Specialty } from "../types/specialty";
import { MultiSelect } from "primereact/multiselect";
// import { applyBackendErrors } from "@/shared/lib/applyBackendErrors";

interface Props {
  specialty?: Specialty | null;
  others: Specialty[]; // las demás etapas, para elegir cuáles no se usan junto con esta
  nextOrder: number; // posición sugerida para una etapa nueva: al final del proceso
  visible: boolean;
  onHide: () => void;
  onSubmit: (data: SpecialtyFormData) => Promise<void>;
  isLoading: boolean;
}

export const SpecialtyForm = ({
  specialty = null,
  others,
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
    setError,
    formState: { errors },
  } = useForm<SpecialtyFormInput>({
    resolver: zodResolver(specialtySchema),
    defaultValues: getDefaultSpecialtyFormValues(),
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
            excludes: specialty.excludes ?? [],
          }
        : { name: "", description: "", order: nextOrder, is_active: true, excludes: [], base_price: undefined },
    );
  }, [visible, specialty, nextOrder, reset]);

  // const submit = handleSubmit(async (data) => {
  //   try {
  //     await onSubmit(data as SpecialtyFormData);
  //   } catch (e) {
  //     if (!applyBackendErrors(e, setError, data)) throw e;
  //   }
  // });

  const footer = (
    <div className="flex justify-content-end align-items-center">
      <Button label="Cancelar" icon="pi pi-times" severity="secondary" outlined onClick={onHide} disabled={isLoading} />
      <Button
        label={isLoading ? "Guardando..." : "Guardar"}
        icon="pi pi-check"
        severity={specialty ? "warning" : "success"}
        loading={isLoading}
        onClick={handleSubmit(async (data) => {
          if (!specialty && data.base_price === undefined) {
            setError("base_price", { message: "Indica el precio base" });
            return;
          }
          // Al editar no se envía el precio base: se cambia desde Tarifas
          const { base_price: _ignored, ...rest } = data;
          await onSubmit(specialty ? rest : data);
        })}
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

        {/* Tarifa base: solo al crear. Es el precio de respaldo de la etapa. */}
        {!specialty && (
          <div className="flex flex-column gap-1">
            <label className="font-bold">Precio base por docena *</label>
            <Controller
              name="base_price"
              control={control}
              render={({ field }) => (
                <InputNumber
                  value={field.value ?? null}
                  onValueChange={(e) => field.onChange(e.value ?? undefined)}
                  mode="currency"
                  currency="PEN"
                  locale="es-PE"
                  min={0}
                  invalid={!!errors.base_price}
                />
              )}
            />
            {errors.base_price && <small className="p-error">{errors.base_price.message}</small>}
            <small className="text-color-secondary">
              Se crea junto con la etapa y se usa cuando ninguna otra tarifa aplica. Después puedes agregar tarifas
              por modelo, talla, material o planta; la base no se puede eliminar, solo cambiar su precio en Tarifas.
            </small>
          </div>
        )}

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

        {/* Etapas alternativas: ej. "Armado completo" no se usa junto con "Armador" ni "Pegador" */}
        <div className="flex flex-column gap-1">
          <label className="font-bold">No se usa junto con</label>
          <Controller
            name="excludes"
            control={control}
            render={({ field }) => (
              <MultiSelect
                value={field.value}
                onChange={(e) => field.onChange(e.value)}
                options={others.map((o) => ({ label: o.name, value: o.id }))}
                placeholder="Ninguna"
                display="chip"
                emptyMessage="No hay otras etapas"
              />
            )}
          />
          <small className="text-color-secondary">
            Para etapas alternativas: una docena usa una forma u otra (por ejemplo, Armado completo, o Armador y
            Pegador). Se aplica en ambos sentidos.
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
