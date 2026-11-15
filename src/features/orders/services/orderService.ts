// [PED] ARCHIVO NUEVO ─ features/orders/services/orderService.ts
import api from "@/shared/lib/axios";
import type { PaginatedResponse } from "@/shared/types";
import type { Order, OrderFilter, OrderHeaderPayload, OrderLinePayload, OrderPayload } from "../types/order";

// OJO: ajusta el prefijo si tu urls.py de producción cuelga de otra ruta
const ENDPOINT = "contact/customers-orders";

export interface OrderListParams {
  search?: string;
  filter: OrderFilter;
  customer?: number | null;
  page?: number;
  limit?: number;
}

// Traduce el filtro rápido a los parámetros del backend
const toQuery = (p: OrderListParams) => ({
  search: p.search || undefined,
  customer: p.customer ?? undefined,
  open: p.filter === "open" ? true : undefined,
  closed: p.filter === "closed" ? true : undefined,
  status: p.filter === "EN_PRODUCCION" || p.filter === "LISTO" ? p.filter : undefined,
  page: p.page,
  limit: p.limit,
  page_size: p.limit,
});

export const orderService = {
  getPaginated: (params: OrderListParams) =>
    api.get<PaginatedResponse<Order>>(`${ENDPOINT}/`, { params: toQuery(params) }).then((r) => r.data),

  getById: (id: number) => api.get<Order>(`${ENDPOINT}/${id}/`).then((r) => r.data),

  create: (data: OrderPayload) => api.post<Order>(`${ENDPOINT}/`, data).then((r) => r.data),
  update: (id: number, data: Partial<OrderHeaderPayload>) =>
    api.patch<Order>(`${ENDPOINT}/${id}/`, data).then((r) => r.data),
  delete: (id: number) => api.delete(`${ENDPOINT}/${id}/`),

  addDozens: (id: number, lines: OrderLinePayload[]) =>
    api.post<Order>(`${ENDPOINT}/${id}/add-dozens/`, { lines }).then((r) => r.data),
  deliver: (id: number) => api.post<Order>(`${ENDPOINT}/${id}/deliver/`).then((r) => r.data),
  cancel: (id: number) => api.post<Order>(`${ENDPOINT}/${id}/cancel/`).then((r) => r.data),
  reopen: (id: number) => api.post<Order>(`${ENDPOINT}/${id}/reopen/`).then((r) => r.data),
};
