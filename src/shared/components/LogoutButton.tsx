import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { authService } from "@/features/auth/services/authService";
import { Button } from "@/components/ui/button";
import { LogOut, Loader2 } from "lucide-react";

export const LogoutButton = ({ variant = "ghost", className = "" }) => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    setLoading(true);
    try {
      await authService.logout();
      // Redirigimos al login principal después de cerrar sesión
      navigate("/login");
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      variant={variant}
      className={className}
      onClick={handleLogout}
      disabled={loading}
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <>
          <LogOut className="mr-2 h-4 w-4" />
          Cerrar Sesión
        </>
      )}
    </Button>
  );
};