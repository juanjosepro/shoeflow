export interface Team {
  id: number;
  name: string;
  description: string;
  created_at: string;
}

export interface Worker {
  id: number;
  team: Team;
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
  team_id: number;
  names: string;
  dni: string;
  phone?: string;
  address?: string;
  email?: string;
  password?: string;
  is_active: boolean;
}

export interface WorkerPayload {
  team_id?: number;
  names: string;
  dni: string;
  phone?: string;
  address?: string;
  email?: string;
  password?: string;
  is_active: boolean;
}
