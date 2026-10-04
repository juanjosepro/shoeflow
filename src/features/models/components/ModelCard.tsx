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
        background: "var(--paper-2)",
        boxShadow: "var(--shadow-3)",
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
            style={{ color: "var(--ink)" }}
          >
            {model.name}
          </span>
          <span
            className="text-sm font-light"
            style={{ color: "var(--ink-2)", fontSize: "small" }}
          >
            ({model?.category?.name})
          </span>
        </div>
        <div className="flex">
          <Button
            icon="pi pi-file-edit"
            text
            style={{ color: "var(--ink-2)", padding: "1px" }}
            onClick={() => onEdit(model)}
          />
          <Button
            icon="pi pi-sync"
            text
            style={{ color: "var(--ink-2)", padding: "1px" }}
            onClick={() => onToggle(model)}
          />
        </div>
      </div>

      <hr style={{ borderColor: "#6b7280", margin: "8px 0" }} />

      <div className="flex justify-content-between align-items-center mb-2">
        <span
          className="font-semibold text-md"
          style={{ color: "var(--ink-2)" }}
        >
          Serie
        </span>
        <span
          className="font-semibold text-md"
          style={{ color: "var(--ink-2)" }}
        >
          Precio
        </span>
      </div>

      {model.variants.map((variant) => (
        <div
          className="flex justify-content-between align-items-center mb-2"
          key={variant.id}
        >
          <span className="text-sm" style={{ color: "var(--ink-2)" }}>
            {variant?.size?.name}
          </span>
          <span style={{ color: "var(--ink-2)" }}>
            S/ {variant?.standard_price}
          </span>
        </div>
      ))}

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
