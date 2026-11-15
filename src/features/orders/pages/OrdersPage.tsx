// [PED] ARCHIVO NUEVO ─ features/orders/pages/OrdersPage.tsx
import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Button } from "primereact/button";
import { useDozenMetadata } from "@/shared/hooks/useDozenMetadata";
import { useOrders } from "../hooks/useOrders";
import OrderList from "../components/OrderList";
import OrderDetailDialog from "../components/OrderDetailDialog";

export const OrdersPage = () => {
  // /production/orders?customer=5 -> pedidos de ese cliente (viene de la tabla de Clientes)
  const [searchParams] = useSearchParams();
  const customerParam = Number(searchParams.get("customer")) || null;

  const o = useOrders(customerParam);
  const { metadata } = useDozenMetadata();
  const [openId, setOpenId] = useState<number | null>(null);

  return (
    <>
      <div className="flex flex-wrap align-items-center justify-content-between gap-3 pb-4">
        <div>
          <h2 className="m-0">Pedidos</h2>
          <small style={{ color: "var(--ink-2)" }}>
            {o.total} {o.total === 1 ? "pedido" : "pedidos"}
          </small>
        </div>
        <div className="flex gap-2">
          <Link to="/contact/customers">
            <Button
              label="Clientes"
              icon="pi pi-users"
              outlined
              severity="secondary"
              className="p-button-sm"
            />
          </Link>
          <Link to="/production/orders/new">
            <Button
              label="Nuevo pedido"
              icon="pi pi-plus"
              className="sf-btn--clay text-white p-button-sm"
            />
          </Link>
        </div>
      </div>

      <OrderList
        orders={o.orders}
        loading={o.loading}
        total={o.total}
        page={o.page}
        onPageChange={o.setPage}
        search={o.search}
        onSearchChange={o.setSearch}
        filter={o.filter}
        onFilterChange={o.changeFilter}
        onOpen={(order) => setOpenId(order.id)}
        customerFilterActive={o.customer !== null}
        onClearCustomer={o.clearCustomer}
      />

      {metadata && (
        <OrderDetailDialog
          orderId={openId}
          metadata={metadata}
          onHide={() => setOpenId(null)}
          onChanged={o.refetch}
        />
      )}
    </>
  );
};

export default OrdersPage;
