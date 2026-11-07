import type { Adjustment, PendingWeek, Settlement } from "@/features/workers/types/payment";
import type { HistoryAssignment } from "@/features/workers/components/WorkerHistoryView";

export interface PortalWorker {
  id: number;
  names: string;
}

export interface PortalLoginResponse {
  token: string;
  expires_in: number; // segundos
  worker: PortalWorker;
}

// Lo que se guarda en el navegador del trabajador
export interface PortalSession {
  token: string;
  worker: PortalWorker;
  expires_at: number; // ms desde epoch
}

// Una etapa suya (sin trabajador ni notas del administrador)
export interface PortalAssignment extends HistoryAssignment {
  status: string;
  delivered_at: string;
  unit_price: string;
}

export interface PortalSummary {
  worker: PortalWorker;
  pending_count: number; // etapas terminadas sin pagar
  total_earned: string; // lo ganado y pendiente
  total_adjustments: string; // bonos - descuentos - adelantos +/- saldos (con signo)
  total_to_pay: string; // lo que le corresponde cobrar hoy
  pending_weeks: PendingWeek[];
  pending_adjustments: Adjustment[];
  last_payment: Settlement | null;
}
