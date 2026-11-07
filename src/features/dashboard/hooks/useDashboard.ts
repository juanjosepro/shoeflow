import { useCallback, useEffect, useState } from "react";
import { dashboardService } from "../services/dashboardService";
import type { DashboardData } from "../types/dashboard";

export const useDashboard = (weeks: number) => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      setData(await dashboardService.get(weeks));
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [weeks]);

  useEffect(() => {
    load();
  }, [load]);

  return { data, loading, error, reload: load };
};
