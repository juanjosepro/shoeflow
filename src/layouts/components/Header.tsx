import { Menubar } from "primereact/menubar";
import { InputText } from "primereact/inputtext";
import { Badge } from "primereact/badge";
import { Avatar } from "primereact/avatar";
import { TieredMenu } from "primereact/tieredmenu";
import { useRef } from "react";
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useThemeStore } from '@/store/themeStore';
import { Button } from "primereact/button";

export default function Header() {
  const { user, logout } = useAuth();
  const { dark, toggle } = useThemeStore();
  const navigate = useNavigate();
  const menu = useRef(null);

  const itemRenderer = (item) => (
    <a className="flex align-items-center p-menuitem-link">
      <span className={item.icon} />
      <span className="mx-2">{item.label}</span>
      {item.badge && <Badge className="ml-auto" value={item.badge} />}
      {item.shortcut && (
        <span className="ml-auto border-1 surface-border border-round surface-100 text-xs p-1">
          {item.shortcut}
        </span>
      )}
    </a>
  );
  const items = [
    {
      label: "Inicio",
      icon: "pi pi-home",
      command: () => {
        navigate("/dozens");
      },
    },
    {
      label: "Modelos",
      icon: "pi pi-star",
      command: () => {
        navigate("/models");
      },
    },
    {
      label: "Docenas",
      items: [
        {
          label: "Listado",
          icon: "pi pi-bolt",
          shortcut: "⌘+S",
          template: itemRenderer,
          command: () => {
            navigate("/dozens");
          },
        },
        {
          label: "Registrar",
          icon: "pi pi-server",
          shortcut: "⌘+B",
          template: itemRenderer,
        },
        {
          label: "UI Kit",
          icon: "pi pi-pencil",
          shortcut: "⌘+U",
          template: itemRenderer,
        },
        {
          separator: true,
        },
        {
          label: "Templates",
          icon: "pi pi-palette",
          items: [
            {
              label: "Apollo",
              icon: "pi pi-palette",
              badge: 2,
              template: itemRenderer,
            },
            {
              label: "Ultima",
              icon: "pi pi-palette",
              badge: 3,
              template: itemRenderer,
            },
          ],
        },
      ],
    },
    {
      label: "Personal",
      items: [
        {
          label: "Equipos",
          icon: "pi pi-users",
          badge: 3,
          template: itemRenderer,
          command: () => {
            navigate("/teams");
          },
        },
        {
          label: "Trabajadores",
          icon: "pi pi-envelope",
          badge: 7,
          template: itemRenderer,
          command: () => {
            navigate("/workers");
          },
        },
      ],
    },
  ];

  const menuItems = [
    {
      label: `Mi Perfil [${user?.first_name}]`,
      icon: "pi pi-file-edit",
    },
    {
      separator: true,
    },
    {
      label: "Configuración",
      icon: "pi pi-cog",
    },
    {
      separator: true,
    },
    {
      label: "Compartir",
      icon: "pi pi-share-alt",
    },
    {
      separator: true,
    },
    {
      label: "Cerrar Sesión",
      icon: "pi pi-sign-out",
      command: () => logout(),
    },
  ];

  const start = (
    <>
      <Avatar
        onClick={(e) => menu.current.toggle(e)}
        image={"https://i.pravatar.cc/150?u=a04258a2462d826712d"}
        className="mr-3"
        style={{
          width: 50,
          height: 50,
          border: "3px solid var(--gray-500)",
          borderRadius: 50,
          overflow: "hidden",
          cursor: 'pointer',
        }}
      />
      <TieredMenu model={menuItems} popup ref={menu} breakpoint="767px" />
    </>
  );

  const end = (
    <div className="flex align-items-center gap-2">
      <InputText
        placeholder="Buscar"
        type="text"
        className="w-16rem"
      />
      <Button
        icon={dark ? 'pi pi-sun' : 'pi pi-moon'}
        size="large"
        rounded
        text
        onClick={toggle}
      />
      <i className="pi pi-bell p-overlay-badge" style={{ fontSize: "1.7rem", color: "var(--gray-600)" }}>
        <Badge value="2" severity="danger" />
      </i>
    </div>
  );

  return (
    <div className="surface-0 surface-border shadow-1">
      <div className="w-full px-4">
        <Menubar
          model={items}
          start={start}
          end={end}
          style={{ background: "transparent", border: "none", borderRadius: 0 }}
        />
      </div>
    </div>
  );
}
