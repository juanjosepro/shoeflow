import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { InputTextarea } from "primereact/inputtextarea";
import { InputSwitch } from "primereact/inputswitch";
import type { CatalogItem } from "./../types/catalog";
import { applyBackendErrors } from "@/shared/lib/applyBackendErrors";
import {
  catalogSchema,
  getDefaultSpecialtyFormValues,
  type CatalogFormData,
  type CatalogFormInput,
} from "../schema/catalogSchema";

interface Props {
  item?: CatalogItem | null;
  visible: boolean;
  title: string; // "Nuevo material" o "Editar material"
  onHide: () => void;
  onSubmit: (data: CatalogFormData) => Promise<void>;
  isLoading: boolean;
  hasActive: boolean; // categorías y tallas no tienen estado
  descriptionLabel?: string;
  descriptionPlaceholder?: string;
}

export const CatalogForm = ({
  item = null,
  visible,
  title,
  onHide,
  onSubmit,
  isLoading,
  hasActive,
  descriptionLabel = "Descripción",
  descriptionPlaceholder,
}: Props) => {
  const {
    handleSubmit,
    control,
    reset,
    setError,
    formState: { errors },
  } = useForm<CatalogFormInput>({
    resolver: zodResolver(catalogSchema),
    defaultValues: getDefaultSpecialtyFormValues(),
  });

  // Al abrir: datos del registro a editar, o formulario vacío
  useEffect(() => {
    if (!visible) return;
    reset(
      item
        ? {
            name: item.name,
            description: item.description ?? "",
            is_active: item.is_active ?? true,
          }
        : getDefaultSpecialtyFormValues(),
    );
  }, [visible, item, reset]);

  // Categorías y tallas no tienen is_active: no se envía
  const submit = handleSubmit(async ({ is_active, ...data }) => {
    try {
      await onSubmit(
        hasActive ? { ...data, is_active } : (data as CatalogFormData),
      );
    } catch (e) {
      if (!applyBackendErrors(e, setError, data)) throw e;
    }
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
        severity={item ? "warning" : "success"}
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
      header={title}
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
              <InputText {...field} autoFocus invalid={!!errors.name} />
            )}
          />
          {errors.name && (
            <small className="p-error">{errors.name.message}</small>
          )}
        </div>

        <div className="flex flex-column gap-1">
          <label className="font-bold">{descriptionLabel}</label>
          <Controller
            name="description"
            control={control}
            render={({ field }) => (
              <InputTextarea
                {...field}
                rows={3}
                autoResize
                placeholder={descriptionPlaceholder}
              />
            )}
          />
        </div>

        {hasActive && (
          <div className="flex flex-column gap-1">
            <label className="font-bold">Estado</label>
            <Controller
              name="is_active"
              control={control}
              render={({ field }) => (
                <div className="flex align-items-center gap-2">
                  <InputSwitch
                    checked={!!field.value}
                    onChange={(e) => field.onChange(e.value)}
                  />
                  <span>{field.value ? "Activo" : "Inactivo"}</span>
                </div>
              )}
            />
            <small style={{ color: "var(--sf-ink-2)" }} className="mt-2">
              Los inactivos dejan de ofrecerse al registrar docenas y tarifas,
              pero no se pierde el historial.
            </small>
          </div>
        )}
      </div>
    </Dialog>
  );
};
