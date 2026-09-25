import type { Category, Variant } from "@/shared/types";

export interface Model {
  id: number;
  name: string;
  code_prefix: string;
  description: string;
  category: Category;
  variants: Variant[];
  is_active: boolean;
}

export interface ModelFormData {
  name: string;
  code_prefix: string;
  description?: string;
  category_id: number;
  brand_variants: Record<string, number>;
}

export interface ModelPayload {
  name: string;
  code_prefix: string;
  description?: string;
  category: Category;
  variants: Variant[];
}
