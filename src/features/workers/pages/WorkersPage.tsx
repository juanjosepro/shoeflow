import { useState } from "react";
import { useWorkers } from "../hooks/useWorkers";
import { WorkerCard } from "../components/WorkerCard";
import { WorkerForm } from "../components/WorkerForm";
import { ConfirmDialog } from "@/shared/components/ConfirmDialog";
import type { WorkerFormData, Worker, WorkerPayload } from "../types/worker";
import { toast } from "@/shared/lib/toast";
import { Button } from "primereact/button";

export const WorkersPage = () => {
  const { workers, loading, addWorker, updateWorker, toggleWorkerStatus } =
    useWorkers({ noPagination: true });

  const [modalWorker, setModalWorker] = useState<Worker | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [confirmWorker, setConfirmWorker] = useState<Worker | null>(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isToggling, setIsToggling] = useState(false);

  const openCreate = () => {
    setModalWorker(null);
    setIsModalOpen(true);
  };

  const openEdit = (worker: Worker) => {
    setModalWorker(worker);
    setIsModalOpen(true);
  };

  const handleToggleConfirm = async (worker: Worker | null = confirmWorker) => {
    if (!worker) return;

    setIsToggling(true);

    try {
      await toggleWorkerStatus(worker.id, worker.is_active);
      toast.success(
        worker.is_active ? "Trabajador desactivado" : "Trabajador activado",
      );
      setIsConfirmOpen(false);
    } catch {
      toast.error("Error al cambiar el estado del trabajador.");
    } finally {
      setIsToggling(false);
    }
  };

  const handleSubmit = async (formData: WorkerPayload) => {
    setIsSubmitting(true);
    try {
      const payload: WorkerFormData = {
        ...formData,
        team_id: Number(formData.team_id),
      };
      if (modalWorker) {
        await updateWorker(modalWorker.id, payload);
        toast.success("Trabajador actualizado");
      } else {
        await addWorker(payload);
        toast.success("Trabajador creado");
      }
      setIsModalOpen(false);
    } catch {
      toast.error("Error al guardar el trabajador.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div
        className="flex align-items-center justify-content-center"
        style={{ height: "100vh" }}
      >
        <i className="pi pi-spin pi-spinner" style={{ fontSize: "2.5rem" }} />
      </div>
    );
  }

  return (
    <>
      <WorkerCard workers={workers} loading={loading} onEdit={openEdit} />

      <WorkerForm
        visible={isModalOpen}
        onHide={() => {
          if (isSubmitting) return;
          setIsModalOpen(false);
        }}
        worker={modalWorker}
        onSubmit={handleSubmit}
        isLoading={isSubmitting}
      />

      {/* Modal confirmación desactivar */}
      <ConfirmDialog
        open={isConfirmOpen}
        onOpenChange={setIsConfirmOpen}
        title="Inhabilitar trabajador?"
        description={`El trabajador "${confirmWorker?.names}" será inhabilitado.`}
        onConfirm={() => handleToggleConfirm()}
        isLoading={isToggling}
      />

      <Button
        rounded
        size="large"
        severity="success"
        icon="pi pi-plus"
        onClick={() => openCreate()}
        style={{
          position: "fixed",
          right: 24,
          bottom: 24,
          padding: "1.8rem 1.9rem",
        }}
      />
    </>
  );
};
