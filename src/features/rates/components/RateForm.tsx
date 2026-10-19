import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { Dropdown } from "primereact/dropdown";
import { InputNumber } from "primereact/inputnumber";
import type { Rate, RateFormData, RateOptions } from "../types/rate";

const schema = z.object({
  specialty: z.number({ error: "Selecciona la etapa" }),
  model: z.number().nullable(),
  size: z.number().nullable(),
  material_type: z.number().nullable(),
  plant_type: z.number().nullable(),
  price: z
    .number({ error: "Indica el precio" })
    .min(0, "El precio no puede ser negativo"),
});

const EMPTY: Partial<RateFormData> = {
  specialty: undefined,
  model: null,
  size: null,
  material_type: null,
  plant_type: null,
  price: undefined,
};

interface Props {
  rate?: Rate | null;
  visible: boolean;
  onHide: () => void;
  onSubmit: (data: RateFormData) => Promise<void>;
  isLoading: boolean;
  options: RateOptions;
}

export const RateForm = ({
  rate = null,
  visible,
  onHide,
  onSubmit,
  isLoading,
  options,
}: Props) => {
  const {
    handleSubmit,
    control,
    reset,
    watch,
    formState: { errors },
  } = useForm<RateFormData>({
    resolver: zodResolver(schema),
    defaultValues: EMPTY,
  });

  // Al abrir: datos de la tarifa a editar, o formulario vacío
  useEffect(() => {
    if (!visible) return;
    if (rate) {
      reset({
        specialty: rate.specialty,
        model: rate.model,
        size: rate.size,
        material_type: rate.material_type,
        plant_type: rate.plant_type,
        price: Number(rate.price),
      });
    } else {
      reset(EMPTY);
    }
  }, [visible, rate, reset]);

  // Resumen en vivo de a qué docenas se aplicaría la regla
  const values = watch();
  const nameOf = (
    list: { id: number; name: string }[],
    id: number | null | undefined,
  ) => list.find((item) => item.id === id)?.name;

  const summary = [
    nameOf(options.models, values.model) &&
      `modelo ${nameOf(options.models, values.model)}`,
    nameOf(options.sizes, values.size) &&
      `talla ${nameOf(options.sizes, values.size)}`,
    nameOf(options.materialTypes, values.material_type),
    nameOf(options.plantTypes, values.plant_type) &&
      `planta ${nameOf(options.plantTypes, values.plant_type)}`,
  ].filter(Boolean);

  // Un selector de condición: opcional, con la opción de dejarlo en "Cualquiera"
  const conditionField = (
    name: "model" | "size" | "material_type" | "plant_type",
    label: string,
    items: { id: number; name: string }[],
  ) => (
    <div className="flex flex-column gap-1">
      <label className="font-bold">{label}</label>
      <Controller
        name={name}
        control={control}
        render={({ field }) => (
          <Dropdown
            value={field.value}
            options={items}
            optionLabel="name"
            optionValue="id"
            onChange={(e) => field.onChange(e.value ?? null)}
            placeholder="Cualquiera"
            showClear
            filter
          />
        )}
      />
    </div>
  );

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
        severity={rate ? "warning" : "success"}
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
      header={rate ? "Editar tarifa" : "Nueva tarifa"}
      footer={footer}
      closable={!isLoading}
      className="p-fluid sf-dialog"
      style={{ width: "40vw" }}
      breakpoints={{ "960px": "75vw", "641px": "90vw" }}
    >
      <div className="flex flex-column gap-3 pt-2">
        {/* Etapa */}
        <div className="flex flex-column gap-1">
          <label className="font-bold">Etapa *</label>
          <Controller
            name="specialty"
            control={control}
            render={({ field }) => (
              <Dropdown
                value={field.value}
                options={options.specialties}
                optionLabel="name"
                optionValue="id"
                onChange={(e) => field.onChange(e.value)}
                placeholder="Selecciona la etapa"
                filter
                invalid={!!errors.specialty}
              />
            )}
          />
          {errors.specialty && (
            <small className="p-error">{errors.specialty.message}</small>
          )}
        </div>

        {/* Condiciones: todas opcionales */}
        <small className="text-color-secondary">
          Deja una condición en "Cualquiera" si la tarifa no depende de ella.
          Sin ninguna condición, es la tarifa general de la etapa.
        </small>
        <div className="grid">
          <div className="col-12 md:col-6">
            {conditionField("model", "Modelo", options.models)}
          </div>
          <div className="col-12 md:col-6">
            {conditionField("size", "Talla", options.sizes)}
          </div>
          <div className="col-12 md:col-6">
            {conditionField("material_type", "Material", options.materialTypes)}
          </div>
          <div className="col-12 md:col-6">
            {conditionField("plant_type", "Planta", options.plantTypes)}
          </div>
        </div>

        {/* Precio por docena completa */}
        <div className="flex flex-column gap-1">
          <label className="font-bold">Precio por docena *</label>
          <Controller
            name="price"
            control={control}
            render={({ field }) => (
              <InputNumber
                value={field.value ?? null}
                onValueChange={(e) => field.onChange(e.value ?? undefined)}
                mode="currency"
                currency="PEN"
                locale="es-PE"
                min={0}
                invalid={!!errors.price}
              />
            )}
          />
          {errors.price && (
            <small className="p-error">{errors.price.message}</small>
          )}
          <small className="text-color-secondary">
            Es el precio de 12 pares; una docena incompleta paga la parte
            proporcional.
          </small>
        </div>

        {/* Resumen */}
        <div className="p-3 border-round surface-100">
          <small>
            Se aplicará a:{" "}
            <strong>
              {summary.length
                ? summary.join(" · ")
                : "cualquier docena de esta etapa"}
            </strong>
            {summary.length > 0 && (
              <span className="text-color-secondary">
                {" "}
                (más específica, gana sobre la general)
              </span>
            )}
          </small>
        </div>
      </div>
    </Dialog>
  );
};
