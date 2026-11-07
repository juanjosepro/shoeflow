import api from "@/shared/lib/axios";

// Una etapa del proceso = una especialidad activa
export interface Stage {
  id: number;
  name: string;
  order: number;
  is_active: boolean;
  excludes: number[]; // etapas que no se usan junto con esta
}

export const stageService = {
  // Etapas activas en el orden del proceso (las que van en la ficha y en el tablero)
  getActive: () =>
    api
      .get<Stage[]>("staff/specialties/", { params: { no_pagination: true, is_active: true } })
      .then((r) => r.data.filter((s) => s.is_active).sort((a, b) => a.order - b.order)),
};
