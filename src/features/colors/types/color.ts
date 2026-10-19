export interface Color {
  id: number;
  name: string;
  hex_code: string; // "#RRGGBB"
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ColorFormData {
  name: string;
  hex_code: string;
  is_active: boolean;
}