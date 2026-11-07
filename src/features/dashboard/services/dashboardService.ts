import api from "@/shared/lib/axios";
import type { DashboardData } from "../types/dashboard";

export const dashboardService = {
  // Ajusta el prefijo si tu ruta de producción es otra
  get: (weeks: number) =>
    api.get<DashboardData>("production/dozens/dashboard/", { params: { weeks } }).then((r) => r.data),
};
