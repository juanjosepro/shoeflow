import { useNavigate, useLocation } from "react-router-dom";

import { Sidebar as SidebarPrime } from "primereact/sidebar";
import "./Sidebar.scss";

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
      {
        label: "Tallas",
        icon: "pi pi-arrow-right-arrow-left",
        path: "/catalog/sizes",
      },
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
        label: "Docenas en proceso",
        icon: "pi pi-box",
        path: "/production/dozens/process",
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

export const Sidebar = ({ drawerOpen, setDrawerOpen, toggleTheme, isDark }) => {
  const navigate = useNavigate();
  const location = useLocation();

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
    <>
      <aside className="sf-layout__sidebar sf-sidebar-desktop">
        {sidebarContent}
      </aside>

      <SidebarPrime
        visible={drawerOpen}
        onHide={() => setDrawerOpen(false)}
        className="sf-sidebar-drawer"
        style={{ width: 260 }}
      >
        {sidebarContent}
      </SidebarPrime>
    </>
  );
};
