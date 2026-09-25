import { useState } from "react";
import { useModels } from "../hooks/useModels";
import { ModelCard } from "../components/ModelCard";
import { ModelForm } from "../components/ModelForm";
import { ConfirmDialog } from "@/shared/components/ConfirmDialog";
import { toast } from "@/shared/lib/toast";
import type { ModelFormData, Model, ModelPayload } from "../types/model";
import { Button } from "primereact/button";

export const ModelsPage = () => {
  const { models, loading, addModel, updateModel, toggleModelStatus } = useModels();

  const [modalModel, setModalModel] = useState<Model | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [confirmModel, setConfirmModel] = useState<Model | null>(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isToggling, setIsToggling] = useState(false);

  const openCreate = () => {
    setModalModel(null);
    setIsModalOpen(true);
  };

  const openEdit = (model: Model) => {
    setModalModel(model);
    setIsModalOpen(true);
  };

  const handleToggleRequest = (model: Model) => {
    if (model.is_active) {
      setConfirmModel(model);
      setIsConfirmOpen(true);
    } else {
      handleToggleConfirm(model);
    }
  };

  const handleToggleConfirm = async (model: Model | null = confirmModel) => {
    if (!model) return;
    setIsToggling(true);
    try {
      await toggleModelStatus(model.id, model.is_active);
      toast.success(model.is_active ? 'Modelo desactivado' : 'Modelo activado');
      setIsConfirmOpen(false);
    } catch {
      toast.error('Error al cambiar el estado del modelo.');
    } finally {
      setIsToggling(false);
    }
  };

  const handleSubmit = async (formData: ModelPayload) => {
    setIsSubmitting(true);
    try {
      const payload: ModelFormData = {
        ...formData,
        category_id: Number(formData.category),
        model_variants: formData.variants,
      };
      if (modalModel) {
        await updateModel(modalModel.id, payload);
        toast.success('Modelo actualizado');
      } else {
        await addModel(payload);
        toast.success('Modelo creado');
      }
      setIsModalOpen(false);
    } catch {
      toast.error('Error al guardar el modelo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex align-items-center justify-content-center" style={{ height: '100vh' }}>
        <i className="pi pi-spin pi-spinner" style={{ fontSize: '2.5rem' }} />
      </div>
    );
  }

  return (
    <>
      <div className="grid">
        {models.map((brand) => (
          <div className="col-12 sm:col-6 md:col-4 lg:col-3" key={brand.id}>
            <ModelCard
              model={brand}
              onEdit={openEdit}
              onToggle={handleToggleRequest}
            />
          </div>
        ))}
      </div>

      <ModelForm
        visible={isModalOpen}
        onHide={() => { if (isSubmitting) return; setIsModalOpen(false); }}
        model={modalModel}
        onSubmit={handleSubmit}
        isLoading={isSubmitting}
      />

      {/* Modal confirmación desactivar */}
      <ConfirmDialog
        open={isConfirmOpen}
        onOpenChange={setIsConfirmOpen}
        title="¿Desactivar programa?"
        description={`El modelo "${confirmModel?.name}" dejará de estar disponible para nuevas inscripciones.`}
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