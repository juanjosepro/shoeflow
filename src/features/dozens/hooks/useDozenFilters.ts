import type { DozenQueryParams } from "../types/dozen";

type FilterField =
  | "model"
  | "size"
  | "status"
  | "material_type"
  | "color"
  | "plant_type"
  | "priority";

interface UseDozenFiltersProps {
  queryParams: DozenQueryParams;
  setQueryParams: React.Dispatch<
    React.SetStateAction<DozenQueryParams>
  >;
}

export const useDozenFilters = ({
  queryParams,
  setQueryParams,
}: UseDozenFiltersProps) => {
  const onSearchChange = (value: string) => {
    setQueryParams((prev) => ({
      ...prev,
      search: value,
      page: 1,
    }));
  };

  const onFilterChange = <K extends FilterField>(
    field: K,
    value: DozenQueryParams[K],
  ) => {
    setQueryParams((prev) => ({
      ...prev,
      [field]: value,
      page: 1,
    }));
  };

  const clearFilters = () => {
    setQueryParams((prev) => ({
      ...prev,
      search: "",
      model: null,
      size: null,
      status: null,
      material_type: null,
      color: null,
      plant_type: null,
      priority: null,
      page: 1,
    }));
  };

  const hasActiveFilters = Boolean(
    queryParams.search ||
    queryParams.model ||
    queryParams.size ||
    queryParams.status ||
    queryParams.material_type ||
    queryParams.color ||
    queryParams.plant_type ||
    queryParams.priority,
  );

  return {
    onSearchChange,
    onFilterChange,
    clearFilters,
    hasActiveFilters,
  };
};