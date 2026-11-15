// [PED] ARCHIVO NUEVO ─ features/orders/components/OrderDetailDialog.tsx
import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "primereact/button";
import { Column } from "primereact/column";
import { ConfirmDialog } from "primereact/confirmdialog";
import { DataTable } from "primereact/datatable";
import { Dialog } from "primereact/dialog";
import { useNavigate } from "react-router-dom";
import dayjs from "@/shared/lib/dayjs";
import { toast } from "@/shared/lib/toast";
import useMediaQuery from "@/shared/hooks/useMediaQuery";
import type { Dozen } from "@/features/dozens/types/dozen";
import type { DozenMetadata } from "@/features/dozens/types/dozen";
import { orderService } from "../services/orderService";
import type { Order } from "../types/order";
import { OrderStatusTag, PriorityTag } from "./OrderStatusTag";
import OrderEditDialog from "./OrderEditDialog";
import "./orders.css";

interface Props {
  orderId: number | null;
  metadata: DozenMetadata;
  onHide: () => void;
  onChanged: () => void; // para refrescar el listado
}

type OrderDozen = Dozen & { assigned_stages?: number; total_stages?: number };
type Action = "deliver" | "cancel" | "reopen" | "delete";

const DOZEN_TAG: Record<string, string> = {
  PENDIENTE: "",
  EN_PROCESO: "amber",
  COMPLETADO: "moss",
  RECHAZADO: "clay",
};
const DOZEN_LABEL: Record<string, string> = {
  PENDIENTE: "Pendiente",
  EN_PROCESO: "En proceso",
  COMPLETADO: "Completada",
  RECHAZADO: "Rechazada",
};

const CONFIRM: Record<
  Action,
  { header: string; message: string; accept: string }
> = {
  deliver: {
    header: "Entregar pedido",
    message: "Se marcará como entregado al cliente.",
    accept: "Entregar",
  },
  cancel: {
    header: "Cancelar pedido",
    message: "Sus docenas se desactivarán (no se borran). Podrás reabrirlo.",
    accept: "Cancelar pedido",
  },
  reopen: {
    header: "Reabrir pedido",
    message: "Vuelve a estar abierto y su avance se calcula otra vez.",
    accept: "Reabrir",
  },
  delete: {
    header: "Eliminar pedido",
    message: "Se borran el pedido y todas sus docenas. No se puede deshacer.",
    accept: "Eliminar",
  },
};

