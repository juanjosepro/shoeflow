// Una especialidad es una etapa del proceso (cortado, aparado, armado...)
export interface Specialty {
  id: number;
  name: string;
  description: string | null;
  order: number; // posición en el proceso: la menor va primero
  is_active: boolean; // false = la fábrica ya no usa esta etapa
  created_at: string;
}

export interface SpecialtyFormData {
  name: string;
  description: string;
  order: number;
  is_active: boolean;
}