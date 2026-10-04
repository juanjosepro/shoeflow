import type { DozenQueryParams } from "../types/dozen";

type FilterField = "model" | "status" | "material" | "color";

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
      status: null,
      material: null,
      color: null,
      page: 1,
    }));
  };

  const hasActiveFilters = Boolean(
    queryParams.search ||
      queryParams.model ||
      queryParams.status ||
      queryParams.material ||
      queryParams.color,
  );

  return {
    onSearchChange,
    onFilterChange,
    clearFilters,
    hasActiveFilters,
  };
};