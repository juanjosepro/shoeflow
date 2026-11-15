// [PED] ARCHIVO NUEVO ─ features/orders/pages/OrderFormPage.tsx
import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom"; // [PED] Link se importa abajo
import { useModels } from "@/features/models/hooks/useModels";
import { useDozenMetadata } from "@/shared/hooks/useDozenMetadata";
import { useCatalogOptions } from "@/shared/hooks/useCatalogOptions";
import { Link } from "react-router-dom";
import { Button } from "primereact/button";
import { toast } from "@/shared/lib/toast";
import OrderForm from "../components/OrderForm";
import { orderService } from "../services/orderService";
import type { Order, OrderPayload } from "../types/order";

// Rutas: /production/orders/new  (pedido nuevo)  |  /production/orders/:id/add  (agregar docenas)
export const OrderFormPage = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const isAdd = Boolean(id);
  const presetCustomer = Number(searchParams.get("customer")) || null;

  const { models } = useModels({ noPagination: true });
  const { metadata } = useDozenMetadata();
  const { options } = useCatalogOptions();
  const [order, setOrder] = useState<Order | null>(null);

  useEffect(() => {
    if (!isAdd) return;
    orderService
      .getById(Number(id))
      .then(setOrder)
      .catch(() => toast.error("No se pudo cargar el pedido."));
  }, [id, isAdd]);

  const ready = models && metadata && options && (!isAdd || order);
  if (!ready) {
    return (
      <div
        className="flex align-items-center justify-content-center"
        style={{ height: "60vh" }}
      >
        <i className="pi pi-spin pi-spinner" style={{ fontSize: "2.5rem" }} />
      </div>
    );
  }

  const save = (payload: OrderPayload) =>
    isAdd
      ? orderService.addDozens(Number(id), payload.lines)
      : orderService.create(payload);

  return (
    <>
      <div className="flex align-items-center gap-3">
        <Link to="/production/orders">
          <Button
            icon="pi pi-arrow-left"
            text
            severity="secondary"
            aria-label="Volver a pedidos"
          />
        </Link>
        <h2 className="m-0">
          {isAdd ? `Agregar docenas a ${order?.code}` : "Nuevo pedido"}
        </h2>
      </div>
      <OrderForm
        models={models}
        options={options}
        metadata={metadata}
        mode={isAdd ? "add" : "create"}
        order={order}
        presetCustomerId={presetCustomer}
        onSave={save}
      />
    </>
  );
};

export default OrderFormPage;
