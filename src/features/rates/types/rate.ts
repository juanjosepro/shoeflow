import type { ModelBasic, NamedOption } from "@/features/dozens/types/dozen";
import type { CatalogItem } from "@/shared/catalog/types/catalog";

// Una regla de tarifa: cuánto se paga por DOCENA COMPLETA en una etapa.
// Las condiciones (modelo, talla, material, planta) son opcionales: null = "cualquiera".
export interface Rate {
  id: number;
  specialty: number;
  specialty_name: string;
  model: number | null;
  model_name: string | null;
  size: number | null;
  size_name: string | null;
  material_type: number | null;
  material_type_name: string | null;
  plant_type: number | null;
  plant_type_name: string | null;
  price: string; // ej. "13.00"
  specificity: number; // cuántas condiciones define (0 a 4)
  is_base: boolean; // sin condiciones: el precio de respaldo de la etapa (no se elimina)
  created_at: string;
  updated_at: string;
}

// Lo que se envía al crear o editar
export interface RateFormData {
  specialty: number;
  model: number | null;
  size: number | null;
  material_type: number | null;
  plant_type: number | null;
  price: number;
}

// Filtros del listado (null = sin filtrar)
export interface RateQueryParams {
  specialty: number | null;
  model: number | null;
  size: number | null;
  material_type: number | null;
  plant_type: number | null;
}

// Opciones de los selectores (formulario y filtros)
export interface RateOptions {
  specialties: NamedOption[];
  models: ModelBasic[];
  sizes: CatalogItem[];
  materialTypes: NamedOption[];
  plantTypes: NamedOption[];
}

// Revisión de cobertura: qué combinaciones etapa + modelo + talla no tienen precio
// export interface RateCoverageGroup {
//   specialty: number;
//   specialty_name: string;
//   model: number;
//   model_name: string;
//   // missing = ninguna tarifa aplica. partial = solo hay para ciertos materiales o plantas.
//   status: "missing" | "partial";
//   sizes: { id: number; name: string }[];
//   all_sizes: boolean; // true = faltan todas las tallas activas
// }

// export interface RateCoverage {
//   counts: { covered: number; partial: number; missing: number };
//   total: number;
//   groups: RateCoverageGroup[];
// }
// Etapa activa que aún no tiene tarifa base
export interface MissingBaseSpecialty {
  id: number;
  name: string;
}