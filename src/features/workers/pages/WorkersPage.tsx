import { useRef, useState } from "react";
import { PAGE_SIZE, useWorkers } from "../hooks/useWorkers";
import { WorkerList } from "../components/WorkerList";
import { WorkerForm } from "../components/WorkerForm";
import { ConfirmDialog } from "@/shared/components/ConfirmDialog";
import type { WorkerFormData, Worker, WorkerPayload } from "../types/worker";
import { toast } from "@/shared/lib/toast";
import { Button } from "primereact/button";
import { useDebounce } from "@/shared/hooks/useDebounce";

export const WorkersPage = () => {
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 400);
  const {
    workers,
    count,
    page,
    loading,
    getPaginated,
    addWorker,
    updateWorker,
    toggleWorkerStatus,
  } = useWorkers({
    query: { search: debouncedSearch },
  });

  const [modalWorker, setModalWorker] = useState<Worker | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [confirmWorker, setConfirmWorker] = useState<Worker | null>(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isToggling, setIsToggling] = useState(false);

  // Spinner de pantalla completa solo la primera vez
  const hasLoaded = useRef(false);
  if (!loading) hasLoaded.current = true;

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

  if (loading && !hasLoaded.current) {
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
      <WorkerList
        workers={workers}
        loading={loading}
        onEdit={openEdit}
        search={search}
        onSearchChange={setSearch}
        totalRecords={count}
        first={(page - 1) * PAGE_SIZE}
        onPageChange={(newPage) => getPaginated(newPage)}
      />

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
