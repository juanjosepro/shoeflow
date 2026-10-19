import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { ColorPicker } from "primereact/colorpicker";
import { InputText } from "primereact/inputtext";
import { InputSwitch } from "primereact/inputswitch";
import type { Color, ColorFormData } from "../types/color";
import { COLOR_PRESETS, HEX_REGEX, readableOn } from "../utils/colorUtils";

const schema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "El nombre es obligatorio")
    .max(100, "Máximo 100 caracteres"),
  hex_code: z
    .string()
    .regex(HEX_REGEX, "Usa el formato #RRGGBB, por ejemplo #FF0000"),
  is_active: z.boolean(),
});

const EMPTY: ColorFormData = { name: "", hex_code: "#FFFFFF", is_active: true };

interface Props {
  color?: Color | null;
  visible: boolean;
  onHide: () => void;
  onSubmit: (data: ColorFormData) => Promise<void>;
  isLoading: boolean;
}

export const ColorForm = ({
  color = null,
  visible,
  onHide,
  onSubmit,
  isLoading,
}: Props) => {
  const {
    handleSubmit,
    control,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ColorFormData>({
    resolver: zodResolver(schema),
    defaultValues: EMPTY,
  });

  // Al abrir: datos del color a editar, o formulario vacío
  useEffect(() => {
    if (!visible) return;
    reset(
      color
        ? {
            name: color.name,
            hex_code: color.hex_code,
            is_active: color.is_active,
          }
        : EMPTY,
    );
  }, [visible, color, reset]);

  const hex = watch("hex_code");
  const name = watch("name");
  const validHex = HEX_REGEX.test(hex);

  const applyPreset = (preset: { name: string; hex: string }) => {
    setValue("hex_code", preset.hex, { shouldValidate: true });
    // El nombre solo se rellena si todavía está vacío: no pisa lo que escribió el usuario
    if (!name.trim()) setValue("name", preset.name, { shouldValidate: true });
  };

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
        severity={color ? "warning" : "success"}
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
      header={color ? "Editar color" : "Nuevo color"}
      footer={footer}
      closable={!isLoading}
      className="p-fluid sf-dialog"
      style={{ width: "32vw" }}
      breakpoints={{ "960px": "60vw", "641px": "90vw" }}
    >
      <div className="flex flex-column gap-3 pt-2">
        {/* Vista previa en vivo */}
        <div
          className="flex align-items-end justify-content-between border-round-xl p-3"
          style={{
            height: "6rem",
            background: validHex ? hex : "var(--surface-200)",
            border: "1px solid var(--surface-border)",
            color: readableOn(hex),
          }}
        >
          <strong>{name.trim() || "Nombre del color"}</strong>
          <span style={{ fontFamily: "ui-monospace, monospace" }}>
            {validHex ? hex.toUpperCase() : "—"}
          </span>
        </div>

        {/* Colores comunes */}
        <div className="flex flex-column gap-2">
          <small className="text-color-secondary">Colores comunes</small>
          <div className="flex flex-wrap gap-2">
            {COLOR_PRESETS.map((preset) => (
              <button
                key={preset.hex}
                type="button"
                title={preset.name}
                aria-label={preset.name}
                onClick={() => applyPreset(preset)}
                className="border-circle cursor-pointer"
                style={{
                  width: "1.9rem",
                  height: "1.9rem",
                  background: preset.hex,
                  border:
                    hex.toUpperCase() === preset.hex
                      ? "3px solid var(--primary-color)"
                      : "1px solid var(--surface-border)",
                }}
              />
            ))}
          </div>
        </div>

        <div className="flex flex-column gap-1">
          <label className="font-bold">Nombre *</label>
          <Controller
            name="name"
            control={control}
            render={({ field }) => (
              <InputText
                {...field}
                invalid={!!errors.name}
                placeholder="Ej: Azul acero"
              />
            )}
          />
          {errors.name && (
            <small className="p-error">{errors.name.message}</small>
          )}
        </div>

        <div className="flex flex-column gap-1">
          <label className="font-bold">Código hexadecimal *</label>
          <div className="flex align-items-center gap-2">
            <Controller
              name="hex_code"
              control={control}
              render={({ field }) => (
                <>
                  {/* Selector visual: el valor va sin "#" */}
                  <ColorPicker
                    format="hex"
                    value={validHex ? field.value.slice(1) : "FFFFFF"}
                    onChange={(e) =>
                      field.onChange(`#${String(e.value).toUpperCase()}`)
                    }
                  />
                  <InputText
                    value={field.value}
                    onChange={(e) => {
                      // Acepta pegar el código con o sin "#"
                      const raw = e.target.value.trim().replace(/^#*/, "");
                      field.onChange(`#${raw.toUpperCase()}`);
                    }}
                    maxLength={7}
                    invalid={!!errors.hex_code}
                    placeholder="#RRGGBB"
                    style={{ fontFamily: "ui-monospace, monospace" }}
                  />
                </>
              )}
            />
          </div>
          {errors.hex_code && (
            <small className="p-error">{errors.hex_code.message}</small>
          )}
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
                <span>{field.value ? "Activo" : "Inactivo"}</span>
              </div>
            )}
          />
        </div>
      </div>
    </Dialog>
  );
};
