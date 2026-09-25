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
  worker_id?: number | null;
  worker?: { id: number; name: string } | null;
}

export interface DozenFormData {
  id?: number;
  model_id: number | null;
  variant_id: number | null;
  worker_id: number | null;
  code?: string | null;
  quantity: number;
  material: string;
  color: string;
  status?: string;
  description?: string;
  is_active?: boolean;
  created_at?: Date;
  model_variant_id?: number | null;
}