// [PED] ARCHIVO NUEVO ─ features/customers/services/customerService.ts
import api from "@/shared/lib/axios";
import type { PaginatedResponse } from "@/shared/types";
import type { Customer, CustomerFormData } from "../types/customer";

// OJO: ajusta el prefijo si tu urls.py de producción cuelga de otra ruta
const ENDPOINT = "contact/customers";

export interface CustomerListParams {
  search?: string;
  is_active?: boolean | null; // null/undefined = todos
  page?: number;
  limit?: number;
}

const toQuery = (p: CustomerListParams) => ({
  search: p.search || undefined,
  is_active: p.is_active ?? undefined,
  page: p.page,
  limit: p.limit, // por si tu paginación usa limit
  page_size: p.limit, // o page_size
});

export const customerService = {
  getPaginated: (params: CustomerListParams) =>
    api.get<PaginatedResponse<Customer>>(`${ENDPOINT}/`, { params: toQuery(params) }).then((r) => r.data),

  // Todos los clientes activos, sin paginar (para los selectores)
  getOptions: () =>
    api
      .get<Customer[]>(`${ENDPOINT}/`, { params: { no_pagination: true, is_active: true } })
      .then((r) => r.data),

  create: (data: CustomerFormData) => api.post<Customer>(`${ENDPOINT}/`, data).then((r) => r.data),
  update: (id: number, data: CustomerFormData) => api.put<Customer>(`${ENDPOINT}/${id}/`, data).then((r) => r.data),
  patch: (id: number, data: Partial<CustomerFormData>) =>
    api.patch<Customer>(`${ENDPOINT}/${id}/`, data).then((r) => r.data),
  delete: (id: number) => api.delete(`${ENDPOINT}/${id}/`),
};
