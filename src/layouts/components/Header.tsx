import { useRef } from "react";
import { Menu } from "primereact/menu";

export const Header = ({
  title = "Panel de producción",
  subtitle,
  onMenuClick,
}) => {
  const userMenuRef = useRef(null);

  const userMenuItems = [
    { label: "Mi perfil", icon: "pi pi-user" },
    { label: "Configuración", icon: "pi pi-cog" },
    { separator: true },
    { label: "Cerrar sesión", icon: "pi pi-sign-out" },
  ];

  return (
    <header className="taller-header">
      <div className="flex align-items-center gap-3">
        <button
          className="header-icon-btn mobile-only"
          aria-label="Abrir menú"
          onClick={onMenuClick}
        >
          <i className="pi pi-bars" />
        </button>
        <div>
          <h2 className="header-title">{title}</h2>
          {subtitle && <p className="header-subtitle">{subtitle}</p>}
        </div>
      </div>

      <label className="header-search">
        <i className="pi pi-search" />
        <input placeholder="Buscar docena, trabajador, código..." />
      </label>

      <div className="flex align-items-center justify-content-end gap-2">
        <button className="header-icon-btn" aria-label="Notificaciones">
          <i className="pi pi-bell" />
          <span className="header-badge">3</span>
        </button>

        <span className="header-divider" />

        <button
          className="header-user"
          onClick={(e) => userMenuRef.current.toggle(e)}
        >
          <span className="header-avatar">AD</span>
          <span className="header-user-text">
            <span className="name">Administrador</span>
            <span className="role">Admin</span>
          </span>
          <i
            className="pi pi-chevron-down"
            style={{ fontSize: 10, color: "var(--stone)" }}
          />
        </button>
        <Menu
          model={userMenuItems}
          popup
          ref={userMenuRef}
          className="taller-user-menu"
        />
      </div>
    </header>
  );
};

export default Header;
