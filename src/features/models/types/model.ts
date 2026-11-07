import type { CatalogItem } from "@/shared/catalog/types/catalog";

export interface ModelSizeRate {
  specialty: number;
  size: number;
  price: string | number | null; // el backend lo devuelve como "15.00"
}

export interface Model {
  id: number;
  name: string;
  code_prefix: string;
  description: string;
  category: CatalogItem;
  is_active: boolean;
  size_rates?: ModelSizeRate[];
  created_at: string | number | Date;
}

export interface ModelFormData {
  name: string;
  code_prefix: string;
  description?: string;
  category_id: number | null;
}
