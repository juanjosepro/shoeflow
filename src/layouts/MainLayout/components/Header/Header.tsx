import { useRef } from "react";
import { Menu } from "primereact/menu";
import "./Header.scss";
import { useAuth } from "@/features/auth/hooks/useAuth";

export const Header = ({
  title = "Panel de producción",
  subtitle,
  onMenuClick,
}) => {
  const { user, logout } = useAuth();
  const userMenuRef = useRef(null);

  const userMenuItems = [
    { label: "Mi perfil", icon: "pi pi-user" },
    { label: "Configuración", icon: "pi pi-cog" },
    { separator: true },
    { 
      label: "Cerrar sesión",
      icon: "pi pi-sign-out",
      template: (item, options) => (
        <button
          onClick={() => logout()}
          className="w-full p-link flex align-items-center px-3 py-2 border-noround sf-menu-btn"
        >
          <a className="flex items-center">
              <span className={item.icon} />
              <span
                className="mx-2"
                style={{ fontSize: "0.875rem" }}
                dangerouslySetInnerHTML={{ __html: item.label }}
              />
          </a>
        </button>
      ),
     },
  ];

  return (
    <header className="sf-layout__header">
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
          onClick={(e) => userMenuRef.current?.toggle(e)}
        >
          <span className="header-avatar">{user?.first_name?.substring(0, 1)}{user?.last_name?.substring(0, 1)}</span>
          <span className="header-user-text">
            <span className="name">{user?.first_name}</span>
            <span className="role">{user?.username}</span>
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
          className="sf-user-menu"
        />
      </div>
    </header>
  );
};

export default Header;
