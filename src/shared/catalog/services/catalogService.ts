import api from "@/shared/lib/axios";
import type { CatalogService } from "../types/catalog";

// Crea el servicio de una tabla del catálogo a partir de su ruta, ej. "catalog/materials".
// Son pocas filas: se piden todas de una vez (sin paginación del backend).
export const catalogService = <T, F>(endpoint: string): CatalogService<T, F> => ({
  getAll: () => api.get<T[]>(`${endpoint}/`, { params: { no_pagination: true } }).then((r) => r.data),
  create: (data) => api.post<T>(`${endpoint}/`, data).then((r) => r.data),
  update: (id, data) => api.put<T>(`${endpoint}/${id}/`, data).then((r) => r.data),
  patch: (id, data) => api.patch<T>(`${endpoint}/${id}/`, data).then((r) => r.data),
  delete: (id) => api.delete(`${endpoint}/${id}/`),
});