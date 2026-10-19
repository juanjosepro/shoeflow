import type { DozenAssignment } from "@/features/dozens/types/dozen";

// Tipos de ajuste que se crean a mano. "SALDO" lo genera el sistema solo
// cuando un pago deja deuda, por eso no aparece aquí.
export type AdjustmentType = "BONO" | "DESCUENTO" | "ADELANTO" | "SALDO";

export interface Adjustment {
  id: number;
  worker: number;
  worker_name: string;
  settlement: number | null; // null = aún no aplicado a ningún pago
  type: AdjustmentType;
  type_label: string;
  amount: string; // siempre positivo
  signed_amount: string; // con signo: descuentos y adelantos restan
  reason: string;
  created_at: string;
}

export interface AdjustmentPayload {
  worker: number;
  type: Exclude<AdjustmentType, "SALDO">;
  amount: number;
  reason: string;
}

// Lo que se pagaría hoy (no guarda nada)
export interface PaymentPreview {
  worker: { id: number; names: string };
  start_date: string;
  end_date: string;
  items: DozenAssignment[];
  adjustments: Adjustment[];
  total_earned: string;
  total_adjustments: string;
  total_to_pay: string;
}

// Semana (lunes a domingo) en la que el trabajador tiene etapas sin pagar
export interface PendingWeek {
  start_date: string; // lunes
  end_date: string; // domingo
  count: number;
  amount: string;
}

export interface Settlement {
  id: number;
  worker: { id: number; names: string };
  start_date: string;
  end_date: string;
  total_earned: string;
  total_adjustments: string;
  total_to_pay: string;
  amount_paid: string;
  pending_balance: string;
  description: string | null;
  created_at: string;
}

export interface SettlementDetail extends Settlement {
  items: DozenAssignment[];
  adjustments: Adjustment[];
}

export interface CreateSettlementPayload {
  worker: number;
  start_date: string; // YYYY-MM-DD
  end_date: string;
  assignment_ids: number[]; // etapas que se pagan; las demás siguen pendientes
  amount_paid?: number; // omitido = el total; con selección parcial no se puede cambiar
  description?: string;
}