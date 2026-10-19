import type { CatalogFormData } from "@/shared/catalog/types/catalog";

export interface SizeItem {
  id: number;
  name: string;
  description: string | null; // ej. "38-42"
}

export type SizeFormData = CatalogFormData;