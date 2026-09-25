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
      className="border-round-xl mb-3 pt-4 pb-6 px-4"
      style={{
        background: "#1a1a2e",
        boxShadow: "0px 10px 15px -3px rgba(0,0,0,0.1)",
        color: "#d1d5db",
      }}
    >
      <div className="flex justify-content-between align-items-center">
        <div className="flex flex-column">
          <span className="font-bold text-lg">{model.name}</span>
          <em className="text-sm font-light" style={{ color: "#9ca3af" }}>
            ({model?.category?.name})
          </em>
        </div>
        <div className="flex">
          <Button
            icon="pi pi-file-edit"
            text
            style={{ color: "#d1d5db", height: "48px" }}
            size="large"
            onClick={() => onEdit(model)}
          />
          <Button
            icon="pi pi-sync"
            text
            style={{ color: "#d1d5db", height: "48px" }}
            size="large"
            onClick={() => onToggle(model)}
          />
        </div>
      </div>

      <hr style={{ borderColor: "#6b7280", margin: "8px 0" }} />

      <div className="flex justify-content-between align-items-center mb-2">
        <span className="font-bold text-lg">Serie</span>
        <span className="font-bold text-lg">Precio</span>
      </div>

      {model.variants.map((variant) => (
        <div
          className="flex justify-content-between align-items-center"
          key={variant.id}
        >
          <span className="text-sm uppercase">{variant?.size?.name}</span>
          <span>S/ {variant?.standard_price}</span>
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
