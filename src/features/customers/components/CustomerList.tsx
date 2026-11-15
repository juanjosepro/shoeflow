// [PED] ARCHIVO NUEVO ─ features/customers/components/CustomerList.tsx
import { Avatar } from "primereact/avatar";
import { Button } from "primereact/button";
import { Column } from "primereact/column";
import { DataTable } from "primereact/datatable";
import { InputText } from "primereact/inputtext";
import { SelectButton } from "primereact/selectbutton";
import { useNavigate } from "react-router-dom";
import dayjs from "@/shared/lib/dayjs";
import useMediaQuery from "@/shared/hooks/useMediaQuery";
import { CUSTOMERS_PAGE_SIZE } from "../hooks/useCustomers";
import type { Customer, CustomerActiveFilter } from "../types/customer";

interface Props {
  customers: Customer[];
  loading: boolean;
  total: number;
  page: number;
  onPageChange: (page: number) => void;
  search: string;
  onSearchChange: (value: string) => void;
  activeFilter: CustomerActiveFilter;
  onFilterChange: (value: CustomerActiveFilter) => void;
  onEdit: (customer: Customer) => void;
  onToggleActive: (customer: Customer) => void;
}

const FILTERS: { label: string; value: CustomerActiveFilter }[] = [
  { label: "Activos", value: "active" },
  { label: "Inactivos", value: "inactive" },
  { label: "Todos", value: "all" },
];

const CustomerList = ({
  customers,
  loading,
  total,
  page,
  onPageChange,
  search,
  onSearchChange,
  activeFilter,
  onFilterChange,
  onEdit,
  onToggleActive,
}: Props) => {
  const navigate = useNavigate();
  const isLaptopUp = useMediaQuery("(min-width: 1024px)");

  // Nombre + documento debajo (en celular también muestra el teléfono)
  const nameBody = (c: Customer) => (
    <div className="flex align-items-center gap-3">
      <Avatar
        label={c.name.slice(0, 1)}
        shape="circle"
        size="large"
        className="uppercase"
      />
      <div className="flex flex-column" style={{ minWidth: 0 }}>
        <span className="font-bold">{c.name}</span>
        <small style={{ color: "var(--ink-2)" }}>
          {c.document ?? "Sin documento"}
          {!isLaptopUp && c.phone ? ` · ${c.phone}` : ""}
        </small>
      </div>
    </div>
  );

  const contactBody = (c: Customer) =>
    c.phone || c.email ? (
      <div className="flex flex-column" style={{ fontSize: 13.5 }}>
        {c.phone && (
          <span>
            <i className="pi pi-phone mr-2" style={{ fontSize: 12 }} />
            {c.phone}
          </span>
        )}
        {c.email && (
          <span style={{ color: "var(--ink-2)" }}>
            <i className="pi pi-envelope mr-2" style={{ fontSize: 12 }} />
            {c.email}
          </span>
        )}
      </div>
    ) : (
      <span style={{ color: "var(--sf-stone)" }}>—</span>
    );

  // Pedidos: total y cuántos siguen abiertos
  const ordersBody = (c: Customer) => (
    <div className="flex align-items-center gap-2">
      <span className="mono">{c.orders_count}</span>
      {c.open_orders_count > 0 && (
        <span className="sf-tag amber">{c.open_orders_count} abiertos</span>
      )}
    </div>
  );

  const lastOrderBody = (c: Customer) =>
    c.last_order_at ? (
      dayjs(c.last_order_at).format("D MMM YYYY")
    ) : (
      <span style={{ color: "var(--sf-stone)" }}>—</span>
    );

  const statusBody = (c: Customer) => (
    <span
      className={`sf-tag ${c.is_active ? "moss" : "clay"}`}
      style={{ display: "inline-block", width: 80, textAlign: "center" }}
    >
      {c.is_active ? "Activo" : "Inactivo"}
    </span>
  );

  // Acciones directas (sin menú): crear pedido, ver sus pedidos, editar, activar/desactivar
  const actionsBody = (c: Customer) => (
    <div className="flex gap-1 justify-content-end">
      <Button
        icon="pi pi-plus"
        label={isLaptopUp ? "Pedido" : undefined}
        className="sf-btn--moss text-white p-button-sm"
        disabled={!c.is_active}
        tooltip="Nuevo pedido para este cliente"
        tooltipOptions={{ position: "top" }}
        onClick={() => navigate(`/production/orders/new?customer=${c.id}`)}
      />
      <Button
        icon="pi pi-clipboard"
        text
        severity="secondary"
        tooltip="Ver sus pedidos"
        tooltipOptions={{ position: "top" }}
        onClick={() => navigate(`/production/orders?customer=${c.id}`)}
      />
      <Button
        icon="pi pi-pencil"
        text
        severity="secondary"
        tooltip="Editar"
        tooltipOptions={{ position: "top" }}
        onClick={() => onEdit(c)}
      />
      <Button
        icon={c.is_active ? "pi pi-ban" : "pi pi-replay"}
        text
        severity={c.is_active ? "danger" : "success"}
        tooltip={c.is_active ? "Desactivar" : "Activar"}
        tooltipOptions={{ position: "top" }}
        onClick={() => onToggleActive(c)}
      />
    </div>
  );

  const header = (
    <div className="flex flex-wrap align-items-center justify-content-between gap-3">
      <span className="p-input-icon-left">
        <i className="pi pi-search pl-2" />
        <InputText
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Buscar por nombre, documento o teléfono..."
          className="pr-2 pl-5"
          style={{ width: isLaptopUp ? "320px" : "100%" }}
        />
      </span>
      <SelectButton
        value={activeFilter}
        options={FILTERS}
        allowEmpty={false}
        onChange={(e) => onFilterChange(e.value)}
      />
    </div>
  );

  return (
    <DataTable
      value={customers}
      lazy
      paginator
      first={(page - 1) * CUSTOMERS_PAGE_SIZE}
      rows={CUSTOMERS_PAGE_SIZE}
      totalRecords={total}
      onPage={(e) => onPageChange(e.first / e.rows + 1)}
      loading={loading}
      header={header}
      dataKey="id"
      emptyMessage="No se encontraron clientes."
      className="sf-table"
      rowHover
    >
      <Column header="Cliente" body={nameBody} style={{ minWidth: "16rem" }} />
      {isLaptopUp && (
        <Column
          header="Contacto"
          body={contactBody}
          style={{ minWidth: "13rem" }}
        />
      )}
      <Column header="Pedidos" body={ordersBody} style={{ minWidth: "9rem" }} />
      {isLaptopUp && (
        <Column
          header="Último pedido"
          body={lastOrderBody}
          style={{ minWidth: "9rem" }}
        />
      )}
      {isLaptopUp && <Column header="Estado" body={statusBody} />}
      <Column
        body={actionsBody}
        style={{ minWidth: isLaptopUp ? "14rem" : "9rem" }}
      />
    </DataTable>
  );
};

export default CustomerList;
