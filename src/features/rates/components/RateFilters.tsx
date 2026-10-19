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
}

const RateFilters = ({
  options,
  queryParams,
  onFilterChange,
  clearFilters,
  hasActiveFilters,
}: Props) => {
  // Un solo molde para los cinco filtros: solo cambian el campo, las opciones y el texto
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

  return (
    <div className="sf-table-header">
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
            style={{ width: "10rem" }}
          />
        ))}

        {hasActiveFilters && (
          <Button
            label="Limpiar"
            icon="pi pi-filter-slash"
            outlined
            severity="secondary"
            onClick={clearFilters}
          />
        )}
      </div>
    </div>
  );
};

export default RateFilters;
