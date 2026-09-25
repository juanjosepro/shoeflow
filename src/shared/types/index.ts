export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface Size {
  id: number;
  name: string;
  description: string;
}

export interface Variant {
  id: number;
  size: Size;
  standard_price: string;
}

export interface Category {
  id: number;
  name: string;
  description: string | null;
}