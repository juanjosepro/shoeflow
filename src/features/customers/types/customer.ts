// [PED] ARCHIVO NUEVO ─ features/customers/types/customer.ts

// Cliente completo (listado de Clientes)
export interface Customer {
  id: number;
  name: string;
  document: string | null; // DNI / RUC
  phone: string;
  email: string;
  address: string;
  notes: string;
  is_active: boolean;
  orders_count: number; // pedidos en total
  open_orders_count: number; // pedidos sin entregar ni cancelar
  last_order_at: string | null; // fecha del último pedido (YYYY-MM-DD)
  created_at: string;
}

// Versión corta que viene dentro de una docena o de un pedido
export interface CustomerMini {
  id: number;
  name: string;
  document: string | null;
  phone: string;
  is_active: boolean;
}

// Lo que se envía al crear o editar
export interface CustomerFormData {
  name: string;
  document: string | null;
  phone: string;
  email: string;
  address: string;
  notes: string;
  is_active: boolean;
}

// Filtro de estado del listado
export type CustomerActiveFilter = "all" | "active" | "inactive";
