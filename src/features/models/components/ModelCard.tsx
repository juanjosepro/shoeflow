import type { Model } from "../types/model";
import { Button } from "primereact/button";

interface Props {
  model: Model;
  onEdit: (model: Model) => void;
  onToggle: (model: Model) => void;
}

export const ModelCard = ({ model, onEdit, onToggle }: Props) => {
  return (
    <div
      className="border-round-xl mb-3 pt-3 pb-5 px-3"
      style={{
        background: "var(--sf-paper-2)",
        boxShadow: "var(--sf-shadow-3)",
      }}
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 70px",
          alignItems: "start",
        }}
      >
        <div className="flex flex-column">
          <span
            className="font-bold text-lg mb-1 mono"
            style={{ color: "var(--sf-ink)" }}
          >
            {model.name}
          </span>
          <span
            className="text-sm font-light"
            style={{ color: "var(--sf-ink-2)", fontSize: "small" }}
          >
            ({model?.category?.name})
          </span>
        </div>
        <div className="flex">
          <Button
            icon="pi pi-file-edit"
            text
            style={{ color: "var(--sf-ink-2)", padding: "1px" }}
            onClick={() => onEdit(model)}
          />
          <Button
            icon="pi pi-sync"
            text
            style={{ color: "var(--sf-ink-2)", padding: "1px" }}
            onClick={() => onToggle(model)}
          />
        </div>
      </div>

      <hr style={{ borderColor: "#6b7280", margin: "8px 0" }} />
      <div className="flex justify-content-between align-items-center mb-2">
        <span className="text-sm" style={{ color: "var(--sf-ink-2)" }}>
          Prefijo
        </span>
        <span className="mono" style={{ color: "var(--sf-ink-2)" }}>
          {model.code_prefix}
        </span>
      </div>
      <div className="flex justify-content-between align-items-center mb-2">
        <span className="text-sm" style={{ color: "var(--sf-ink-2)" }}>
          Creado
        </span>
        <span className="mono text-sm" style={{ color: "var(--sf-ink-2)" }}>
          {new Date(model.created_at).toLocaleDateString("es-PE", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
          })}
        </span>
      </div>

      <hr style={{ borderColor: "#6b7280", margin: "8px 0" }} />

      <div className="flex justify-content-start pt-2">
        <span
          className="text-xs font-bold uppercase"
          style={{ color: model.is_active ? "#16a34a" : "#64748b" }}
        >
          {model.is_active ? "Activo" : "Inactivo"}
        </span>
      </div>
    </div>
  );
};
