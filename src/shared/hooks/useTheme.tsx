import { useEffect, useState } from "react";

/**
 * Hook de tema compartido — úsalo tanto en AppLayout como en LoginPage
 * (o cualquier pantalla que se monte antes de la app autenticada)
 * para que el data-theme del <html> sea consistente en toda la app.
 */
export function useTheme() {
  const [theme, setTheme] = useState(() => {
    try {
      return localStorage.getItem("taller-theme") || "dark";
    } catch {
      return "dark";
    }
  });

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    try {
      localStorage.setItem("taller-theme", theme);
    } catch {
      // almacenamiento no disponible, seguimos solo en memoria
    }
  }, [theme]);

  const toggle = () => setTheme((t) => (t === "dark" ? "light" : "dark"));
  return [theme, toggle];
}

export default useTheme;
