import axios from "axios";
import api from "@/shared/lib/axios";
import type { PortalSession } from "../types/portal";

const SESSION_KEY = "sf_worker_session";

// Sesión del trabajador. Es independiente de la del administrador.
// Todo va en try/catch: el almacenamiento puede estar bloqueado (modo privado).
export const sessionStore = {
  get(): PortalSession | null {
    try {
      const raw = localStorage.getItem(SESSION_KEY);
      if (!raw) return null;
      const session = JSON.parse(raw) as PortalSession;
      if (!session.token || session.expires_at <= Date.now()) {
        localStorage.removeItem(SESSION_KEY);
        return null;
      }
      return session;
    } catch {
      return null;
    }
  },
  set(session: PortalSession) {
    try {
      localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    } catch {
      /* sin almacenamiento: la sesión vive solo en memoria */
    }
  },
  clear() {
    try {
      localStorage.removeItem(SESSION_KEY);
    } catch {
      /* nada que limpiar */
    }
  },
};

// Instancia aparte de la del administrador: así nunca se mezclan los tokens.
// Usa la misma URL base, por lo que sigue resolviendo la misma empresa.
export const portalApi = axios.create({ baseURL: api.defaults.baseURL });

portalApi.interceptors.request.use((config) => {
  const session = sessionStore.get();
  if (session) config.headers.Authorization = `Worker ${session.token}`;
  return config;
});
