import { useEffect, useState } from "react";
import api from "@/shared/lib/axios";
import type { Size } from "@/shared/types";
import type { CatalogOptions, ColorOption, NamedOption, StageOption } from "@/features/dozens/types/dozen";

const EMPTY_OPTIONS: CatalogOptions = {
  materialTypes: [],
  colors: [],
  plantTypes: [],
  sizes: [],
  specialties: []
};

// Solo opciones activas y sin paginar: alimentan los selectores de docenas y filtros
const QUERY = "?is_active=true&no_pagination=true";

export const useCatalogOptions = () => {
  const [options, setOptions] = useState<CatalogOptions>(EMPTY_OPTIONS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [materials, colors, plants, sizes, specialties] = await Promise.all([
          api.get<NamedOption[]>(`catalog/material-types/${QUERY}`),
          api.get<ColorOption[]>(`catalog/colors/${QUERY}`),
          api.get<NamedOption[]>(`catalog/plant-types/${QUERY}`),
          api.get<Size[]>("catalog/sizes/?no_pagination=true"),
          api.get<StageOption[]>("staff/specialties/?is_active=true&no_pagination=true")
        ]);
        setOptions({
          materialTypes: materials.data,
          colors: colors.data,
          plantTypes: plants.data,
          sizes: sizes.data,
          specialties: specialties.data
        });
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return { options, loading };
};