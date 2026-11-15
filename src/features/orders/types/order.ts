// [PED] ARCHIVO NUEVO ─ features/orders/types/order.ts
import type { Dozen } from "@/features/dozens/types/dozen";
import type { CustomerMini } from "@/features/customers/types/customer";

// Calculado por el backend según el avance de sus docenas; los dos últimos son el cierre manual
export type OrderStatus = "PENDIENTE" | "EN_PRODUCCION" | "LISTO" | "ENTREGADO" | "CANCELADO";

export interface Order {
  id: number;
  code: string; // PED-0001
  customer: CustomerMini;
  ordered_at: string; // YYYY-MM-DD
  due_date: string | null; // fecha de entrega prometida
  priority: string;
  notes: string;
  status: OrderStatus;
  closure: "ENTREGADO" | "CANCELADO" | null;
  closed_at: string | null;
  n_total: number; // docenas (sin contar rechazadas)
  n_done: number; // completadas
  n_busy: number; // en proceso
  n_rejected: number;
  pairs_total: number;
  progress: number; // 0-100
  is_overdue: boolean;
  created_at: string;
  dozens?: Dozen[]; // solo en el detalle
}

// Una línea del pedido = un tipo de docena × cantidad
export interface OrderLinePayload {
  model_id: number;
  size_id: number;
  material_type_id: number;
  color_id: number;
  plant_type_id: number | null;
  pairs: number;
  size_run: Record<string, number> | null;
  count: number;
  description: string;
}

export interface OrderPayload {
  customer_id: number;
  ordered_at: string; // YYYY-MM-DD
  due_date: string | null;
  priority: string;
  notes: string;
  lines: OrderLinePayload[];
}

// Edición de la cabecera (las líneas se agregan con "Agregar docenas")
export type OrderHeaderPayload = Omit<OrderPayload, "lines">;

// Filtros rápidos del listado
export type OrderFilter = "open" | "EN_PRODUCCION" | "LISTO" | "closed" | "all";
