import { useState, useEffect } from "react";

export const useDebounce = <T,>(value: T, delay = 400) => {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer); // si escribe otra tecla, cancela el anterior
  }, [value, delay]);

  return debounced;
};