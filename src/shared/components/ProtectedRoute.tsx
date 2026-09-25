import { Navigate } from "react-router-dom";
import { useAuth } from "@/features/auth/hooks/useAuth";

export const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <i className="pi pi-spin pi-spinner text-primary" style={{ fontSize: '2.5rem' }} />
      </div>
    );
  }

  return user ? children : <Navigate to="/login" />;
};