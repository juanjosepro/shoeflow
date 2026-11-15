// [PED] ARCHIVO NUEVO ─ features/orders/components/OrderEditDialog.tsx
import { useEffect, useState } from "react";
import { Button } from "primereact/button";
import { Calendar } from "primereact/calendar";
import { Dialog } from "primereact/dialog";
import { InputTextarea } from "primereact/inputtextarea";
import { SelectButton } from "primereact/selectbutton";
import dayjs from "@/shared/lib/dayjs";
import { toast } from "@/shared/lib/toast";
import useMediaQuery from "@/shared/hooks/useMediaQuery";
import type { DozenMetadata } from "@/features/dozens/types/dozen";
import CustomerSelect from "@/features/customers/components/CustomerSelect";
import { orderService } from "../services/orderService";
import type { Order } from "../types/order";

interface Props {
  order: Order | null;
  metadata: DozenMetadata;
  visible: boolean;
  onHide: () => void;
  onSaved: (order: Order) => void;
}

// Edita la cabecera del pedido. Cambiar cliente o prioridad se aplica a todas sus docenas.
const OrderEditDialog = ({ order, metadata, visible, onHide, onSaved }: Props) => {
  const isLaptopUp = useMediaQuery("(min-width: 1024px)");
  const [customerId, setCustomerId] = useState<number | null>(null);
  const [dueDate, setDueDate] = useState<Date | null>(null);
  const [priority, setPriority] = useState("NORMAL");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!visible || !order) return;
    setCustomerId(order.customer.id);
    setDueDate(order.due_date ? dayjs(order.due_date).toDate() : null);
    setPriority(order.priority);
    setNotes(order.notes ?? "");
  }, [visible, order]);

  const save = async () => {
    if (!order || !customerId) return;
    setSaving(true);
    try {
      const updated = await orderService.update(order.id, {
        customer_id: customerId,
        due_date: dueDate ? dayjs(dueDate).format("YYYY-MM-DD") : null,
        priority,
        notes,
      });
      toast.success("Pedido actualizado.");
      onSaved(updated);
      onHide();
    } catch (error) {
      const data = (error as { response?: { data?: Record<string, unknown> } })?.response?.data;
      const first = data ? Object.values(data)[0] : null;
      toast.error(String(Array.isArray(first) ? first[0] : (first ?? "No se pudo guardar.")));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog
      header={`Editar ${order?.code ?? "pedido"}`}
      visible={visible}
      onHide={onHide}
      position={isLaptopUp ? "center" : "bottom"}
      style={{ width: isLaptopUp ? "40rem" : "100vw" }}
      maskStyle={{ backdropFilter: "blur(4px)" }}
      className="sf-dialog"
      footer={
        <div className="flex justify-content-end gap-2">
          <Button label="Cancelar" icon="pi pi-times" outlined severity="secondary" onClick={onHide} />
          <Button label={saving ? "Guardando..." : "Guardar"} icon="pi pi-check" severity="success" loading={saving} disabled={!customerId} onClick={save} />
        </div>
      }
    >
      <div className="sf-form grid mt-1">
        <div className="col-12 flex flex-column gap-1">
          <label className="font-bold">Cliente</label>
          <CustomerSelect value={customerId} onChange={setCustomerId} current={order?.customer} />
          <small style={{ color: "var(--ink-2)" }}>Al cambiarlo, todas las docenas del pedido pasan al nuevo cliente.</small>
        </div>
        <div className="col-12 md:col-6 flex flex-column gap-1">
          <label className="font-bold">Entrega prometida</label>
          <Calendar
            value={dueDate}
            onChange={(e) => setDueDate((e.value as Date) ?? null)}
            minDate={order ? dayjs(order.ordered_at).toDate() : undefined}
            showIcon showButtonBar dateFormat="dd/mm/yy" locale="es" readOnlyInput touchUI
            placeholder="Sin fecha"
            className="w-full sf-calendar"
          />
        </div>
        <div className="col-12 md:col-6 flex flex-column gap-1">
          <label className="font-bold">Prioridad</label>
          <SelectButton
            value={priority}
            options={(metadata?.priorities ?? []).map((p) => ({ label: p.label, value: p.key }))}
            allowEmpty={false}
            onChange={(e) => setPriority(e.value)}
          />
        </div>
        <div className="col-12 flex flex-column gap-1">
          <label className="font-bold">Notas</label>
          <InputTextarea rows={3} autoResize value={notes} onChange={(e) => setNotes(e.target.value)} className="w-full" />
        </div>
      </div>
    </Dialog>
  );
};

export default OrderEditDialog;
