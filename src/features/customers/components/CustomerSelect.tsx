// [PED] ARCHIVO NUEVO ─ features/customers/components/CustomerSelect.tsx
import { useMemo, useState } from "react";
import { Dropdown } from "primereact/dropdown";
import { Button } from "primereact/button";
import { useCustomerOptions } from "../hooks/useCustomers";
import { customerService } from "../services/customerService";
import CustomerFormDialog from "./CustomerFormDialog";
import type { CustomerFormData, CustomerMini } from "../types/customer";

interface Props {
  value: number | null | undefined;
  onChange: (id: number | null) => void;
  // Cliente ya guardado (por si está desactivado y no sale en la lista de activos)
  current?: CustomerMini | null;
  placeholder?: string;
  showClear?: boolean; // permite dejarlo vacío (formulario de docena)
  allowCreate?: boolean; // botón "+" para crear un cliente sin salir de la pantalla
  disabled?: boolean;
  invalid?: boolean;
  id?: string;
}

// Selector de cliente con búsqueda y creación rápida. Se usa en el pedido y en la docena.
const CustomerSelect = ({
  value,
  onChange,
  current,
  placeholder = "Buscar cliente...",
  showClear = false,
  allowCreate = true,
  disabled,
  invalid,
  id,
}: Props) => {
  const { customers, reload } = useCustomerOptions();
  const [creating, setCreating] = useState(false);

  const options = useMemo(() => {
    const list: { id: number; name: string; document: string | null }[] = customers.map((c) => ({
      id: c.id,
      name: c.name,
      document: c.document,
    }));
    if (current && !list.some((c) => c.id === current.id)) {
      list.unshift({ id: current.id, name: `${current.name} (inactivo)`, document: current.document });
    }
    return list;
  }, [customers, current]);

  const createAndSelect = async (data: CustomerFormData) => {
    const created = await customerService.create(data);
    await reload();
    onChange(created.id);
  };

  return (
    <>
      <div className="flex gap-2">
        <Dropdown
          inputId={id}
          value={value ?? null}
          options={options}
          optionLabel="name"
          optionValue="id"
          onChange={(e) => onChange(e.value ?? null)}
          filter
          filterBy="name,document"
          showClear={showClear}
          placeholder={placeholder}
          emptyMessage="Sin clientes"
          emptyFilterMessage="Sin resultados"
          disabled={disabled}
          invalid={invalid}
          className="w-full"
          itemTemplate={(o: { name: string; document: string | null }) => (
            <div className="flex flex-column">
              <span>{o.name}</span>
              {o.document && <small style={{ color: "var(--ink-2)" }}>{o.document}</small>}
            </div>
          )}
        />
        {allowCreate && !disabled && (
          <Button
            type="button"
            icon="pi pi-plus"
            outlined
            severity="secondary"
            tooltip="Nuevo cliente"
            tooltipOptions={{ position: "top" }}
            aria-label="Nuevo cliente"
            onClick={() => setCreating(true)}
          />
        )}
      </div>

      <CustomerFormDialog visible={creating} onHide={() => setCreating(false)} onSave={createAndSelect} />
    </>
  );
};

export default CustomerSelect;
