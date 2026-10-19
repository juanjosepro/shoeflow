import { useState, useEffect, useCallback } from "react";
import { dozenService } from "../services/dozenService";
import type { AssignStagesPayload, Dozen, DozenQueryParams, DozenStatusAction, UseDozensConfig } from "../types/dozen";
import type { DozenPayload } from "../schemas/dozenSchema";

const DEFAULT_QUERY_PARAMS: DozenQueryParams = {
  search: "", model: null, size: null, status: null,
  material_type: null, color: null, plant_type: null, priority: null,
  page: 1, limit: 15,
};

export const useDozens = (config: UseDozensConfig = { autoLoad: true, exclude_finished: false, no_pagination: false }) => {
  const [dozens, setDozens] = useState<Dozen[]>([]);
  const [loading, setLoading] = useState(config.autoLoad); // Evitamos loading parpadeante si es false
  const [total, setTotal] = useState(0);

  const [queryParams, setQueryParams] =
    useState<DozenQueryParams>({
      ...DEFAULT_QUERY_PARAMS,
      exclude_finished: config.exclude_finished,
      no_pagination: config.no_pagination,
});

  // Usamos useCallback para que estas funciones mantengan su referencia en memoria
  const fetchDozens = useCallback(async () => {
    setLoading(true);
    try {
      const data = await dozenService.getAll(queryParams);
     
      if (queryParams.no_pagination) {
        setDozens(data);
        setTotal(data.length);
      } else {
        setDozens(data.results);
        setTotal(data.count);
      }
    } finally {
      setLoading(false);
    }
  }, [queryParams]);

  const addDozen = async (data: DozenPayload) => {
    return await dozenService.create(data);
  };

  const updateDozen = async (id: number, data: DozenPayload) => {
    return await dozenService.update(id, data);
  };

  const toggleDozenStatus = async (id: number, currentStatus: boolean) => {
    await dozenService.patch(id, { is_active: !currentStatus });
    if (config.autoLoad) await fetchDozens(); // Solo re-enlista si la página renderiza la lista
  };

  const deleteDozen = async (id: number) => {
    await dozenService.delete(id);
    if (config.autoLoad) await fetchDozens();
  };

  // assignStages ahora devuelve la docena:
  const assignStages = async (dozenId: number, payload: AssignStagesPayload) => {
    const dozen = await dozenService.assignStages(dozenId, payload);
    if (config.autoLoad) await fetchDozens();
    return dozen;
  };
  const changeDozenStatus = async (id: number, action: DozenStatusAction) => {
    await dozenService.changeStatus(id, action);
    if (config.autoLoad) await fetchDozens();
  };

  useEffect(() => {
    if (config.autoLoad) {
      fetchDozens();
    }
  }, [config.autoLoad, fetchDozens]);

  return {
    dozens,
    total,
    loading,
    queryParams,
    setQueryParams,
    addDozen,
    updateDozen,
    toggleDozenStatus,
    deleteDozen,
    fetchDozens,
    assignStages,
    changeDozenStatus,
  };
};