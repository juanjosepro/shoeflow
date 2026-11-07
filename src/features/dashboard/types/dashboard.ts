// Respuesta de GET production/dozens/dashboard/ — todo en docenas (pares / 12)
export interface DashboardCards {
  in_process: number;
  pending: number;
  completed_period: number;
  registered_period: number;
  completed_this_week: number;
  completed_last_week: number | null;
  stale: number;
  stale_count: number;
  rejected_period: number;
  to_pay: number; // soles
  paid_period: number; // soles
  labor_cost_period: number; // soles
}

export interface WeekPoint {
  week_start: string; // lunes, ISO
  registered: number;
  completed: number;
  paid: number;
}

export interface FunnelStage {
  id: number;
  name: string;
  waiting: number; // docenas que esperan esta etapa
  done: number; // docenas que la pasaron en el periodo
}

export interface DashboardAlert {
  level: "warn" | "info" | "danger";
  code: string;
  text: string;
}

export interface DashboardData {
  weeks: number;
  from: string;
  to: string;
  cards: DashboardCards;
  weekly: WeekPoint[];
  funnel: FunnelStage[];
  by_priority: { key: string; dozens: number }[];
  by_model: { name: string; dozens: number }[];
  top_workers: { name: string; dozens: number; amount: number }[];
  pending_workers: { name: string; amount: number; dozens: number }[];
  alerts: DashboardAlert[];
}

export const WEEK_OPTIONS = [4, 8, 12, 26] as const;
