import { useCallback, useEffect, useRef, useState } from "react";
import type { CatalogService } from "./../types/catalog";

// CRUD sin paginación para las tablas del catálogo.
// `service` debe ser siempre el mismo objeto (se declara una vez, fuera del componente).
export const useCatalog = <T extends { id: number; is_active?: boolean }, F extends { is_active?: boolean }>(
  service: CatalogService<T, F>,
) => {
  const [items, setItems] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const lastRequest = useRef(0);

  const refetch = useCallback(async () => {
    const requestId = ++lastRequest.current;
    try {
      const data = await service.getAll();
      if (requestId === lastRequest.current) setItems(data);
    } finally {
      if (requestId === lastRequest.current) setLoading(false);
    }
  }, [service]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  const addItem = async (data: F) => {
    await service.create(data);
    await refetch();
  };

  const updateItem = async (id: number, data: F) => {
    await service.update(id, data);
    await refetch();
  };

  const toggleActive = async (item: T) => {
    await service.patch(item.id, { is_active: !item.is_active } as Partial<F>);
    await refetch();
  };

  const deleteItem = async (id: number) => {
    await service.delete(id);
    await refetch();
  };

  return { items, loading, refetch, addItem, updateItem, toggleActive, deleteItem };
};