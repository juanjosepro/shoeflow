import type { Model } from "@/features/models/types/model";
import useMediaQuery from "@/shared/hooks/useMediaQuery";

import { Button } from "primereact/button";
import { Dropdown } from "primereact/dropdown";
import { InputText } from "primereact/inputtext";

import type { DozenMetadata, DozenQueryParams } from "../types/dozen";

type FilterField = "model" | "status" | "material" | "color";

interface Props {
  models: Model[];
  metadata: DozenMetadata | null;
  queryParams: DozenQueryParams;

  onSearchChange: (value: string) => void;

  onFilterChange: <K extends FilterField>(
    field: K,
    value: DozenQueryParams[K],
  ) => void;

  clearFilters: () => void;
  hasActiveFilters: boolean;
}

const DozenTableFilters = ({
  models,
  metadata,
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

        {/* MATERIAL */}
        <Dropdown
          value={queryParams.material}
          options={metadata?.materials ?? []}
          optionLabel="label"
          optionValue="key"
          onChange={(e) => onFilterChange("material", e.value)}
          placeholder="Material"
          showClear
          className="sf-filter"
        />

        {/* COLOR */}
        <Dropdown
          value={queryParams.color}
          options={metadata?.colors ?? []}
          optionLabel="label"
          optionValue="key"
          onChange={(e) => onFilterChange("color", e.value)}
          placeholder="Color"
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