const OrderDetailDialog = ({ orderId, metadata, onHide, onChanged }: Props) => {
  const navigate = useNavigate();
  const isLaptopUp = useMediaQuery("(min-width: 1024px)");
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [pending, setPending] = useState<Action | null>(null);
  const [editing, setEditing] = useState(false);

  // onHide llega como función nueva en cada render: se guarda en una ref para no recargar en bucle
  const onHideRef = useRef(onHide);
  onHideRef.current = onHide;

  const load = useCallback(async () => {
    if (!orderId) return;
    setLoading(true);
    try {
      setOrder(await orderService.getById(orderId));
    } catch {
      toast.error("No se pudo cargar el pedido.");
      onHideRef.current();
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    setOrder(null);
    load();
  }, [load]);

  const run = async (action: Action) => {
    if (!order) return;
    try {
      if (action === "delete") {
        await orderService.delete(order.id);
        toast.success("Pedido eliminado.");
        onChanged();
        onHide();
        return;
      }
      const updated = await orderService[action](order.id);
      setOrder(updated);
      onChanged();
      toast.success("Pedido actualizado.");
    } catch (error) {
      const detail = (error as { response?: { data?: { detail?: string } } })
        ?.response?.data?.detail;
      toast.error(detail ?? "No se pudo completar la acción.");
    }
  };

  const dozens = (order?.dozens ?? []) as OrderDozen[];
  const closed = Boolean(order?.closure);

  const dozenBody = (d: OrderDozen) => (
    <div className="flex flex-column">
      <span className="font-bold mono">{d.code}</span>
      <small style={{ color: "var(--ink-2)" }}>
        {d.model.name} · talla {d.size.name} · {d.pairs} pares
      </small>
    </div>
  );
  const colorBody = (d: OrderDozen) => (
    <span>
      <span className="sfo-swatch" style={{ background: d.color.hex_code }} />
      {d.color.name}
      <small style={{ color: "var(--ink-2)" }}> · {d.material_type.name}</small>
    </span>
  );
  const statusBody = (d: OrderDozen) => (
    <div className="flex flex-column gap-1">
      <span
        className={`sf-tag ${DOZEN_TAG[d.status] ?? ""}`}
        style={{ width: "fit-content" }}
      >
        {DOZEN_LABEL[d.status] ?? d.status}
      </span>
      {d.total_stages ? (
        <small style={{ color: "var(--ink-2)" }}>
          Etapas {d.assigned_stages ?? 0}/{d.total_stages}
        </small>
      ) : null}
    </div>
  );

  return (
    <>
      <Dialog
        header={order ? `Pedido ${order.code}` : "Pedido"}
        visible={orderId !== null}
        onHide={onHide}
        position={isLaptopUp ? "center" : "bottom"}
        style={{ width: isLaptopUp ? "58rem" : "100vw" }}
        maskStyle={{ backdropFilter: "blur(4px)" }}
        className="sf-dialog"
      >
        {loading && !order ? (
          <div className="flex justify-content-center p-5">
            <i className="pi pi-spin pi-spinner" style={{ fontSize: "2rem" }} />
          </div>
        ) : order ? (
          <div className="sfo flex flex-column gap-3">
            {/* Cabecera */}
            <div className="sfo-section">
              <div className="flex flex-wrap align-items-start justify-content-between gap-3">
                <div>
                  <div className="font-bold" style={{ fontSize: "1.15rem" }}>
                    {order.customer.name}
                  </div>
                  <small style={{ color: "var(--ink-2)" }}>
                    {order.customer.document ?? "Sin documento"}
                    {order.customer.phone ? ` · ${order.customer.phone}` : ""}
                  </small>
                </div>
                <div className="flex flex-wrap gap-2 align-items-center">
                  <PriorityTag priority={order.priority} />
                  <OrderStatusTag status={order.status} />
                  {order.is_overdue && (
                    <span className="sf-tag clay">Atrasado</span>
                  )}
                </div>
              </div>

              <div className="grid mt-2">
                <div className="col-6 md:col-3">
                  <small style={{ color: "var(--ink-2)" }}>Pedido</small>
                  <div>{dayjs(order.ordered_at).format("D MMM YYYY")}</div>
                </div>
                <div className="col-6 md:col-3">
                  <small style={{ color: "var(--ink-2)" }}>Entrega</small>
                  <div>
                    {order.due_date
                      ? dayjs(order.due_date).format("D MMM YYYY")
                      : "Sin fecha"}
                  </div>
                </div>
                <div className="col-6 md:col-3">
                  <small style={{ color: "var(--ink-2)" }}>Docenas</small>
                  <div>
                    {order.n_total}{" "}
                    <small>({order.pairs_total ?? 0} pares)</small>
                  </div>
                </div>
                <div className="col-6 md:col-3">
                  <small style={{ color: "var(--ink-2)" }}>
                    Avance · {order.n_done}/{order.n_total}
                  </small>
                  <div
                    className={`sfo-bar mt-2${order.progress === 100 ? " done" : ""}`}
                  >
                    <span style={{ width: `${order.progress}%` }} />
                  </div>
                </div>
              </div>
              {order.notes && (
                <div className="mt-2" style={{ color: "var(--ink-2)" }}>
                  <i className="pi pi-comment mr-2" />
                  {order.notes}
                </div>
              )}
            </div>

            {/* Docenas del pedido */}
            <DataTable
              value={dozens}
              dataKey="id"
              className="sf-table"
              emptyMessage="Sin docenas."
              size="small"
            >
              <Column
                header="Docena"
                body={dozenBody}
                style={{ minWidth: "13rem" }}
              />
              {isLaptopUp && (
                <Column header="Color / material" body={colorBody} />
              )}
              <Column header="Estado" body={statusBody} />
            </DataTable>

            {/* Acciones según el estado */}
            <div className="flex flex-wrap justify-content-between gap-2">
              <div className="flex flex-wrap gap-2">
                {!closed && (
                  <Button
                    label="Agregar docenas"
                    icon="pi pi-plus"
                    outlined
                    severity="secondary"
                    onClick={() =>
                      navigate(`/production/orders/${order.id}/add`)
                    }
                  />
                )}
                {!closed && (
                  <Button
                    label="Editar"
                    icon="pi pi-pencil"
                    outlined
                    severity="secondary"
                    onClick={() => setEditing(true)}
                  />
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {order.status === "LISTO" && (
                  <Button
                    label="Entregar"
                    icon="pi pi-truck"
                    severity="success"
                    onClick={() => setPending("deliver")}
                  />
                )}
                {closed && (
                  <Button
                    label="Reabrir"
                    icon="pi pi-replay"
                    outlined
                    onClick={() => setPending("reopen")}
                  />
                )}
                {!closed && (
                  <Button
                    label="Cancelar pedido"
                    icon="pi pi-ban"
                    outlined
                    severity="danger"
                    onClick={() => setPending("cancel")}
                  />
                )}
                <Button
                  icon="pi pi-trash"
                  text
                  severity="danger"
                  tooltip="Eliminar"
                  tooltipOptions={{ position: "top" }}
                  onClick={() => setPending("delete")}
                />
              </div>
            </div>
          </div>
        ) : null}
      </Dialog>

      <ConfirmDialog
        visible={pending !== null}
        onHide={() => setPending(null)}
        header={pending ? CONFIRM[pending].header : ""}
        message={pending ? CONFIRM[pending].message : ""}
        icon="pi pi-exclamation-triangle"
        acceptLabel={pending ? CONFIRM[pending].accept : "Aceptar"}
        rejectLabel="Volver"
        accept={() => pending && run(pending)}
      />

      <OrderEditDialog
        order={order}
        metadata={metadata}
        visible={editing}
        onHide={() => setEditing(false)}
        onSaved={(updated) => {
          setOrder(updated);
          onChanged();
        }}
      />
    </>
  );
};

export default OrderDetailDialog;
