import type { CatalogFormData } from "@/shared/catalog/types/catalog";

export interface PlantType {
  id: number;
  name: string;
  description: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export type PlantTypeFormData = CatalogFormData;