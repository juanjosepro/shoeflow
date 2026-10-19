import { Button } from "primereact/button";
import type { Color } from "../types/color";
import { readableOn } from "../utils/colorUtils";
import "./ColorCard.scss";

interface Props {
  color: Color;
  onEdit: (color: Color) => void;
  onToggle: (color: Color) => void;
  onDelete: (color: Color) => void;
}

// Tarjeta de un color: muestra grande, código hexadecimal, nombre y estado
export const ColorCard = ({ color, onEdit, onToggle, onDelete }: Props) => (
  <div
    className={`sf-color-card ${color.is_active ? "" : "sf-color-card--inactive"}`}
  >
    <div
      className="sf-color-card__swatch"
      style={{ background: color.hex_code }}
    >
      <span
        className="sf-color-card__hex"
        style={{ color: readableOn(color.hex_code) }}
      >
        {color.hex_code.toUpperCase()}
      </span>
    </div>

    <div className="flex align-items-center justify-content-between gap-2 p-3">
      <strong
        className="white-space-nowrap overflow-hidden text-overflow-ellipsis"
        title={color.name}
        style={{ color: "#000" }}
      >
        {color.name}
      </strong>
      <span className={`sf-tag ${color.is_active ? "moss" : "clay"}`}>
        {color.is_active ? "Activo" : "Inactivo"}
      </span>
    </div>

    <div className="sf-color-card__actions">
      <Button
        icon="pi pi-pencil"
        rounded
        text
        size="small"
        severity="warning"
        tooltip="Editar"
        onClick={() => onEdit(color)}
      />
      <Button
        icon={color.is_active ? "pi pi-eye-slash" : "pi pi-eye"}
        rounded
        text
        size="small"
        severity="secondary"
        tooltip={color.is_active ? "Desactivar" : "Activar"}
        onClick={() => onToggle(color)}
      />
      <Button
        icon="pi pi-trash"
        rounded
        text
        size="small"
        severity="danger"
        tooltip="Eliminar"
        onClick={() => onDelete(color)}
      />
    </div>
  </div>
);
