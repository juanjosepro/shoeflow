import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { PanelMenu } from "primereact/panelmenu";
import "../theme2.css";
import DozensPage2 from "./DozensPage2";

export const AppLayout2 = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // El "template" custom nos permite resaltar el item activo comparando la ruta actual
  const linkTemplate = (label, path) => (item) => (
    <a
      className={`p-menuitem-link ${location.pathname === path ? "router-link-active" : ""}`}
      onClick={() => navigate(path)}
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

  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        background: "var(--paper)",
      }}
    >
      <aside
        style={{
          width: 220,
          flexShrink: 0,
          borderRight: "1px solid var(--line)",
          padding: "28px 14px",
        }}
      >
        <h1
          style={{
            fontSize: 15,
            fontWeight: 700,
            margin: "0 0 2px",
            paddingLeft: 10,
          }}
        >
          Taller
        </h1>
        <p
          style={{
            fontSize: 12,
            color: "var(--stone)",
            margin: "0 0 20px",
            paddingLeft: 10,
          }}
        >
          Panel de producción
        </p>

        <PanelMenu
          model={items}
          className="taller-panelmenu"
          multiple
          style={{ border: "none" }}
        />
      </aside>

      <main style={{ flex: 1, minWidth: 0, padding: "28px 32px 60px" }}>
        {/* <Outlet /> */}
        <DozensPage2 />
      </main>
    </div>
  );
};

export default AppLayout2;
