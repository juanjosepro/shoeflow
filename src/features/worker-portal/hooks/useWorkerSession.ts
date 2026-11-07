import { useCallback, useState } from "react";
import { sessionStore } from "../services/portalApi";
import { portalService } from "../services/portalService";
import type { PortalSession } from "../types/portal";

export const useWorkerSession = () => {
  const [session, setSession] = useState<PortalSession | null>(() => sessionStore.get());

  const login = useCallback(async (dni: string, pin?: string) => {
    const data = await portalService.login(dni, pin);
    const next: PortalSession = {
      token: data.token,
      worker: data.worker,
      expires_at: Date.now() + data.expires_in * 1000,
    };
    sessionStore.set(next);
    setSession(next);
  }, []);

  const logout = useCallback(() => {
    sessionStore.clear();
    setSession(null);
  }, []);

  return { session, login, logout };
};
