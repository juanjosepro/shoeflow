// Una especialidad es una etapa del proceso (cortado, aparado, armado...)
export interface Specialty {
  id: number;
  name: string;
  description: string | null;
  order: number; // posición en el proceso: la menor va primero
  is_active: boolean; // false = la fábrica ya no usa esta etapa
  excludes: number[]; // etapas que NO se usan junto con esta (ej. Armado completo vs Armador + Pegador)
  created_at: string;
}

export interface SpecialtyFormData {
  name: string;
  description: string;
  order: number;
  is_active: boolean;
  excludes: number[];
  // Solo al crear: precio por docena de la tarifa base que se crea junto con la etapa
  base_price?: number;
}