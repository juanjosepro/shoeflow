import { useAuth } from "../../hooks/useAuth";
import { toast } from "@/shared/lib/toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { InputText } from "primereact/inputtext";
import { Password } from "primereact/password";
import { Button } from "primereact/button";
import { useTheme } from "@/shared/hooks/useTheme"; // ajusta la ruta a donde termine viviendo useTheme.js
import { useTenant } from "@/shared/hooks/useTenant";
import "./LoginPage.scss"; // ajusta la ruta según dónde centralices el theme en tu proyecto

const schema = z.object({
  username: z.string().min(3, "Requerido"),
  password: z.string().min(3, "Requerido"),
});

type FormData = z.infer<typeof schema>;

export default function LoginPage() {
  const { login } = useAuth();
  const { slug, name } = useTenant();
  const [theme, toggleTheme] = useTheme();
  const isDark = theme === "dark";

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      username: "superadmin",
      password: "Supernov@08",
    },
  });

  const onSubmit = async (data: FormData) => {
    try {
      await login(data);
      toast.success("Bienvenido");
    } catch {
      toast.error("Credenciales incorrectas");
    }
  };

  return (
    <div className="login-shell flex">
      <button
        className="login-toggle"
        aria-label="Cambiar tema"
        onClick={toggleTheme}
      >
        <i className={`pi ${isDark ? "pi-sun" : "pi-moon"}`} />
      </button>

      {/* Panel de marca — oculto en móvil */}
      <aside className="login-aside flex-1">
        <div className="login-aside-content">
          <div className="flex align-items-center gap-3">
            <span className="brand-mark">{name?.[0].toUpperCase()}</span>
            <strong style={{ fontSize: 17 }}>{name}</strong>
          </div>

          <div>
            <p className="login-quote">
              "Cada docena que sale de aquí pasó por seis pares de manos. Este
              panel ayuda a que ninguna se pierda en el camino."
            </p>
            <p className="login-quote-role">Panel de producción — {name}</p>
          </div>
        </div>
      </aside>

      {/* Formulario */}
      <div className="flex-1 flex align-items-center justify-content-center p-4">
        <div className="login-card">
          <div className="text-center mb-5">
            <div className="flex align-items-center justify-content-center mb-3 md:hidden">
              <span
                className="brand-mark"
                style={{ width: 44, height: 44, fontSize: 18 }}
              >
                T
              </span>
            </div>
            <h1
              style={{
                fontSize: 22,
                fontWeight: 700,
                margin: 0,
                color: "var(--ink)",
              }}
            >
              Bienvenido de vuelta
            </h1>
            <p
              style={{
                fontSize: 13.5,
                color: "var(--stone)",
                margin: "6px 0 0",
              }}
            >
              Inicia sesión para continuar en {name}
            </p>
          </div>

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="taller-form flex flex-column gap-4"
          >
            {/* Usuario */}
            <div className="flex flex-column gap-1">
              <label>Usuario</label>
              <InputText
                {...register("username")}
                placeholder="Ingresa tu usuario"
                invalid={!!errors.username}
                className="w-full"
              />
              {errors.username && (
                <small className="p-error">{errors.username.message}</small>
              )}
            </div>

            {/* Contraseña */}
            <div className="flex flex-column gap-1">
              <label>Contraseña</label>
              <Controller
                name="password"
                control={control}
                render={({ field }) => (
                  <Password
                    {...field}
                    placeholder="Ingresa tu contraseña"
                    invalid={!!errors.password}
                    feedback={false}
                    toggleMask
                    className="w-full"
                    inputClassName="w-full"
                  />
                )}
              />
              {errors.password && (
                <small className="p-error">{errors.password.message}</small>
              )}
            </div>

            {/* Botón */}
            <Button
              type="submit"
              label={isSubmitting ? "Iniciando sesión..." : "Iniciar sesión"}
              icon={
                isSubmitting ? "pi pi-spin pi-spinner" : "pi pi-arrow-right"
              }
              iconPos="right"
              loading={isSubmitting}
              className="w-full mt-1 sf-btn"
              style={{ fontSize: "16px" }}
            />
          </form>

          <p
            style={{
              textAlign: "center",
              marginTop: 28,
              marginBottom: 0,
              fontSize: 12,
              color: "var(--stone)",
            }}
          >
            ShoeFlow © {new Date().getFullYear()}
          </p>
        </div>
      </div>
    </div>
  );
}
