import type { CatalogFormData } from "@/shared/catalog/types/catalog";

export interface Category {
  id: number;
  name: string;
  description: string | null;
}

export type CategoryFormData = CatalogFormData;