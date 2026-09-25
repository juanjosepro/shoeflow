import api from "@/shared/lib/axios";
import type { WorkerFormData, Worker } from "../types/worker";
import type { PaginatedResponse } from "@/shared/types";

const ENDPOINT = "staff/workers";

export const workerService = {
  // getAll: () => api.get<PaginatedResponse<Model>>(`${ENDPOINT}/`).then(r => r.data.results),
  getAll: (noPagination = false) => {
    const url = noPagination ? `${ENDPOINT}/?no_pagination=true` : `${ENDPOINT}/`;
    return noPagination
      ? api.get<Worker[]>(url).then(r => r.data)
      : api.get<PaginatedResponse<Worker>>(url).then(r => r.data.results);
  },
  getById: (id: number) => api.get<Worker>(`${ENDPOINT}/${id}/`).then(r => r.data),
  create: (data: WorkerFormData) => api.post<Worker>(`${ENDPOINT}/`, data).then(r => r.data),
  update: (id: number, data: WorkerFormData) => api.put<Worker>(`${ENDPOINT}/${id}/`, data).then(r => r.data),
  patch: (id: number, data: Partial<Worker>) => api.patch<Worker>(`${ENDPOINT}/${id}/`, data).then(r => r.data),
  delete: (id: number) => api.delete(`${ENDPOINT}/${id}/`),
};