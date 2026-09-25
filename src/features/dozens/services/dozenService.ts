import api from "@/shared/lib/axios";
import type { DozenFormData, Dozen } from "../types/dozen";
import type { PaginatedResponse } from "@/shared/types";

const ENDPOINT = "production/dozens";

export const dozenService = {
  getAll: () => api.get<PaginatedResponse<Dozen>>(`${ENDPOINT}/`).then(r => r.data.results),
  getById: (id: number) => api.get<Dozen>(`${ENDPOINT}/${id}/`).then(r => r.data),
  create: (data: DozenFormData) => api.post<Dozen>(`${ENDPOINT}/`, data).then(r => r.data),
  update: (id: number, data: DozenFormData) => api.put<Dozen>(`${ENDPOINT}/${id}/`, data).then(r => r.data),
  patch: (id: number, data: Partial<Dozen>) => api.patch<Dozen>(`${ENDPOINT}/${id}/`, data).then(r => r.data),
  delete: (id: number) => api.delete(`${ENDPOINT}/${id}/`),

  dozenMetadata: () => api.get(`/production/dozen-metadata/`).then(r => r.data),
};