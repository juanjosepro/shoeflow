// [PED] ARCHIVO NUEVO ─ features/orders/hooks/useOrders.ts
import { useCallback, useEffect, useRef, useState } from "react";
import { orderService } from "../services/orderService";
import type { Order, OrderFilter } from "../types/order";

export const ORDERS_PAGE_SIZE = 10;

// Listado paginado: búsqueda con pausa al escribir, filtro rápido y (opcional) un cliente fijo
export const useOrders = (initialCustomer: number | null = null) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [debounced, setDebounced] = useState("");
  const [filter, setFilter] = useState<OrderFilter>(initialCustomer ? "all" : "open");
  const [customer, setCustomer] = useState<number | null>(initialCustomer);
  const lastRequest = useRef(0);

  useEffect(() => {
    const t = setTimeout(() => {
      setDebounced(search.trim());
      setPage(1);
    }, 350);
    return () => clearTimeout(t);
  }, [search]);

  const refetch = useCallback(async () => {
    const requestId = ++lastRequest.current;
    setLoading(true);
    try {
      const data = await orderService.getPaginated({
        search: debounced,
        filter,
        customer,
        page,
        limit: ORDERS_PAGE_SIZE,
      });
      if (requestId === lastRequest.current) {
        setOrders(data.results);
        setTotal(data.count);
      }
    } finally {
      if (requestId === lastRequest.current) setLoading(false);
    }
  }, [debounced, filter, customer, page]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  const changeFilter = (value: OrderFilter) => {
    setFilter(value);
    setPage(1);
  };

  const clearCustomer = () => {
    setCustomer(null);
    setPage(1);
  };

  return { orders, total, loading, page, setPage, search, setSearch, filter, changeFilter, customer, clearCustomer, refetch };
};
