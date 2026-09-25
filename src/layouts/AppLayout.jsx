import { useState } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { PanelMenu } from "primereact/panelmenu";
import { Sidebar } from "primereact/sidebar";
import "../theme.css";
import DozensPage from "./DozensPage";

export const AppLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [drawerOpen, setDrawerOpen] = useState(false);

  // El "template" custom nos permite resaltar el item activo comparando la ruta actual
  const linkTemplate = (label, path) => (item) => (
    <a
      className={`p-menuitem-link ${location.pathname === path ? "router-link-active" : ""}`}
      onClick={() => {
        navigate(path);
        setDrawerOpen(false);
      }}
    >
      <span className="p-menuitem-text">{label}</span>
    </a>
  );

  const items = [
    {
      label: "Personal",
      icon: "pi pi-users",
      items: [
        {
          label: "Equipos",
          template: linkTemplate("Equipos", "/personal/equipos"),
        },
        {
          label: "Trabajadores",
          template: linkTemplate("Trabajadores", "/personal/trabajadores"),
        },
      ],
    },
    {
      label: "Docenas",
      icon: "pi pi-box",
      items: [
        { label: "Todas", template: linkTemplate("Todas", "/docenas") },
        { label: "Corte", template: linkTemplate("Corte", "/docenas/corte") },
        {
          label: "Aparado → Armado",
          template: linkTemplate("Aparado → Armado", "/docenas/armado"),
        },
        {
          label: "Armado → Rematado",
          template: linkTemplate("Armado → Rematado", "/docenas/rematado"),
        },
        {
          label: "Rematado → Calidad",
          template: linkTemplate("Rematado → Calidad", "/docenas/calidad"),
        },
      ],
    },
  ];

  const sidebarContent = (
    <>
      <div className="taller-brand">
        <span className="taller-brand-mark">T</span>
        <div className="taller-brand-text">
          <h1>Taller</h1>
          <p>Panel de producción</p>
        </div>
      </div>

      <nav className="taller-nav">
        <PanelMenu model={items} className="taller-panelmenu" multiple />
      </nav>

      <div className="taller-sidebar-footer">
        <span className="taller-avatar">AD</span>
        <div>
          <div className="name">Administrador</div>
          <div className="role">Sesión activa</div>
        </div>
      </div>
    </>
  );

  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        background: "var(--paper)",
      }}
    >
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

      <div
        style={{
          flex: 1,
          minWidth: 0,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div className="taller-topbar-mobile">
          <button aria-label="Abrir menú" onClick={() => setDrawerOpen(true)}>
            <i className="pi pi-bars" />
          </button>
          <span
            className="taller-brand-mark"
            style={{ width: 22, height: 22, fontSize: 11 }}
          >
            T
          </span>
          <strong style={{ fontSize: 14 }}>Taller</strong>
        </div>

        <main className="taller-main">
          {/* <Outlet /> */}
          <DozensPage></DozensPage>
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
