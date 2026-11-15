// [PED] ARCHIVO NUEVO ─ features/orders/components/OrderLineCard.tsx
import { useState } from "react";
import { Button } from "primereact/button";
import { Dropdown } from "primereact/dropdown";
import { InputNumber } from "primereact/inputnumber";
import { InputText } from "primereact/inputtext";
import { Controller, useFormContext, useWatch } from "react-hook-form";
import type { CatalogOptions } from "@/features/dozens/types/dozen";
import type { Model } from "@/features/models/types/model";
import SizeRunEditor from "@/features/dozens/components/SizeRunEditor";
import type { OrderFormInput } from "../schemas/orderSchema";
import { InputTextarea } from "primereact/inputtextarea";

interface Props {
  index: number;
  models: Model[];
  options: CatalogOptions;
  canRemove: boolean;
  onRemove: () => void;
  onDuplicate: () => void;
}

// Una línea del pedido: "qué calzado y cuántas docenas". Todo con listas desplegables compactas
// (con buscador) para poder cargar varias líneas rápido; "Duplicar" copia la línea y solo se cambia la talla.
const OrderLineCard = ({
  index,
  models,
  options,
  canRemove,
  onRemove,
  onDuplicate,
}: Props) => {
  const {
    control,
    register,
    formState: { errors },
  } = useFormContext<OrderFormInput>();
  const lineErrors = errors.lines?.[index];
  const [showRun, setShowRun] = useState(false);

  const count = useWatch({ control, name: `lines.${index}.count` }) ?? 1;
  const pairs = useWatch({ control, name: `lines.${index}.pairs` }) ?? 12;
  const sizeRun = useWatch({ control, name: `lines.${index}.size_run` });
  const hasRun = !!sizeRun && Object.keys(sizeRun).length > 0;

  const invalid = Boolean(lineErrors);
  const field = (name: string) => `lines.${index}.${name}`;

  // Dropdown genérico con id numérico
  const pick = (
    name:
      | "model_id"
      | "size_id"
      | "material_type_id"
      | "color_id"
      | "plant_type_id",
    label: string,
    list: { id: number; label: string; hex?: string }[],
    opts: { optional?: boolean; error?: string } = {},
  ) => (
    <div className="col-6 sm:col-6 lg:col-4 flex flex-column gap-1">
      <label className="font-bold" htmlFor={field(name)}>
        {label}
        {opts.optional && (
          <span style={{ fontWeight: 400, color: "var(--ink-2)" }}>
            {" "}
            (opcional)
          </span>
        )}
      </label>
      <Controller
        name={`lines.${index}.${name}`}
        control={control}
        render={({ field: f }) => (
          <Dropdown
            inputId={field(name)}
            value={f.value ?? null}
            options={list}
            optionLabel="label"
            optionValue="id"
            onChange={(e) => f.onChange(e.value ?? null)}
            filter={list.length > 6}
            showClear={opts.optional}
            placeholder="Elegir..."
            invalid={!!opts.error}
            className="w-full"
            itemTemplate={(o: { label: string; hex?: string }) => (
              <span>
                {o.hex && (
                  <span className="sfo-swatch" style={{ background: o.hex }} />
                )}
                {o.label}
              </span>
            )}
          />
        )}
      />
      {opts.error && <small className="p-error">{opts.error}</small>}
    </div>
  );

  return (
    <div className={`sfo-line${invalid ? " invalid" : ""}`}>
      <div className="sfo-line-head">
        <div>
          <span className="sfo-line-title">Línea {index + 1}</span>
          <div className="sfo-line-meta">
            {count} {count === 1 ? "docena" : "docenas"} × {pairs} pares ={" "}
            {count * pairs} pares
          </div>
        </div>
        <div className="flex gap-1">
          <Button
            type="button"
            icon="pi pi-copy"
            text
            severity="secondary"
            tooltip="Duplicar línea"
            tooltipOptions={{ position: "left" }}
            onClick={onDuplicate}
          />
          <Button
            type="button"
            icon="pi pi-trash"
            text
            severity="danger"
            tooltip="Quitar línea"
            tooltipOptions={{ position: "left" }}
            disabled={!canRemove}
            onClick={onRemove}
          />
        </div>
      </div>

      <div className="grid">
        {pick(
          "model_id",
          "Modelo",
          models.map((m) => ({ id: m.id, label: m.name })),
          { error: lineErrors?.model_id?.message },
        )}
        {pick(
          "size_id",
          "Talla",
          options.sizes.map((s) => ({
            id: s.id,
            label: s.description ? `${s.name} (${s.description})` : s.name,
          })),
          { error: lineErrors?.size_id?.message },
        )}
        {pick(
          "material_type_id",
          "Material",
          options.materialTypes.map((m) => ({ id: m.id, label: m.name })),
          {
            error: lineErrors?.material_type_id?.message,
          },
        )}
        {pick(
          "color_id",
          "Color",
          options.colors.map((c) => ({
            id: c.id,
            label: c.name,
            hex: c.hex_code,
          })),
          {
            error: lineErrors?.color_id?.message,
          },
        )}
        {pick(
          "plant_type_id",
          "Planta",
          options.plantTypes.map((p) => ({ id: p.id, label: p.name })),
          { optional: true },
        )}

        {/* Cantidad y pares lado a lado */}
        <div className="col-6 sm:col-4 flex flex-column gap-1">
          <label className="font-bold">Docenas</label>
          <Controller
            name={`lines.${index}.count`}
            control={control}
            render={({ field: f }) => (
              <InputNumber
                value={f.value}
                onValueChange={(e) => f.onChange(e.value)}
                min={1}
                max={100}
                showButtons
                buttonLayout="horizontal"
                decrementButtonClassName="p-button-secondary"
                incrementButtonClassName="p-button-secondary"
                incrementButtonIcon="pi pi-plus"
                decrementButtonIcon="pi pi-minus"
                inputClassName="w-full text-center"
                className="w-full"
              />
            )}
          />
          {lineErrors?.count && (
            <small className="p-error">{lineErrors.count.message}</small>
          )}
        </div>

        <div className="col-6 sm:col-4 flex flex-column gap-1">
          <label className="font-bold">Pares c/u</label>
          <Controller
            name={`lines.${index}.pairs`}
            control={control}
            render={({ field: f }) => (
              <InputNumber
                value={f.value}
                onValueChange={(e) => f.onChange(e.value)}
                min={1}
                max={12}
                showButtons
                buttonLayout="horizontal"
                decrementButtonClassName="p-button-secondary"
                incrementButtonClassName="p-button-secondary"
                incrementButtonIcon="pi pi-plus"
                decrementButtonIcon="pi pi-minus"
                inputClassName="w-full text-center"
                className="w-full"
              />
            )}
          />
          {lineErrors?.pairs && (
            <small className="p-error">{lineErrors.pairs.message}</small>
          )}
        </div>

        <div className="col-12 flex flex-column gap-1">
          <label className="font-bold">
            Nota de la línea{" "}
            <span style={{ fontWeight: 400, color: "var(--ink-2)" }}>
              (opcional)
            </span>
          </label>
          <InputTextarea
            {...register(`lines.${index}.description`)}
            rows={2}
            autoResize
            className="w-full"
            placeholder="Ej. forro blanco, suela alta"
          />
        </div>
      </div>

      {/* Serie de tallas: plegada por defecto para no ensuciar el formulario */}
      <div className="mt-3">
        {showRun || hasRun ? (
          <Controller
            name={`lines.${index}.size_run`}
            control={control}
            render={({ field: f }) => (
              <SizeRunEditor
                value={f.value}
                totalPairs={pairs}
                onChange={f.onChange}
                error={lineErrors?.size_run?.message}
              />
            )}
          />
        ) : (
          <Button
            type="button"
            label="Mezclar tallas (serie de tallas)"
            icon="pi pi-sliders-h"
            size="small"
            className="sf-btn--teal sf-btn--soft"
            onClick={() => setShowRun(true)}
          />
        )}
      </div>
    </div>
  );
};

export default OrderLineCard;
