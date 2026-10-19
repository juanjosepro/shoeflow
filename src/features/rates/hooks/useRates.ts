import { useCallback, useEffect, useRef, useState } from "react";
import { rateService } from "../services/rateService";
import type { Rate, RateFormData, RateQueryParams } from "../types/rate";

export const RATES_PAGE_SIZE = 15; // debe coincidir con PAGE_SIZE de Django

interface UseRatesOptions {
  query?: Partial<RateQueryParams>;
}

export const useRates = ({ query }: UseRatesOptions = {}) => {
  const [rates, setRates] = useState<Rate[]>([]);
  const [count, setCount] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const queryKey = JSON.stringify(query ?? {});
  const lastRequest = useRef(0);
  const lastPage = useRef(1); // recuerda la página para repetir la consulta tras guardar

  const getPaginated = useCallback(
    async (pageNumber = 1) => {
      lastPage.current = pageNumber;
      const requestId = ++lastRequest.current;
      setLoading(true);
      try {
        const data = await rateService.getPaginated(JSON.parse(queryKey), pageNumber);
        if (requestId !== lastRequest.current) return; // llegó una respuesta más nueva
        setRates(data.results);
        setCount(data.count);
        setPage(pageNumber);
      } finally {
        if (requestId === lastRequest.current) setLoading(false);
      }
    },
    [queryKey],
  );

  const refetch = useCallback(() => getPaginated(lastPage.current), [getPaginated]);

  // Carga al montar y cada vez que cambian los filtros (vuelve a la página 1)
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    getPaginated(1);
  }, [getPaginated]);

  const addRate = async (data: RateFormData) => {
    await rateService.create(data);
    await refetch();
  };

  const updateRate = async (id: number, data: RateFormData) => {
    await rateService.update(id, data);
    await refetch();
  };

  const deleteRate = async (id: number) => {
    await rateService.delete(id);
    // Si se borró el último de la página, retroceder una
    if (rates.length === 1 && lastPage.current > 1) await getPaginated(lastPage.current - 1);
    else await refetch();
  };

  return { rates, count, page, loading, getPaginated, refetch, addRate, updateRate, deleteRate };
};