import { useEffect, useState } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { Sidebar } from "primereact/sidebar";
import { Header } from "./components/Header";

const NAV_SECTIONS = [
  {
    label: "Personal",
    items: [
      { label: "Equipos", icon: "pi pi-sitemap", path: "/staff/teams" },
      {
        label: "Trabajadores",
        icon: "pi pi-users",
        path: "/staff/workers",
      },
    ],
  },
  {
    label: "General",
    items: [
      { label: "Modelos", icon: "pi pi-box", path: "/catalog/models" },
      { label: "Colores", icon: "pi pi-palette", path: "/catalog/colors" },
    ],
  },
  {
    label: "Producción",
    items: [
      {
        label: "Todas las docenas",
        icon: "pi pi-box",
        path: "/production/dozens",
      },
      {
        label: "Corte",
        icon: "pi pi-verified",
        path: "/production/dozens/corte",
      },
      {
        label: "Aparado → Armado",
        icon: "pi pi-arrow-right-arrow-left",
        path: "/production/dozens/armado",
      },
      {
        label: "Armado → Rematado",
        icon: "pi pi-arrow-right-arrow-left",
        path: "/docenas/rematado",
      },
      {
        label: "Rematado → Calidad",
        icon: "pi pi-shield",
        path: "/docenas/calidad",
      },
    ],
  },
];

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

export const AdminLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [theme, toggleTheme] = useTheme();
  const isDark = theme === "dark";

  const goTo = (path) => {
    navigate(path);
    setDrawerOpen(false);
  };

  const sidebarContent = (
    <>
      <div className="brand-row">
        <span className="brand-mark">T</span>
        <strong>Taller</strong>
        <i className="pi pi-chevron-down" />
      </div>

      <nav className="nav-scroll">
        {NAV_SECTIONS.map((section) => (
          <div key={section.label} className="mb-3">
            <p className="nav-section-label">{section.label}</p>
            {section.items.map((item) => (
              <button
                key={item.path}
                className={`nav-item ${location.pathname === item.path ? "active" : ""}`}
                onClick={() => goTo(item.path)}
              >
                <i className={item.icon} />
                {item.label}
              </button>
            ))}
          </div>
        ))}
      </nav>

      <div className="theme-card">
        <span className="theme-card-badge">
          <i className={`pi ${isDark ? "pi-moon" : "pi-sun"}`} />
        </span>
        <p className="theme-card-title">
          {isDark ? "Modo oscuro activo" : "Modo claro activo"}
        </p>
        <p className="theme-card-sub">
          {isDark
            ? "Cambia a claro para el día"
            : "Cambia a oscuro para la noche"}
        </p>
        <button className="theme-card-btn" onClick={toggleTheme}>
          Cambiar a {isDark ? "claro" : "oscuro"}
          <i className="pi pi-arrow-right" style={{ fontSize: 11 }} />
        </button>
      </div>
    </>
  );

  return (
    <div className="taller-shell">
      <aside className="taller-sidebar taller-sidebar-desktop">
        {sidebarContent}
      </aside>

      <Sidebar
        visible={drawerOpen}
        onHide={() => setDrawerOpen(false)}
        className="taller-sidebar-drawer"
        style={{ width: 260 }}
      >
        {sidebarContent}
      </Sidebar>

      <div className="flex flex-column flex-1" style={{ minWidth: 0 }}>
        <main className="taller-main">
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

export default AdminLayout;
