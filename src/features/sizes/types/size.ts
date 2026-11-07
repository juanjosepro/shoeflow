import type { CatalogFormData } from "@/shared/catalog/types/catalog";

export interface SizeItem {
  id: number;
  name: string;
  description: string | null; // ej. "38-42"
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export type SizeFormData = CatalogFormData;