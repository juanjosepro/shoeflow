import api from "@/shared/lib/axios";

// OJO: ajusta "staff/workers" al prefijo que usas en el urls.py raíz para la app staff
const WORKERS = "staff/workers";

export const pinService = {
  // Guarda (o cambia) el PIN de 4 dígitos con el que el trabajador entra al portal
  setPin: (workerId: number, pin: string) =>
    api.post<{ has_pin: boolean }>(`${WORKERS}/${workerId}/set-pin/`, { pin }).then((r) => r.data),
};
