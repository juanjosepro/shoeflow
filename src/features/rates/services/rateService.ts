import api from "@/shared/lib/axios";
import type { PaginatedResponse } from "@/shared/types";
// import type { Rate, RateCoverage, RateFormData, RateQueryParams } from "../types/rate";
import type { MissingBaseSpecialty, Rate, RateFormData, RateQueryParams } from "../types/rate";

// OJO: ajusta este prefijo al que usas en el urls.py raíz para la app payroll
const ENDPOINT = "payroll/rates";

// Los filtros vacíos (null) no se envían
const toQuery = (query: Partial<RateQueryParams> = {}) => ({
  specialty: query.specialty ?? undefined,
  model: query.model ?? undefined,
  size: query.size ?? undefined,
  material_type: query.material_type ?? undefined,
  plant_type: query.plant_type ?? undefined,
});

export const rateService = {
  getPaginated: (query?: Partial<RateQueryParams>, page = 1) =>
    api
      .get<PaginatedResponse<Rate>>(`${ENDPOINT}/`, { params: { ...toQuery(query), page } })
      .then((r) => r.data),

  create: (data: RateFormData) => api.post<Rate>(`${ENDPOINT}/`, data).then((r) => r.data),
  update: (id: number, data: RateFormData) => api.put<Rate>(`${ENDPOINT}/${id}/`, data).then((r) => r.data),
  delete: (id: number) => api.delete(`${ENDPOINT}/${id}/`),
  // Combinaciones sin tarifa (o con tarifa solo para algunos materiales/plantas)
  // getCoverage: () => api.get<RateCoverage>(`${ENDPOINT}/coverage/`).then((r) => r.data),
  // Etapas activas sin tarifa base (solo etapas antiguas: las nuevas la crean solas)
  getMissingBase: () =>
    api.get<MissingBaseSpecialty[]>(`${ENDPOINT}/missing-base/`).then((r) => r.data),
};