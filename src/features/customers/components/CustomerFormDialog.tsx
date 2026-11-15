// [PED] ARCHIVO NUEVO ─ features/customers/components/CustomerFormDialog.tsx
import { useEffect, useState } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { InputTextarea } from "primereact/inputtextarea";
import { InputSwitch } from "primereact/inputswitch";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "@/shared/lib/toast";
import useMediaQuery from "@/shared/hooks/useMediaQuery";
import {
  customerSchema,
  getDefaultCustomerValues,
  type CustomerFormInput,
  type CustomerFormValues,
} from "../schemas/customerSchema";
import type { Customer, CustomerFormData } from "../types/customer";

interface Props {
  visible: boolean;
  customer?: Customer | null; // con valor = editar
  onHide: () => void;
  // Debe guardar y devolver (lanzar error si falla)
  onSave: (data: CustomerFormData) => Promise<unknown>;
}

// Convierte los errores del backend ({document: ["..."]}) en mensajes bajo cada campo
const readServerErrors = (error: unknown): Record<string, string> => {
  const data = (error as { response?: { data?: unknown } })?.response?.data;
  const out: Record<string, string> = {};
  if (data && typeof data === "object") {
    Object.entries(data as Record<string, unknown>).forEach(([key, value]) => {
      out[key] = Array.isArray(value) ? String(value[0]) : String(value);
    });
  }
  return out;
};

const CustomerFormDialog = ({ visible, customer, onHide, onSave }: Props) => {
  const isLaptopUp = useMediaQuery("(min-width: 1024px)");
  const [saving, setSaving] = useState(false);
  const isEditing = Boolean(customer);

  const {
    register,
    handleSubmit,
    control,
    reset,
    setError,
    formState: { errors },
  } = useForm<CustomerFormInput>({
    resolver: zodResolver(customerSchema),
    defaultValues: getDefaultCustomerValues(),
  });

  // Cada vez que se abre: datos del cliente o formulario vacío
  useEffect(() => {
    if (!visible) return;
    reset(
      customer
        ? {
            name: customer.name,
            document: customer.document ?? "",
            phone: customer.phone,
            email: customer.email,
            address: customer.address,
            notes: customer.notes,
            is_active: customer.is_active,
          }
        : getDefaultCustomerValues(),
    );
  }, [visible, customer, reset]);

  const submit = async (values: CustomerFormInput) => {
    const data = values as CustomerFormValues;
    setSaving(true);
    try {
      await onSave({ ...data, document: data.document || null });
      toast.success(isEditing ? "Cliente actualizado." : "Cliente creado.");
      onHide();
    } catch (error) {
      const serverErrors = readServerErrors(error);
      const fields = Object.keys(getDefaultCustomerValues()) as (keyof CustomerFormInput)[];
      let shown = false;
      fields.forEach((field) => {
        if (serverErrors[field]) {
          setError(field, { message: serverErrors[field] });
          shown = true;
        }
      });
      if (!shown) toast.error(serverErrors.detail ?? "No se pudo guardar el cliente.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog
      header={isEditing ? "Editar cliente" : "Nuevo cliente"}
      visible={visible}
      onHide={onHide}
      position={isLaptopUp ? "center" : "bottom"}
      style={{ width: isLaptopUp ? "42rem" : "100vw" }}
      maskStyle={{ backdropFilter: "blur(4px)" }}
      className="sf-dialog"
      footer={
        <div className="flex justify-content-end gap-2">
          <Button label="Cancelar" icon="pi pi-times" outlined severity="secondary" onClick={onHide} type="button" />
          <Button
            label={saving ? "Guardando..." : "Guardar"}
            icon="pi pi-check"
            severity="success"
            loading={saving}
            onClick={handleSubmit(submit)}
          />
        </div>
      }
    >
      <form onSubmit={handleSubmit(submit)} className="sf-form grid mt-1">
        <div className="col-12 md:col-8 flex flex-column gap-1">
          <label className="font-bold" htmlFor="c-name">Nombre o razón social *</label>
          <InputText id="c-name" autoFocus {...register("name")} className="w-full" placeholder="Ej. Calzados El Paso SAC" />
          {errors.name && <small className="p-error">{errors.name.message}</small>}
        </div>

        <div className="col-12 md:col-4 flex flex-column gap-1">
          <label className="font-bold" htmlFor="c-doc">DNI / RUC</label>
          <InputText id="c-doc" inputMode="numeric" {...register("document")} className="w-full" placeholder="Opcional" />
          {errors.document && <small className="p-error">{errors.document.message}</small>}
        </div>

        <div className="col-12 md:col-6 flex flex-column gap-1">
          <label className="font-bold" htmlFor="c-phone">Teléfono</label>
          <InputText id="c-phone" inputMode="tel" {...register("phone")} className="w-full" placeholder="Ej. 987 654 321" />
          {errors.phone && <small className="p-error">{errors.phone.message}</small>}
        </div>

        <div className="col-12 md:col-6 flex flex-column gap-1">
          <label className="font-bold" htmlFor="c-email">Correo</label>
          <InputText id="c-email" inputMode="email" {...register("email")} className="w-full" placeholder="Opcional" />
          {errors.email && <small className="p-error">{errors.email.message}</small>}
        </div>

        <div className="col-12 flex flex-column gap-1">
          <label className="font-bold" htmlFor="c-address">Dirección</label>
          <InputText id="c-address" {...register("address")} className="w-full" placeholder="Opcional" />
          {errors.address && <small className="p-error">{errors.address.message}</small>}
        </div>

        <div className="col-12 flex flex-column gap-1">
          <label className="font-bold" htmlFor="c-notes">Notas</label>
          <InputTextarea id="c-notes" rows={3} {...register("notes")} className="w-full" placeholder="Ej. Recoge los viernes" />
        </div>

        {isEditing && (
          <div className="col-12">
            <Controller
              name="is_active"
              control={control}
              render={({ field }) => (
                <label className="flex align-items-center gap-2" style={{ cursor: "pointer" }}>
                  <InputSwitch checked={!!field.value} onChange={(e) => field.onChange(!!e.value)} />
                  Cliente activo (los inactivos no aparecen al crear pedidos)
                </label>
              )}
            />
          </div>
        )}
      </form>
    </Dialog>
  );
};

export default CustomerFormDialog;
