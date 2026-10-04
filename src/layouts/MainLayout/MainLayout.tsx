import { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import { Header } from "./components/Header/Header";
import { Sidebar } from "./components/Sidebar/Sidebar";
import "./MainLayout.scss";

function useTheme() {
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

export const MainLayout = () => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [theme, toggleTheme] = useTheme();
  const isDark = theme === "dark";

  return (
    <div className="sf-layout">
      <Sidebar
        drawerOpen={drawerOpen}
        setDrawerOpen={setDrawerOpen}
        toggleTheme={toggleTheme}
        isDark={isDark}
      />

      <div className="flex flex-column flex-1 min-w-0">
        <main className="sf-layout__main">
          <Header
            title="Panel de producción"
            subtitle="Docenas, equipos y trabajadores"
            onMenuClick={() => setDrawerOpen(true)}
          />
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
