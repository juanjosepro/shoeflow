import { useEffect, useState } from "react";
import { Dialog } from "primereact/dialog";
import { toast } from "@/shared/lib/toast";
import { paymentService } from "../services/paymentService";
import { getApiError } from "../utils/format";
import type { Worker } from "../types/worker";
import type { DozenAssignment } from "@/features/dozens/types/dozen";
import type { Settlement } from "../types/payment";
import WorkerHistoryView from "./WorkerHistoryView";

interface Props {
  visible: boolean;
  onHide: () => void;
  worker: Worker | null;
}

// Historial de un trabajador visto por el administrador. La tabla y las pestañas
// están en WorkerHistoryView (la misma que usa el portal del trabajador).
const WorkerHistoryDialog = ({ visible, onHide, worker }: Props) => {
  const [assignments, setAssignments] = useState<DozenAssignment[]>([]);
  const [settlements, setSettlements] = useState<Settlement[]>([]);
  const [loading, setLoading] = useState(false);

  const workerId = worker?.id;

  useEffect(() => {
    if (!visible || workerId == null) return;

    let ignore = false;

    const load = async () => {
      setLoading(true);
      try {
        const [work, payments] = await Promise.all([
          paymentService.getAssignmentsByWorker(workerId),
          paymentService.getByWorker(workerId),
        ]);
        if (ignore) return;
        // Lo más reciente primero
        setAssignments([...work].sort((a, b) => b.completed_at.localeCompare(a.completed_at)));
        setSettlements(payments);
      } catch (error) {
        if (!ignore) toast.error(getApiError(error, "No se pudo cargar el historial."));
      } finally {
        if (!ignore) setLoading(false);
      }
    };

    load();
    return () => {
      ignore = true;
    };
  }, [visible, workerId]);

  return (
    <Dialog
      visible={visible}
      onHide={onHide}
      header={`Historial de ${worker?.names ?? ""}`}
      className="sf-dialog"
      style={{ width: "65vw" }}
      breakpoints={{ "960px": "90vw", "641px": "100vw" }}
      maskStyle={{ backdropFilter: "blur(4px)" }}
    >
      <WorkerHistoryView
        assignments={assignments}
        settlements={settlements}
        loading={loading}
        loadDetail={paymentService.getDetail}
      />
    </Dialog>
  );
};

export default WorkerHistoryDialog;
