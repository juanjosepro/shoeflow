// [PED] ARCHIVO NUEVO ─ features/orders/components/OrderList.tsx
import { Button } from "primereact/button";
import { Column } from "primereact/column";
import { DataTable } from "primereact/datatable";
import { InputText } from "primereact/inputtext";
import { SelectButton } from "primereact/selectbutton";
import dayjs from "@/shared/lib/dayjs";
import useMediaQuery from "@/shared/hooks/useMediaQuery";
import { ORDERS_PAGE_SIZE } from "../hooks/useOrders";
import type { Order, OrderFilter } from "../types/order";
import { OrderStatusTag, PriorityTag } from "./OrderStatusTag";
import "./orders.css";

interface Props {
  orders: Order[];
  loading: boolean;
  total: number;
  page: number;
  onPageChange: (page: number) => void;
  search: string;
  onSearchChange: (value: string) => void;
  filter: OrderFilter;
  onFilterChange: (value: OrderFilter) => void;
  onOpen: (order: Order) => void;
  // Si se está viendo un solo cliente: botón para quitar ese filtro
  customerFilterActive: boolean;
  onClearCustomer: () => void;
}

const FILTERS: { label: string; value: OrderFilter }[] = [
  { label: "Abiertos", value: "open" },
  { label: "En producción", value: "EN_PRODUCCION" },
  { label: "Listos", value: "LISTO" },
  { label: "Cerrados", value: "closed" },
  { label: "Todos", value: "all" },
];

const OrderList = ({
  orders,
  loading,
  total,
  page,
  onPageChange,
  search,
  onSearchChange,
  filter,
  onFilterChange,
  onOpen,
  customerFilterActive,
  onClearCustomer,
}: Props) => {
  const isLaptopUp = useMediaQuery("(min-width: 1024px)");

  const codeBody = (o: Order) => (
    <div className="flex flex-column">
      <span className="font-bold mono">{o.code}</span>
      <small style={{ color: "var(--ink-2)" }}>{dayjs(o.ordered_at).format("D MMM YYYY")}</small>
    </div>
  );

  const customerBody = (o: Order) => (
    <div className="flex flex-column" style={{ minWidth: 0 }}>
      <span className="font-bold">{o.customer.name}</span>
      {!isLaptopUp && <OrderStatusTag status={o.status} />}
    </div>
  );

  // Avance: barra + "n/total docenas"
  const progressBody = (o: Order) => (
    <div className="sfo flex flex-column gap-1" style={{ minWidth: 120 }}>
      <div className={`sfo-bar${o.progress === 100 ? " done" : ""}`}>
        <span style={{ width: `${o.progress}%` }} />
      </div>
      <small style={{ color: "var(--ink-2)" }}>
        {o.n_done}/{o.n_total} docenas · {o.pairs_total ?? 0} pares
      </small>
    </div>
  );

  const dueBody = (o: Order) =>
    o.due_date ? (
      <div className="flex flex-column gap-1">
        <span>{dayjs(o.due_date).format("D MMM YYYY")}</span>
        {o.is_overdue && <span className="sf-tag clay" style={{ width: "fit-content" }}>Atrasado</span>}
      </div>
    ) : (
      <span style={{ color: "var(--sf-stone)" }}>Sin fecha</span>
    );

  const header = (
    <div className="flex flex-column gap-3">
      <div className="flex flex-wrap align-items-center justify-content-between gap-3">
        <span className="p-input-icon-left">
          <i className="pi pi-search pl-2" />
          <InputText
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Buscar por código, cliente o nota..."
            className="pr-2 pl-5"
            style={{ width: isLaptopUp ? "320px" : "100%" }}
          />
        </span>
        {customerFilterActive && (
          <Button label="Viendo un solo cliente · quitar" icon="pi pi-times" size="small" outlined severity="secondary" onClick={onClearCustomer} />
        )}
      </div>
      {/* Filtros rápidos: se pueden deslizar en celular */}
      <div style={{ overflowX: "auto" }}>
        <SelectButton value={filter} options={FILTERS} allowEmpty={false} onChange={(e) => onFilterChange(e.value)} />
      </div>
    </div>
  );

  return (
    <DataTable
      value={orders}
      lazy
      paginator
      first={(page - 1) * ORDERS_PAGE_SIZE}
      rows={ORDERS_PAGE_SIZE}
      totalRecords={total}
      onPage={(e) => onPageChange(e.first / e.rows + 1)}
      loading={loading}
      header={header}
      dataKey="id"
      selectionMode="single"
      metaKeySelection={false}
      onRowClick={(e) => onOpen(e.data as Order)}
      emptyMessage="No hay pedidos en esta vista."
      className="sf-table"
      rowHover
    >
      <Column header="Pedido" body={codeBody} style={{ minWidth: "8rem" }} />
      <Column header="Cliente" body={customerBody} style={{ minWidth: "12rem" }} />
      <Column header="Avance" body={progressBody} style={{ minWidth: "11rem" }} />
      {isLaptopUp && <Column header="Entrega" body={dueBody} style={{ minWidth: "9rem" }} />}
      {isLaptopUp && <Column header="Prioridad" body={(o: Order) => <PriorityTag priority={o.priority} />} />}
      {isLaptopUp && <Column header="Estado" body={(o: Order) => <OrderStatusTag status={o.status} />} style={{ minWidth: "10rem" }} />}
    </DataTable>
  );
};

export default OrderList;
