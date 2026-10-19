export interface Specialty {
  id: number;
  name: string;
  description: string;
  is_active: boolean;
  created_at: string;
}

export interface Worker {
  id: number;
  specialties: Specialty[];
  rate_extras: { id: number; specialty: number; specialty_name: string; extra_price: string }[];
  names: string;
  dni: string;
  phone: string;
  address: string;
  email: string;
  password: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface WorkerFormData {
  specialties_ids: number[];
  specialty_extras?: { specialty: number; extra_price: number }[];
  names: string;
  dni: string;
  phone?: string;
  address?: string;
  email?: string;
  password?: string;
  is_active: boolean;
}

export interface WorkerPayload {
  specialties_ids: number[];
  names: string;
  dni: string;
  phone?: string;
  address?: string;
  email?: string;
  password?: string;
  is_active: boolean;
}

export interface WorkerQueryParams {
  search?: string;
  is_active?: boolean;
}
