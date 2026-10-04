import type { Size } from "@/shared/types";

export interface ModelBasic {
  id: number;
  name: string;
  code_prefix: string;
}

export interface VariantBasic {
  id: number;
  size: Size;
  model: ModelBasic;
}

export interface Dozen {
  id: number;
  code: string;
  created_at: string;
  material: string;
  color: string;
  status: string;
  description: string | null;
  quantity: number;
  is_active: boolean;
  variant: VariantBasic;
  registered_at: string;
  registration_group?: string;
  worker_id?: number | null;
  worker?: { id: number; name: string } | null;
}

export interface DozenQueryParams {
  search: string;
  model: number | null;
  status: string | null;
  material: string | null;
  color: string | null;
  page: number;
  limit: number;
  exclude_finished?: boolean;
  no_pagination?: boolean;
}

// Tipado para la estructura de listas ordenadas de tu Metadata
export interface MetadataItem {
  key: string;
  label: string;
}

export interface DozenMetadata {
  statuses: MetadataItem[];
  materials: MetadataItem[];
  colors: MetadataItem[];
  assignment_statuses: MetadataItem[];
}

export interface UseDozensConfig {
  autoLoad?: boolean; // Controla si dispara el listado automáticamente
  exclude_finished?: boolean;
  no_pagination?: boolean;
}