import { useState, useEffect, useCallback } from "react";
import { dozenService } from "../services/dozenService";
import type { Dozen, DozenFormData } from "../types/dozen";

// Tipado para la estructura de listas ordenadas de tu Metadata
interface MetadataItem {
  key: string;
  label: string;
}

interface DozenMetadata {
  statuses: MetadataItem[];
  materials: MetadataItem[];
  colors: MetadataItem[];
  assignment_statuses: MetadataItem[];
}

interface UseDozensConfig {
  autoLoad?: boolean; // Controla si dispara el listado automáticamente
}

export const useDozens = (config: UseDozensConfig = { autoLoad: true }) => {
  const [dozens, setDozens] = useState<Dozen[]>([]);
  const [metadata, setMetadata] = useState<DozenMetadata | null>(null);
  const [loading, setLoading] = useState(config.autoLoad); // Evitamos loading parpadeante si es false

  // Usamos useCallback para que estas funciones mantengan su referencia en memoria
  const fetchDozens = useCallback(async () => {
    setLoading(true);
    try {
      const data = await dozenService.getAll();
      setDozens(data);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchDozensMetadata = useCallback(async () => {
    try {
      const data = await dozenService.dozenMetadata();
      setMetadata(data);
    } catch (error) {
      console.error("Error cargando metadatos", error);
    }
  }, []);

  const addDozen = async (data: DozenFormData) => {
    return await dozenService.create(data);
  };

  const updateDozen = async (id: number, data: DozenFormData) => {
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

  useEffect(() => {
    if (config.autoLoad) {
      fetchDozens();
    }
  }, [config.autoLoad, fetchDozens]);

  return {
    dozens,
    metadata,
    loading,
    addDozen,
    updateDozen,
    toggleDozenStatus,
    deleteDozen,
    fetchDozensMetadata,
    fetchDozens
  };
};