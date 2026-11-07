// Este Feature(Catalog) se usa en Categories, Sizes, MaterialTypes y PlantTypes ya que todos tienen los mismos campos
export interface CatalogItem {
  id: number;
  name: string;
  description: string | null;
  is_active?: boolean;
}

export interface CatalogFormData {
  name: string;
  description: string;
  is_active?: boolean;
}

// Las cinco operaciones de cualquier tabla del catálogo
export interface CatalogService<T, F> {
  getAll: () => Promise<T[]>;
  create: (data: F) => Promise<T>;
  update: (id: number, data: F) => Promise<T>;
  patch: (id: number, data: Partial<F>) => Promise<T>;
  delete: (id: number) => Promise<unknown>;
}