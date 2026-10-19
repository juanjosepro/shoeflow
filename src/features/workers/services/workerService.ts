import api from "@/shared/lib/axios";
import type { Worker, WorkerFormData, WorkerQueryParams } from "../types/worker";
import type { PaginatedResponse } from "@/shared/types";

const ENDPOINT = "staff/workers";

const toQuery = (query: WorkerQueryParams = {}) => ({
  search: query.search || undefined,
  is_active: query.is_active,
});

export const workerService = {
  getAll: (query?: WorkerQueryParams) =>
    api
      .get<Worker[]>(`${ENDPOINT}/`, { params: { ...toQuery(query), no_pagination: true } })
      .then(r => r.data),

  getPaginated: (query?: WorkerQueryParams, page = 1) =>
    api
      .get<PaginatedResponse<Worker>>(`${ENDPOINT}/`, { params: { ...toQuery(query), page } })
      .then(r => r.data),

  getById: (id: number) => api.get<Worker>(`${ENDPOINT}/${id}/`).then(r => r.data),
  create: (data: WorkerFormData) => api.post<Worker>(`${ENDPOINT}/`, data).then(r => r.data),
  update: (id: number, data: WorkerFormData) => api.put<Worker>(`${ENDPOINT}/${id}/`, data).then(r => r.data),
  patch: (id: number, data: Partial<Worker>) => api.patch<Worker>(`${ENDPOINT}/${id}/`, data).then(r => r.data),
  delete: (id: number) => api.delete(`${ENDPOINT}/${id}/`),
};