import { useEffect, useState } from "react";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { InputOtp } from "primereact/inputotp";
import { toast } from "@/shared/lib/toast";
import { pinService } from "../services/pinService";
import { getApiError } from "../utils/format";
import type { Worker } from "../types/worker";

const PIN_LENGTH = 4;

interface Props {
  visible: boolean;
  onHide: () => void;
  worker: Worker | null;
  hasPin: boolean; // para el texto: asignar o cambiar
  onSaved: (workerId: number) => void;
}

// El administrador define el PIN del trabajador. Se guarda cifrado: después ya no se puede ver.
const WorkerPinDialog = ({ visible, onHide, worker, hasPin, onSaved }: Props) => {
  const [pin, setPin] = useState("");
  const [showPin, setShowPin] = useState(true); // el administrador lo escribe a la vista para dictarlo
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (visible) {
      setPin("");
      setShowPin(true);
    }
  }, [visible]);

  const handleSave = async () => {
    if (!worker || pin.length !== PIN_LENGTH) return;
    setSaving(true);
    try {
      await pinService.setPin(worker.id, pin);
      toast.success(hasPin ? "PIN actualizado." : "PIN asignado.");
      onSaved(worker.id);
      onHide();
    } catch (error) {
      toast.error(getApiError(error, "No se pudo guardar el PIN."));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog
      visible={visible}
      onHide={() => {
        if (!saving) onHide();
      }}
      header={`${hasPin ? "Cambiar" : "Asignar"} PIN`}
      className="sf-dialog"
      style={{ width: "min(26rem, 95vw)" }}
      maskStyle={{ backdropFilter: "blur(4px)" }}
      footer={
        <div className="flex justify-content-end gap-2">
          <Button label="Cancelar" outlined severity="secondary" disabled={saving} onClick={onHide} />
          <Button
            label="Guardar PIN"
            icon="pi pi-check"
            loading={saving}
            disabled={pin.length !== PIN_LENGTH}
            onClick={handleSave}
            severity="success"
          />
        </div>
      }
    >
      <p style={{ margin: "0 0 12px", fontSize: 14 }}>
        PIN de <strong>{worker?.names}</strong> para entrar al portal junto con su DNI. Anótalo o dícteselo: una vez
        guardado no se puede volver a ver, solo cambiar.
      </p>

      <div className="flex align-items-center justify-content-between mb-2">
        <label style={{ fontSize: 13, fontWeight: 500 }}>PIN de {PIN_LENGTH} dígitos</label>
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
    </Dialog>
  );
};

export default WorkerPinDialog;
