import api from "@/shared/lib/axios";
import type {
  Dozen,
  DozenQueryParams,
} from "../types/dozen";
import type { DozenFormData } from "../schemas/dozenSchema";
import type { PaginatedResponse } from "@/shared/types";

const ENDPOINT = "production/dozens";

export const dozenService = {
  getAll: (
    params?: Partial<DozenQueryParams>,
  ): Promise<PaginatedResponse<Dozen> | Dozen[]> => {
    const noPagination = params?.no_pagination;

    return noPagination
      ? api
          .get<Dozen[]>(`${ENDPOINT}/`, { params })
          .then((r) => r.data)
      : api
          .get<PaginatedResponse<Dozen>>(`${ENDPOINT}/`, { params })
          .then((r) => r.data);
  },
  getById: (id: number) => api.get<Dozen>(`${ENDPOINT}/${id}/`).then(r => r.data),
  create: (data: DozenFormData) => api.post<Dozen>(`${ENDPOINT}/`, data).then(r => r.data),
  update: (id: number, data: DozenFormData) => api.put<Dozen>(`${ENDPOINT}/${id}/`, data).then(r => r.data),
  patch: (id: number, data: Partial<Dozen>) => api.patch<Dozen>(`${ENDPOINT}/${id}/`, data).then(r => r.data),
  delete: (id: number) => api.delete(`${ENDPOINT}/${id}/`),

  dozenMetadata: () => api.get(`/production/dozen-metadata/`).then(r => r.data),
};