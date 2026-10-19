import type { Category } from "@/shared/types";

export interface ModelSizeRate {
  specialty: number;
  size: number;
  price: string | number | null; // el backend lo devuelve como "15.00"
}
export interface SpecialtyOption { id: number; name: string; }
export interface SizeOption { id: number; name: string; description?: string | null; }

export interface Model {
  id: number;
  name: string;
  code_prefix: string;
  description: string;
  category: Category;
  is_active: boolean;
  // dentro de Model:
  size_rates?: ModelSizeRate[];
  created_at: string | number | Date;
}

export interface ModelFormData {
  name: string;
  code_prefix: string;
  description?: string;
  category_id: number;
}

export interface ModelPayload {
  name: string;
  code_prefix: string;
  description?: string;
  category: Category;
}
