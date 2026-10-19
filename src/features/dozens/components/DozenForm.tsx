import { useEffect, useTransition } from "react";
import { useNavigate } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { Dozen, CatalogOptions, DozenMetadata } from "../types/dozen";
import {
  dozenSchema,
  getDefaultDozenFormValues,
  type DozenFormInput,
  type DozenFormData,
} from "../schemas/dozenSchema";
import type { Model } from "@/features/models/types/model";
import CheckRadio from "@/shared/components/CheckRadio";
import { Button } from "primereact/button";
import { InputNumber } from "primereact/inputnumber";
import { InputTextarea } from "primereact/inputtextarea";
import { Calendar } from "primereact/calendar";

interface DozenFormProps {
  saveAction: (data: DozenFormData) => Promise<unknown>;
  isEditing?: boolean;
  models: Model[];
  metadata: DozenMetadata;
  options: CatalogOptions;
  dozen?: Dozen | null;
}

// Fila de chips para elegir una opción (se repite en modelo, talla, material, etc.)
interface ChipOption {
  hex?: string;
  value: number | string;
  label: string;
}

interface OptionChipsProps {
  title: string;
  name: string;
  options: ChipOption[];
  selected: number | string | null | undefined;
  onSelect: (value: number | string) => void;
  error?: string;
  locked?: boolean; // true = no se puede cambiar
  children?: React.ReactNode;
}

const OptionChips = ({
  title,
  name,
  options,
  selected,
  onSelect,
  error,
  locked = false,
}: OptionChipsProps) => (
  <div className="flex flex-column gap-1">
    <label className="font-bold">{title}</label>
    <div
      className="sf-chip-scroll"
      style={locked ? { pointerEvents: "none", opacity: 0.6 } : undefined}
    >
      {options.map((option) => (
        <CheckRadio
          key={option.value}
          label={option.label}
          valueCheck={option.value}
          name={name}
          value={selected}
          hex={option.hex}
          onChange={() => onSelect(option.value)}
        ></CheckRadio>
      ))}
    </div>
    {error && <small className="p-error">{error}</small>}
  </div>
);

