import { useState, useEffect, useCallback, useRef } from "react";
import { workerService } from "../services/workerService";
import type { Worker, WorkerFormData, WorkerQueryParams } from "../types/worker";

interface UseWorkersOptions {
  query?: WorkerQueryParams;
  autoLoad?: boolean;
}

type Mode = { type: "paginated"; page: number } | { type: "all" };

export const PAGE_SIZE = 15; // debe coincidir con PAGE_SIZE de Django

export const useWorkers = ({ query, autoLoad = true }: UseWorkersOptions = {}) => {
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [count, setCount] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(autoLoad);

  const queryKey = JSON.stringify(query ?? {});
  const lastRequest = useRef(0);
  const lastMode = useRef<Mode>({ type: "paginated", page: 1 }); // recuerda cuál usaste por última vez

  const getAll = useCallback(async () => {
    lastMode.current = { type: "all" };
    const requestId = ++lastRequest.current;
    setLoading(true);
    try {
      const data = await workerService.getAll(JSON.parse(queryKey));
      if (requestId !== lastRequest.current) return;
      setWorkers(data);
      setCount(data.length);
    } finally {
      if (requestId === lastRequest.current) setLoading(false);
    }
  }, [queryKey]);

  const getPaginated = useCallback(
    async (pageNumber = 1) => {
      lastMode.current = { type: "paginated", page: pageNumber };
      const requestId = ++lastRequest.current;
      setLoading(true);
      try {
        const data = await workerService.getPaginated(JSON.parse(queryKey), pageNumber);
        if (requestId !== lastRequest.current) return;
        setWorkers(data.results);
        setCount(data.count);
        setPage(pageNumber);
      } finally {
        if (requestId === lastRequest.current) setLoading(false);
      }
    },
    [queryKey],
  );

  // Repite la última consulta que hiciste (la misma modalidad y página)
  const refetch = useCallback(() => {
    const mode = lastMode.current;
    return mode.type === "all" ? getAll() : getPaginated(mode.page);
  }, [getAll, getPaginated]);

  // Carga automática: al montar y cuando cambian los filtros
  useEffect(() => {
    if (!autoLoad) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    getPaginated(1);
  }, [autoLoad, getPaginated]);

  const addWorker = async (data: WorkerFormData) => {
    await workerService.create(data);
    await refetch();
  };

  const updateWorker = async (id: number, data: WorkerFormData) => {
    await workerService.update(id, data);
    await refetch();
  };

  const toggleWorkerStatus = async (id: number, currentStatus: boolean) => {
    await workerService.patch(id, { is_active: !currentStatus });
    await refetch();
  };

  const deleteWorker = async (id: number) => {
    await workerService.delete(id);
    await refetch();
  };

  return {
    workers,
    count,
    page,
    loading,
    getAll,
    getPaginated,
    refetch,
    addWorker,
    updateWorker,
    toggleWorkerStatus,
    deleteWorker,
  };
};