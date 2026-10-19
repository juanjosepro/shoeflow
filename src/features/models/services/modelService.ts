import api from "@/shared/lib/axios";
import type { ModelFormData, Model } from "../types/model";
import type { PaginatedResponse } from "@/shared/types";

const ENDPOINT = "catalog/models";

export const modelService = {
  getAll: (noPagination = false) => {
    const url = noPagination ? `${ENDPOINT}/?no_pagination=true` : `${ENDPOINT}/`;
    return noPagination
      ? api.get<Model[]>(url).then(r => r.data)
      : api.get<PaginatedResponse<Model>>(url).then(r => r.data.results);
  },
  getById: (id: number) => api.get<Model>(`${ENDPOINT}/${id}/`).then(r => r.data),
  create: (data: ModelFormData) => api.post<Model>(`${ENDPOINT}/`, data).then(r => r.data),
  update: (id: number, data: ModelFormData) => api.put<Model>(`${ENDPOINT}/${id}/`, data).then(r => r.data),
  patch: (id: number, data: Partial<Model>) => api.patch<Model>(`${ENDPOINT}/${id}/`, data).then(r => r.data),
  delete: (id: number) => api.delete(`${ENDPOINT}/${id}/`),
};