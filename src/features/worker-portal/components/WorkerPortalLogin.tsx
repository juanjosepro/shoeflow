import { useState } from "react";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { InputOtp } from "primereact/inputotp";
import { useTenant } from "@/shared/hooks/useTenant";

// true = DNI + PIN de 4 dígitos. false = solo DNI (el backend también debe estar en el mismo modo).
const REQUIRE_PIN = true;
const PIN_LENGTH = 4;

interface Props {
  onLogin: (dni: string, pin?: string) => Promise<void>;
}

const getLoginError = (error: any) => {
  if (error?.response?.status === 429) return "Demasiados intentos. Espera un momento e inténtalo de nuevo.";
  if (typeof error?.response?.data?.detail === "string") return error.response.data.detail;
  return "No se pudo ingresar. Revisa tu conexión e inténtalo de nuevo.";
};

const WorkerPortalLogin = ({ onLogin }: Props) => {
  const { name } = useTenant();
  const [dni, setDni] = useState("");
  const [pin, setPin] = useState("");
  const [showPin, setShowPin] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSubmit = dni.trim().length > 0 && (!REQUIRE_PIN || pin.length === PIN_LENGTH);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit || loading) return;
    setLoading(true);
    setError(null);
    try {
      await onLogin(dni.trim(), REQUIRE_PIN ? pin : undefined);
    } catch (err) {
      setError(getLoginError(err));
      setPin(""); // si falló, que vuelva a escribir el PIN
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex align-items-center justify-content-center" style={{ minHeight: "100vh", padding: 16 }}>
      <form
        onSubmit={handleSubmit}
        className="p-4 sf-border-line border-round-lg flex flex-column gap-3"
        style={{ width: "100%", maxWidth: 380 }}
      >
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 600, margin: 0 }}>{ name }</h1>
          <p style={{ fontSize: 14, color: "var(--sf-ink-2)", margin: "4px 0 0" }}>
            Consulta tu trabajo y tus pagos.
          </p>
        </div>

        <div className="flex flex-column gap-2">
          <label htmlFor="portal-dni" style={{ fontSize: 13, fontWeight: 500 }}>
            Tu DNI
          </label>
          <InputText
            id="portal-dni"
            value={dni}
            onChange={(e) => setDni(e.target.value)}
            inputMode="numeric"
            autoComplete="off"
            autoFocus
            placeholder="Escribe tu número de DNI"
          />
        </div>

        {REQUIRE_PIN && (
          <div className="flex flex-column gap-2">
            <div className="flex align-items-center justify-content-between">
              <label style={{ fontSize: 13, fontWeight: 500 }}>PIN de {PIN_LENGTH} dígitos</label>
              {/* Ojito: muestra u oculta los dígitos */}
              <Button
                type="button"
                icon={showPin ? "pi pi-eye-slash" : "pi pi-eye"}
                className="p-button-sm p-button-text p-button-rounded"
                style={{ color: "var(--sf-clay)" }}
                aria-label={showPin ? "Ocultar PIN" : "Mostrar PIN"}
                onClick={() => setShowPin((v) => !v)}
              />
            </div>
            <div className="flex justify-content-center">
              <InputOtp
                value={pin}
                onChange={(e) => setPin(String(e.value ?? ""))}
                length={PIN_LENGTH}
                integerOnly
                mask={!showPin}
              />
            </div>
          </div>
        )}

        {error && (
          <small role="alert" style={{ color: "var(--sf-clay)" }}>
            {error}
          </small>
        )}

        <Button type="submit" label="Ingresar" icon="pi pi-sign-in" severity="success" loading={loading} disabled={!canSubmit} />
      </form>
    </div>
  );
};

export default WorkerPortalLogin;