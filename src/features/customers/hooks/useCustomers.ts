// [PED] ARCHIVO NUEVO ─ features/customers/hooks/useCustomers.ts
import { useCallback, useEffect, useRef, useState } from "react";
import { customerService } from "../services/customerService";
import type { Customer, CustomerActiveFilter, CustomerFormData } from "../types/customer";

export const CUSTOMERS_PAGE_SIZE = 10;

// Listado paginado con búsqueda (con pausa al escribir) y filtro activo/inactivo
export const useCustomers = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [debounced, setDebounced] = useState("");
  const [activeFilter, setActiveFilter] = useState<CustomerActiveFilter>("active");
  const lastRequest = useRef(0);

  // Espera 350 ms después de la última tecla antes de buscar
  useEffect(() => {
    const t = setTimeout(() => {
      setDebounced(search.trim());
      setPage(1);
    }, 350);
    return () => clearTimeout(t);
  }, [search]);

  const refetch = useCallback(async () => {
    const requestId = ++lastRequest.current; // ignora respuestas viejas
    setLoading(true);
    try {
      const data = await customerService.getPaginated({
        search: debounced,
        is_active: activeFilter === "all" ? null : activeFilter === "active",
        page,
        limit: CUSTOMERS_PAGE_SIZE,
      });
      if (requestId === lastRequest.current) {
        setCustomers(data.results);
        setTotal(data.count);
      }
    } finally {
      if (requestId === lastRequest.current) setLoading(false);
    }
  }, [debounced, activeFilter, page]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  const changeFilter = (value: CustomerActiveFilter) => {
    setActiveFilter(value);
    setPage(1);
  };

  const addCustomer = async (data: CustomerFormData) => {
    const created = await customerService.create(data);
    await refetch();
    return created;
  };

  const updateCustomer = async (id: number, data: CustomerFormData) => {
    const updated = await customerService.update(id, data);
    await refetch();
    return updated;
  };

  const toggleActive = async (customer: Customer) => {
    await customerService.patch(customer.id, { is_active: !customer.is_active });
    await refetch();
  };

  const deleteCustomer = async (id: number) => {
    await customerService.delete(id);
    await refetch();
  };

  return {
    customers,
    total,
    loading,
    page,
    setPage,
    search,
    setSearch,
    activeFilter,
    changeFilter,
    addCustomer,
    updateCustomer,
    toggleActive,
    deleteCustomer,
  };
};

// Clientes activos para los selectores (formulario de pedido y de docena)
export const useCustomerOptions = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    try {
      setCustomers(await customerService.getOptions());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  return { customers, loading, reload };
};
