import { useState, useEffect } from "react";
import { workerService } from "../services/workerService";
import type { Worker, WorkerFormData } from "../types/worker";

export const useWorkerDozens = ({ noPagination = false } = {}) => {
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchWorkers = async () => {
    setLoading(true);
    try {
      const data = await workerService.getAll(noPagination);
      setWorkers(data);
    } finally {
      setLoading(false);
    }
  };

  const addWorker = async (data: WorkerFormData) => {
    await workerService.create(data);
    await fetchWorkers();
  };

  const updateWorker = async (id: number, data: WorkerFormData) => {
    await workerService.update(id, data);
    await fetchWorkers();
  };

  const toggleWorkerStatus = async (id: number, currentStatus: boolean) => {
    await workerService.patch(id, { is_active: !currentStatus });
    await fetchWorkers();
  };

  const deleteWorker = async (id: number) => {
    await workerService.delete(id);
    await fetchWorkers();
  };

  useEffect(() => {
    const load = async () => { await fetchWorkers(); };
    load();
  }, []);

  return { workers, loading, addWorker, updateWorker, toggleWorkerStatus, deleteWorker };
};