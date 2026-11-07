import { useWorkerSession } from "../hooks/useWorkerSession";
import WorkerPortalHome from "../components/WorkerPortalHome";
import WorkerPortalLogin from "../components/WorkerPortalLogin";

// Ruta pública del trabajador (ej. /portal). Va FUERA del layout y de las rutas protegidas
// del administrador: tiene su propia sesión.
export const WorkerPortalPage = () => {
  const { session, login, logout } = useWorkerSession();

  if (!session) return <WorkerPortalLogin onLogin={login} />;
  return <WorkerPortalHome session={session} onLogout={logout} />;
};

export default WorkerPortalPage;
