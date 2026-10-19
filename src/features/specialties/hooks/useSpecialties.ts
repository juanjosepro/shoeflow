import { useCallback, useEffect, useRef, useState } from "react";
import { specialtyService } from "../services/specialtyService";
import type { Specialty, SpecialtyFormData } from "../types/specialty";

// Igual que useCatalog, más reordenar: la tabla se actualiza al instante y los cambios se guardan después
export const useSpecialties = () => {
  const [items, setItems] = useState<Specialty[]>([]);
  const [loading, setLoading] = useState(true);
  const lastRequest = useRef(0);

  const refetch = useCallback(async () => {
    const requestId = ++lastRequest.current;
    try {
      const data = await specialtyService.getAll();
      if (requestId === lastRequest.current) setItems(data);
    } finally {
      if (requestId === lastRequest.current) setLoading(false);
    }
  }, []);

  useEffect(() => {
    refetch();
  }, [refetch]);

  const addItem = async (data: SpecialtyFormData) => {
    await specialtyService.create(data);
    await refetch();
  };

  const updateItem = async (id: number, data: SpecialtyFormData) => {
    await specialtyService.update(id, data);
    await refetch();
  };

  const toggleActive = async (item: Specialty) => {
    await specialtyService.patch(item.id, { is_active: !item.is_active });
    await refetch();
  };

  const deleteItem = async (id: number) => {
    await specialtyService.delete(id);
    await refetch();
  };

  // Recibe la lista en su nuevo orden: renumera 1, 2, 3... y guarda solo las que cambiaron
  const reorder = async (newList: Specialty[]) => {
    const renumbered = newList.map((item, index) => ({ ...item, order: index + 1 }));
    const changed = renumbered.filter((item, index) => item.order !== newList[index].order);

    setItems(renumbered); // se ve de inmediato
    try {
      await Promise.all(changed.map((item) => specialtyService.patch(item.id, { order: item.order })));
    } catch (error) {
      await refetch(); // si falló, vuelve al orden real
      throw error;
    }
  };

  return { items, loading, addItem, updateItem, toggleActive, deleteItem, reorder };
};