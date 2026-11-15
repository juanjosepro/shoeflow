// [PED] ARCHIVO NUEVO ─ features/orders/components/OrderStatusTag.tsx
import type { OrderStatus } from "../types/order";

// Etiqueta de estado con los colores del tema (sf-tag moss / amber / clay)
const STATUS: Record<OrderStatus, { label: string; cls: string; icon: string }> = {
  PENDIENTE: { label: "Pendiente", cls: "", icon: "pi-clock" },
  EN_PRODUCCION: { label: "En producción", cls: "amber", icon: "pi-cog" },
  LISTO: { label: "Listo para entregar", cls: "moss", icon: "pi-check-circle" },
  ENTREGADO: { label: "Entregado", cls: "moss", icon: "pi-truck" },
  CANCELADO: { label: "Cancelado", cls: "clay", icon: "pi-times-circle" },
};

export const OrderStatusTag = ({ status }: { status: OrderStatus }) => {
  const s = STATUS[status] ?? STATUS.PENDIENTE;
  return (
    <span className={`sf-tag ${s.cls}`} style={{ whiteSpace: "nowrap" }}>
      <i className={`pi ${s.icon} mr-1`} style={{ fontSize: 11 }} />
      {s.label}
    </span>
  );
};

export const PriorityTag = ({ priority }: { priority: string }) => {
  const cls = priority === "URGENTE" ? "clay" : priority === "ALTA" ? "amber" : "";
  const label = priority.charAt(0) + priority.slice(1).toLowerCase();
  return <span className={`sf-tag ${cls}`}>{label}</span>;
};
