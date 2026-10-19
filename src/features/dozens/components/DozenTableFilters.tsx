import type { Model } from "@/features/models/types/model";
import useMediaQuery from "@/shared/hooks/useMediaQuery";

import { Button } from "primereact/button";
import { Dropdown } from "primereact/dropdown";
import { InputText } from "primereact/inputtext";

import type {
  CatalogOptions,
  ColorOption,
  DozenMetadata,
  DozenQueryParams,
} from "../types/dozen";

type FilterField =
  | "model"
  | "size"
  | "status"
  | "material_type"
  | "color"
  | "plant_type"
  | "priority";

interface Props {
  models: Model[];
  metadata: DozenMetadata | null; // estados y prioridades
  options: CatalogOptions; // materiales, colores, plantas y tallas
  queryParams: DozenQueryParams;

  onSearchChange: (value: string) => void;

  onFilterChange: <K extends FilterField>(
    field: K,
    value: DozenQueryParams[K],
  ) => void;

  clearFilters: () => void;
  hasActiveFilters: boolean;
}

// Color con su muestra, tanto en la lista desplegable como en el valor elegido
const colorTemplate = (color: ColorOption | null, placeholder?: string) =>
  color ? (
    <div className="flex align-items-center gap-2">
      <span
        className="border-circle"
        style={{
          width: "0.75rem",
          height: "0.75rem",
          background: color.hex_code,
          border: "1px solid var(--sf-ink-2)",
        }}
      />
      <span>{color.name}</span>
    </div>
  ) : (
    <span>{placeholder}</span>
  );

const DozenTableFilters = ({
  models,
  metadata,
  options,
  queryParams,
  onSearchChange,
  onFilterChange,
  clearFilters,
  hasActiveFilters,
}: Props) => {
  const isLaptopUp = useMediaQuery("(min-width: 1024px)");

  return (
    <div className="sf-table-header">
      <div className="flex align-items-center gap-2 flex-wrap">
        {/* SEARCH */}
        <span className="p-input-icon-left block">
          <i className="pi pi-search pl-2" />

          <InputText
            value={queryParams.search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="ej. AIR-0012"
            className="sf-search-input pl-5 w-full"
          />
        </span>

        {/* MODEL */}
        <Dropdown
          value={queryParams.model}
          options={models}
          optionLabel="name"
          optionValue="id"
          onChange={(e) => onFilterChange("model", e.value)}
          placeholder="Modelo"
          showClear
          className="sf-filter"
        />

        {/* SIZE */}
        <Dropdown
          value={queryParams.size}
          options={options.sizes}
          optionLabel="name"
          optionValue="id"
          onChange={(e) => onFilterChange("size", e.value)}
          placeholder="Talla"
          showClear
          className="sf-filter"
        />

        {/* MATERIAL */}
        <Dropdown
          value={queryParams.material_type}
          options={options.materialTypes}
          optionLabel="name"
          optionValue="id"
          onChange={(e) => onFilterChange("material_type", e.value)}
          placeholder="Material"
          showClear
          className="sf-filter"
        />

        {/* COLOR */}
        <Dropdown
          value={queryParams.color}
          options={options.colors}
          optionLabel="name"
          optionValue="id"
          onChange={(e) => onFilterChange("color", e.value)}
          placeholder="Color"
          itemTemplate={(color: ColorOption) => colorTemplate(color)}
          valueTemplate={(color: ColorOption | null, props) =>
            colorTemplate(color, props.placeholder)
          }
          showClear
          className="sf-filter"
        />

        {/* TYPE OF PLANT */}
        <Dropdown
          value={queryParams.plant_type}
          options={options.plantTypes}
          optionLabel="name"
          optionValue="id"
          onChange={(e) => onFilterChange("plant_type", e.value)}
          placeholder="Planta"
          showClear
          className="sf-filter"
        />

        {/* PRIORITY */}
        <Dropdown
          value={queryParams.priority}
          options={metadata?.priorities ?? []}
          optionLabel="label"
          optionValue="key"
          onChange={(e) => onFilterChange("priority", e.value)}
          placeholder="Prioridad"
          showClear
          className="sf-filter"
        />

        {/* STATUS */}
        <Dropdown
          value={queryParams.status}
          options={metadata?.statuses ?? []}
          optionLabel="label"
          optionValue="key"
          onChange={(e) => onFilterChange("status", e.value)}
          placeholder="Estado"
          showClear
          className="sf-filter"
        />

        {/* CLEAR */}
        {hasActiveFilters && (
          <Button
            type="button"
            icon="pi pi-filter-slash"
            className="sf-btn p-button-sm"
            style={{
              background: "var(--sf-moss)",
              borderColor: "var(--sf-moss)",
              color: "var(--sf-clay-light)",
            }}
            label={isLaptopUp ? "Limpiar" : undefined}
            text
            onClick={clearFilters}
          />
        )}
      </div>
    </div>
  );
};

export default DozenTableFilters;
