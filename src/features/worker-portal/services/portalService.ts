import type { SettlementDetail, Settlement } from "@/features/workers/types/payment";
import { portalApi } from "./portalApi";
import type {
  PortalAssignment,
  PortalLoginResponse,
  PortalSummary,
} from "../types/portal";

// Mismo prefijo que payroll en el urls.py raíz
const PORTAL = "payroll/portal";

export const portalService = {
  // pin es opcional: el servidor lo ignora mientras el PIN siga apagado
  login: (dni: string, pin?: string) =>
    portalApi
      .post<PortalLoginResponse>(`${PORTAL}/login/`, { dni, ...(pin ? { pin } : {}) })
      .then((r) => r.data),

  getSummary: () => portalApi.get<PortalSummary>(`${PORTAL}/summary/`).then((r) => r.data),

  getAssignments: () =>
    portalApi.get<PortalAssignment[]>(`${PORTAL}/assignments/`).then((r) => r.data),

  getPayments: () => portalApi.get<Settlement[]>(`${PORTAL}/payments/`).then((r) => r.data),

  getPaymentDetail: (id: number) =>
    portalApi.get<SettlementDetail>(`${PORTAL}/payments/${id}/`).then((r) => r.data),
};
