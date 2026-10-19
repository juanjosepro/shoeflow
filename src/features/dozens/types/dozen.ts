import type { Size } from "@/shared/types";

// --- Piezas que vienen anidadas dentro de una docena ------------------------

export interface NamedOption {
  id: number;
  name: string;
}

export interface ColorOption extends NamedOption {
  hex_code: string; // "#FFFFFF"
}

export interface ModelBasic {
  id: number;
  name: string;
  code_prefix: string;
}

// Una etapa ya asignada (se crea con el diálogo de asignación masiva)
export interface DozenAssignment {
  id: number;
  dozen: number;
  dozen_code: string;
  specialty: { id: number; name: string; order: number };
  worker: { id: number; names: string; is_active: boolean };
  status: string;
  delivered_at: string;
  completed_at: string;
  unit_price: string; // precio por docena completa, ej. "13.00"
  amount: string; // lo que se paga por esta docena: unit_price x pares / 12
  week_identifier: string;
  week_label: string;
  settlement: number | null; // null = pendiente de pago
  description: string | null;
  created_at: string;
}

export interface Dozen {
  id: number;
  code: string;
  created_at: string;
  model: ModelBasic;
  size: Size;
  material_type: NamedOption;
  color: ColorOption;
  plant_type: NamedOption;
  pairs: number; // 1 a 12
  fraction: string; // pares / 12, ej. "0.5000"
  priority: string;
  status: string;
  description: string | null;
  is_active: boolean;
  registered_at: string;
  registration_group?: string;
  assignments: DozenAssignment[];
  assigned_stages: number;
  total_stages: number;
}

// --- Filtros del listado ----------------------------------------------------

export interface DozenQueryParams {
  search: string;
  model: number | null;
  size: number | null;
  status: string | null;
  material_type: number | null;
  color: number | null;
  plant_type: number | null;
  priority: string | null;
  page: number;
  limit: number;
  exclude_finished?: boolean;
  no_pagination?: boolean;
}

// --- Opciones fijas (estados y prioridades) que siguen viniendo de dozen-metadata/ ---

export interface MetadataItem {
  key: string;
  label: string;
}

export interface DozenMetadata {
  statuses: MetadataItem[];
  priorities: MetadataItem[];
  assignment_statuses: MetadataItem[];
}

export interface StageOption { id: number; name: string; order: number; }


// --- Opciones de catálogo (tablas): materiales, colores, plantas y tallas ---

export interface CatalogOptions {
  materialTypes: NamedOption[];
  colors: ColorOption[];
  plantTypes: NamedOption[];
  sizes: Size[];
  specialties: StageOption[];
}

export interface UseDozensConfig {
  autoLoad?: boolean; // Controla si dispara el listado automáticamente
  exclude_finished?: boolean;
  no_pagination?: boolean;
}

export interface StageWorkerOption {
  id: number; names: string;
  extra_price: string; unit_price: string | null; amount: string | null;
}
export interface StageAssignmentInfo {
  id: number; worker: { id: number; names: string };
  delivered_at: string; completed_at: string;
  unit_price: string; amount: string; is_paid: boolean;
}
export interface StageRow {
  specialty: StageOption;            // {id, name, order}
  base_price: string | null;
  missing_rate: boolean;
  workers: StageWorkerOption[];
  assignment: StageAssignmentInfo | null;
}
export interface AssignStagesPayload {
  assignments: {
    specialty: number; worker: number;
    delivered_at: string; completed_at: string; // "YYYY-MM-DD"
    description?: string;
  }[];
}

export type DozenStatusAction = "complete" | "reject" | "reopen";