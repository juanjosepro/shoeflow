import { useState } from "react";

import { Button } from "primereact/button";
import { Dropdown } from "primereact/dropdown";

import type { RateOptions, RateQueryParams } from "../types/rate";

type FilterField = keyof RateQueryParams;

interface Props {
  options: RateOptions;
  queryParams: RateQueryParams;
  onFilterChange: (field: FilterField, value: number | null) => void;
  clearFilters: () => void;
  hasActiveFilters: boolean;
  openCreate: () => void;
}

const RateFilters = ({
  options,
  queryParams,
  onFilterChange,
  clearFilters,
  hasActiveFilters,
  openCreate
}: Props) => {
  // Un solo molde para los cinco filtros.
  const filters: {
    field: FilterField;
    placeholder: string;
    items: { id: number; name: string }[];
  }[] = [
    { field: "specialty", placeholder: "Etapa", items: options.specialties },
    { field: "model", placeholder: "Modelo", items: options.models },
    { field: "size", placeholder: "Talla", items: options.sizes },
    {
      field: "material_type",
      placeholder: "Material",
      items: options.materialTypes,
    },
    { field: "plant_type", placeholder: "Planta", items: options.plantTypes },
  ];

  // Cuenta los filtros activos.
  const activeFilterCount = filters.filter(
    ({ field }) => queryParams[field] !== null && queryParams[field] !== undefined,
  ).length;

  // Abre automáticamente si hay filtros activos al montar.
  const [showFilters, setShowFilters] = useState(activeFilterCount > 0);

  return (
    <div className="flex flex-column gap-3 w-full">

      {/* TOOLBAR */}
      <div className="flex align-items-center justify-content-between flex-wrap gap-2">
        <div className="flex align-items-center gap-2 flex-wrap">
          <Button
            icon="pi pi-question"
            rounded
            aria-label="Bookmark"
            size="small"
            className="p-0"
            style={{
              width: "24px",
              height: "24px",
              background: "var(--sf-moss-light)",
              borderColor: "var(--sf-moss-light)",
              color: "var(--sf-moss)",
            }}
            tooltip="Para cada docena se usa la tarifa más específica que le corresponda (la que cumple más condiciones). Si hay empate, pesa más material, luego planta, luego talla y luego modelo. Si ninguna aplica, la docena no se puede asignar."
          />

          {/* TOGGLE FILTERS */}
          <Button
            type="button"
            icon="pi pi-filter"
            label={
              activeFilterCount > 0
                ? `Filtros (${activeFilterCount})`
                : "Filtros"
            }
            outlined
            className="p-button-sm sf-btn--ink sf-btn--soft"
            onClick={() => setShowFilters((prev) => !prev)}
          />

          {/* CLEAR */}
          {hasActiveFilters && (
            <Button
              type="button"
              label="Limpiar"
              icon="pi pi-filter-slash"
              className="p-button-sm sf-btn--amber sf-btn--soft"
              onClick={clearFilters}
            />
          )}
        </div>

        <Button
          label="Nuevo"
          icon="pi pi-plus"
          severity="success"
          onClick={openCreate}
        />
      </div>

      {/* FILTER PANEL */}
      {showFilters && (
        <div className="sf-filters-panel">
          <div className="flex align-items-center gap-2 flex-wrap">
            {filters.map(({ field, placeholder, items }) => (
              <Dropdown
                key={field}
                value={queryParams[field]}
                options={items}
                optionLabel="name"
                optionValue="id"
                onChange={(e) => onFilterChange(field, e.value ?? null)}
                placeholder={placeholder}
                showClear
                filter
                className="sf-filter"
                style={{ width: "10rem" }}
              />
            ))}
          </div>

        </div>
      )}
    </div>
  );
};

export default RateFilters;