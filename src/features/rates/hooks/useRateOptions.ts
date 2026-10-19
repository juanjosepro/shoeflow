import { useEffect, useState } from "react";
import api from "@/shared/lib/axios";
import type { ModelBasic, NamedOption } from "@/features/dozens/types/dozen";
import { useCatalogOptions } from "@/shared/hooks/useCatalogOptions";
import type { RateOptions } from "../types/rate";

// Opciones para el formulario y los filtros de tarifas.
// Materiales, plantas y tallas ya los trae useCatalogOptions; aquí se suman etapas y modelos.
export const useRateOptions = () => {
  const { options: catalog, loading: loadingCatalog } = useCatalogOptions();
  const [specialties, setSpecialties] = useState<NamedOption[]>([]);
  const [models, setModels] = useState<ModelBasic[]>([]);
  const [loadingExtra, setLoadingExtra] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [specs, mods] = await Promise.all([
          api.get<NamedOption[]>("staff/specialties/?is_active=true&no_pagination=true"),
          api.get<ModelBasic[]>("catalog/models/?no_pagination=true"),
        ]);
        setSpecialties(specs.data);
        setModels(mods.data);
      } finally {
        setLoadingExtra(false);
      }
    };
    load();
  }, []);

  const options: RateOptions = {
    specialties,
    models,
    sizes: catalog.sizes,
    materialTypes: catalog.materialTypes,
    plantTypes: catalog.plantTypes,
  };

  return { options, loading: loadingCatalog || loadingExtra };
};