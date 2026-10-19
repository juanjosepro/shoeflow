import api from "@/shared/lib/axios";
import type {
  AssignStagesPayload,
  Dozen,
  DozenQueryParams,
  DozenStatusAction,
  StageRow,
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

  getStageOptions: (id: number) =>
    api.get<StageRow[]>(`${ENDPOINT}/${id}/stage-options/`).then((r) => r.data),
  assignStages: (id: number, payload: AssignStagesPayload) =>
    api.post<Dozen>(`${ENDPOINT}/${id}/assign-stages/`, payload).then((r) => r.data),
  changeStatus: (id: number, action: DozenStatusAction) =>
    api.post<Dozen>(`${ENDPOINT}/${id}/${action}/`).then((r) => r.data),
};