const DozenForm = ({
  saveAction,
  isEditing,
  models,
  metadata,
  options,
  dozen,
}: DozenFormProps) => {
  const navigate = useNavigate();
  const [pending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<DozenFormInput>({
    resolver: zodResolver(dozenSchema),
    defaultValues: getDefaultDozenFormValues(),
  });

  useEffect(() => {
    if (dozen) {
      reset({
        registered_at: new Date(dozen.registered_at),
        count: 1,
        pairs: dozen.pairs,
        model_id: dozen.model.id,
        size_id: dozen.size.id,
        material_type_id: dozen.material_type.id,
        color_id: dozen.color.id,
        plant_type_id: dozen.plant_type.id,
        priority: dozen.priority,
        description: dozen.description || "",
        is_active: dozen.is_active ?? true,
        status: dozen.status,
      });
    } else {
      reset(getDefaultDozenFormValues());
    }
  }, [dozen, reset]);

  const onSubmit = (data: DozenFormData) => {
    startTransition(async () => {
      const result = await saveAction(data);

      if (result && typeof result === "object" && "error" in result) return;

      if (isEditing) {
        navigate("/production/dozens");
        return;
      }

      reset(getDefaultDozenFormValues());
    });
  };

  const pairsVal = watch("pairs");

  // Con etapas asignadas, lo que fija el precio ya no se puede cambiar
  const hasAssignments = Boolean(isEditing && dozen?.assignments?.length);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="sf-form mt-4">
      <div className="flex flex-column gap-4 mb-5">
        {hasAssignments && (
          <small style={{ color: "var(--sf-ink-2)" }}>
            Esta docena ya tiene etapas asignadas: el modelo, la talla, el
            material, la planta y los pares no se pueden cambiar.
          </small>
        )}

        {/* Fecha, cantidad de docenas y pares */}
        <div className="grid">
          <div className="col-12 md:col-4 flex flex-column gap-1">
            <label className="font-bold">Fecha de Registro</label>
            <Controller
              name="registered_at"
              control={control}
              render={({ field }) => (
                <Calendar
                  id="registered_at"
                  value={field.value}
                  onChange={(e) => field.onChange(e.value)}
                  showIcon
                  dateFormat="dd/mm/yy"
                  locale="es"
                  autoFocus={false}
                  readOnlyInput
                  touchUI
                  inputStyle={{ boxShadow: "none" }}
                  className="w-full sf-calendar"
                  panelClassName="md:!w-15rem lg:!w-18rem xl:!w-20rem"
                  panelStyle={{ minWidth: "auto" }}
                />
              )}
            />
            {errors.registered_at && (
              <small className="p-error">{errors.registered_at.message}</small>
            )}
          </div>

          {/* Al crear: cuántas docenas. Al editar no aplica (cada docena es un registro) */}
          {!isEditing && (
            <div className="col-12 md:col-4 flex flex-column gap-1">
              <label className="font-bold">Cantidad de docenas</label>
              <Controller
                name="count"
                control={control}
                render={({ field }) => (
                  <InputNumber
                    id="count"
                    value={field.value}
                    onValueChange={(e) => field.onChange(e.value)}
                    min={1}
                    max={100}
                    showButtons
                    buttonLayout="horizontal"
                    step={1}
                    decrementButtonClassName="p-button-secondary"
                    incrementButtonClassName="p-button-secondary"
                    incrementButtonIcon="pi pi-plus"
                    decrementButtonIcon="pi pi-minus"
                    className="w-full"
                  />
                )}
              />
              {errors.count && (
                <small className="p-error">{errors.count.message}</small>
              )}
            </div>
          )}

          <div className="col-12 md:col-4 flex flex-column gap-1">
            <label className="font-bold">Pares por docena</label>
            <Controller
              name="pairs"
              control={control}
              render={({ field }) => (
                <InputNumber
                  id="pairs"
                  value={field.value}
                  onValueChange={(e) => field.onChange(e.value)}
                  min={1}
                  max={12}
                  showButtons
                  buttonLayout="horizontal"
                  step={1}
                  disabled={hasAssignments}
                  decrementButtonClassName="p-button-secondary"
                  incrementButtonClassName="p-button-secondary"
                  incrementButtonIcon="pi pi-plus"
                  decrementButtonIcon="pi pi-minus"
                  className="w-full"
                />
              )}
            />
            <small style={{ color: "var(--sf-ink-2)" }}>
              12 = docena completa. Con {pairsVal ?? 12} pares se paga{" "}
              {pairsVal ?? 12}/12 de la tarifa.
            </small>
            {errors.pairs && (
              <small className="p-error">{errors.pairs.message}</small>
            )}
          </div>
        </div>

        <OptionChips
          title="Modelo"
          name="model_id"
          options={models.map((m) => ({ value: m.id, label: m.name }))}
          selected={watch("model_id")}
          onSelect={(value) =>
            setValue("model_id", Number(value), { shouldValidate: true })
          }
          error={errors.model_id?.message}
          locked={hasAssignments}
        />

        <OptionChips
          title="Talla"
          name="size_id"
          options={options.sizes.map((s) => ({
            value: s.id,
            label: s.description ? `${s.name} (${s.description})` : s.name,
          }))}
          selected={watch("size_id")}
          onSelect={(value) =>
            setValue("size_id", Number(value), { shouldValidate: true })
          }
          error={errors.size_id?.message}
          locked={hasAssignments}
        />

        <OptionChips
          title="Material"
          name="material_type_id"
          options={options.materialTypes.map((m) => ({
            value: m.id,
            label: m.name,
          }))}
          selected={watch("material_type_id")}
          onSelect={(value) =>
            setValue("material_type_id", Number(value), {
              shouldValidate: true,
            })
          }
          error={errors.material_type_id?.message}
          locked={hasAssignments}
        />

        <OptionChips
          title="Color Principal"
          name="color_id"
          options={options.colors.map((c) => ({
            value: c.id,
            label: c.name,
            hex: c.hex_code,
          }))}
          selected={watch("color_id")}
          onSelect={(value) =>
            setValue("color_id", Number(value), { shouldValidate: true })
          }
          error={errors.color_id?.message}
        ></OptionChips>

        <OptionChips
          title="Tipo de Planta"
          name="plant_type_id"
          options={options.plantTypes.map((p) => ({
            value: p.id,
            label: p.name,
          }))}
          selected={watch("plant_type_id")}
          onSelect={(value) =>
            setValue("plant_type_id", Number(value), { shouldValidate: true })
          }
          error={errors.plant_type_id?.message}
          locked={hasAssignments}
        />

        <OptionChips
          title="Prioridad"
          name="priority"
          options={(metadata?.priorities ?? []).map((p) => ({
            value: p.key,
            label: p.label,
          }))}
          selected={watch("priority")}
          onSelect={(value) =>
            setValue("priority", String(value), { shouldValidate: true })
          }
          error={errors.priority?.message}
        />

        {/* Nota Adicional */}
        <div className="flex flex-column gap-1">
          <label className="font-bold">Nota Adicional</label>
          <InputTextarea
            id="description"
            rows={4}
            {...register("description")}
            className="w-full"
          />
          {errors.description && (
            <small className="p-error">{errors.description.message}</small>
          )}
        </div>
      </div>

      {/* Botón guardar */}
      <div className="flex justify-content-end mb-5">
        <Button
          type="submit"
          severity="success"
          label={pending ? "Guardando..." : "Guardar"}
          icon="pi pi-check"
          loading={pending}
        />
      </div>
    </form>
  );
};

export default DozenForm;
