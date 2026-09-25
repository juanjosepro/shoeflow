import { useState, useEffect } from "react";
import { modelService } from "../services/modelService";
import type { Model, ModelFormData } from "../types/model";

export const useModels = ({ noPagination = false } = {}) => {
  const [models, setModels] = useState<Model[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchModels = async () => {
    setLoading(true);
    try {
      const data = await modelService.getAll(noPagination);
      setModels(data);
    } finally {
      setLoading(false);
    }
  };

  const addModel = async (data: ModelFormData) => {
    await modelService.create(data);
    await fetchModels();
  };

  const updateModel = async (id: number, data: ModelFormData) => {
    await modelService.update(id, data);
    await fetchModels();
  };

  const toggleModelStatus = async (id: number, currentStatus: boolean) => {
    await modelService.patch(id, { is_active: !currentStatus });
    await fetchModels();
  };

  const deleteModel = async (id: number) => {
    await modelService.delete(id);
    await fetchModels();
  };

  useEffect(() => {
    const load = async () => { await fetchModels(); };
    load();
  }, []);

  return { models, loading, addModel, updateModel, toggleModelStatus, deleteModel };
};