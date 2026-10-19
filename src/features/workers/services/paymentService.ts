import api from "@/shared/lib/axios";
import type { DozenAssignment } from "@/features/dozens/types/dozen";
import type {
  Adjustment,
  AdjustmentPayload,
  CreateSettlementPayload,
  PaymentPreview,
  PendingWeek,
  Settlement,
  SettlementDetail,
} from "../types/payment";

// OJO: ajusta este prefijo al que usas en el urls.py raíz para la app payroll
const PAYROLL = "payroll";

export const paymentService = {
  // Vista previa de la semana: etapas pendientes + ajustes + totales
  preview: (worker: number, startDate: string, endDate: string) =>
    api
      .get<PaymentPreview>(`${PAYROLL}/payments/preview/`, {
        params: { worker, start_date: startDate, end_date: endDate },
      })
      .then((r) => r.data),

  // Semanas con etapas sin pagar (para el selector de semana)
  getPendingWeeks: (worker: number) =>
    api
      .get<PendingWeek[]>(`${PAYROLL}/payments/pending-weeks/`, { params: { worker } })
      .then((r) => r.data),

  // Cierra el pago
  create: (data: CreateSettlementPayload) =>
    api.post<SettlementDetail>(`${PAYROLL}/payments/`, data).then((r) => r.data),

  // Pagos ya hechos de un trabajador
  getByWorker: (worker: number) =>
    api
      .get<Settlement[]>(`${PAYROLL}/payments/`, { params: { worker, no_pagination: true } })
      .then((r) => r.data),

  getDetail: (id: number) =>
    api.get<SettlementDetail>(`${PAYROLL}/payments/${id}/`).then((r) => r.data),

  // Todo el trabajo del trabajador (pagado y pendiente)
  getAssignmentsByWorker: (worker: number) =>
    api
      .get<DozenAssignment[]>("production/assignments/", { params: { worker } })
      .then((r) => r.data),

  // Bonos, descuentos y adelantos
  createAdjustment: (data: AdjustmentPayload) =>
    api.post<Adjustment>(`${PAYROLL}/adjustments/`, data).then((r) => r.data),

  deleteAdjustment: (id: number) => api.delete(`${PAYROLL}/adjustments/${id}/`),
};