import { useRef, useState } from "react";
import { Button } from "primereact/button";
import { Column } from "primereact/column";
import { DataTable, type DataTableRowReorderEvent } from "primereact/datatable";
import { InputText } from "primereact/inputtext";
import { ConfirmDialog } from "@/shared/components/ConfirmDialog";
import { toast } from "@/shared/lib/toast";
import { getApiError } from "@/shared/utils/getApiError";
import { useSpecialties } from "../hooks/useSpecialties";
import { SpecialtyForm } from "../components/SpecialtyForm";
import type { Specialty, SpecialtyFormData } from "../types/specialty";

export const SpecialtiesPage = () => {
  const {
    items,
    loading,
    addItem,
    updateItem,
    toggleActive,
    deleteItem,
    reorder,
  } = useSpecialties();

  const [search, setSearch] = useState("");

  const [modalItem, setModalItem] = useState<Specialty | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [itemToDelete, setItemToDelete] = useState<Specialty | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Spinner de pantalla completa solo la primera vez
  const hasLoaded = useRef(false);
  if (!loading) hasLoaded.current = true;

  // Posición sugerida para una etapa nueva: después de la última
  const nextOrder =
    items.reduce((max, item) => Math.max(max, item.order), 0) + 1;

  // Con una búsqueda activa la tabla muestra solo algunas filas: reordenar así confundiría
  const canReorder = search.trim() === "";

  const openCreate = () => {
    setModalItem(null);
    setIsModalOpen(true);
  };

  const openEdit = (item: Specialty) => {
    setModalItem(item);
    setIsModalOpen(true);
  };

  const handleSubmit = async (formData: SpecialtyFormData) => {
    setIsSubmitting(true);
    try {
      if (modalItem) {
        await updateItem(modalItem.id, formData);
        toast.success("Especialidad actualizada");
      } else {
        await addItem(formData);
        toast.success("Especialidad creada");
      }
      setIsModalOpen(false);
    } catch (error) {
      toast.error(getApiError(error, "Error al guardar la especialidad."));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggle = async (item: Specialty) => {
    try {
      await toggleActive(item);
      toast.success(
        item.is_active ? "Especialidad desactivada" : "Especialidad activada",
      );
    } catch (error) {
      toast.error(getApiError(error, "No se pudo cambiar el estado."));
    }
  };

  const handleReorder = async (
    event: DataTableRowReorderEvent<Specialty[]>,
  ) => {
    try {
      await reorder(event.value);
    } catch (error) {
      toast.error(getApiError(error, "No se pudo guardar el nuevo orden."));
    }
  };

  const handleDelete = async () => {
    if (!itemToDelete) return;
    setIsDeleting(true);
    try {
      await deleteItem(itemToDelete.id);
      toast.success("Especialidad eliminada");
    } catch (error) {
      // Si ya tiene etapas asignadas en docenas, el backend explica por qué no se puede
      toast.error(getApiError(error, "No se pudo eliminar la especialidad."));
    } finally {
      setItemToDelete(null);
      setIsDeleting(false);
    }
  };

  const nameBodyTemplate = (item: Specialty) => (
    <div className="flex flex-column">
      <strong>{item.name}</strong>
      {item.description && (
        <small className="text-color-secondary">{item.description}</small>
      )}
    </div>
  );

  const statusBodyTemplate = (item: Specialty) => (
    <span
      className={`sf-tag ${item.is_active ? "moss" : "clay"}`}
      style={{ display: "inline-block", width: 80, textAlign: "center" }}
    >
      {item.is_active ? "Activa" : "Inactiva"}
    </span>
  );

  const actionsBodyTemplate = (item: Specialty) => (
    <div className="flex gap-1 justify-content-end">
      <Button
        icon="pi pi-pencil"
        rounded
        text
        severity="secondary"
        size="small"
        className="p-1"
        tooltip="Editar"
        tooltipOptions={{ position: "top" }}
        onClick={() => openEdit(item)}
      />
      <Button
        icon={item.is_active ? "pi pi-ban" : "pi pi-check-circle"}
        text
        severity="secondary"
        size="small"
        className="p-1"
        tooltip={item.is_active ? "Desactivar" : "Activar"}
        tooltipOptions={{ position: "top" }}
        onClick={() => handleToggle(item)}
      />
      <Button
        icon="pi pi-trash"
        text
        severity="danger"
        size="small"
        className="p-1"
        tooltip="Eliminar"
        tooltipOptions={{ position: "top" }}
        onClick={() => setItemToDelete(item)}
      />
    </div>
  );

  const header = (
    <div className="flex align-items-center justify-content-between flex-wrap gap-2">
      <span className="p-input-icon-left">
        <i className="pi pi-search pl-2" />
        <InputText
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar especialidades..."
          className="pr-2 pl-5"
          style={{ width: "250px" }}
        />
      </span>
      <small className="text-color-secondary">
        {canReorder
          ? "Arrastra las filas para cambiar el orden del proceso."
          : "Limpia la búsqueda para reordenar."}
      </small>
    </div>
  );

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
      <DataTable
        value={items}
        loading={loading}
        header={header}
        reorderableRows={canReorder}
        onRowReorder={handleReorder}
        globalFilter={search}
        globalFilterFields={["name", "description"]}
        dataKey="id"
        emptyMessage="No se encontraron especialidades."
        className="sf-table"
      >
        {canReorder && <Column rowReorder style={{ width: "3rem" }} />}
        <Column
          header="Orden"
          style={{ width: "6rem" }}
          body={(item: Specialty) => (
            <span className="sf-tag">{item.order}</span>
          )}
        />
        <Column
          header="Especialidad"
          body={nameBodyTemplate}
          style={{ minWidth: "14rem" }}
        />
        <Column header="Estado" body={statusBodyTemplate} />
        <Column body={actionsBodyTemplate} style={{ width: "9rem" }} />
      </DataTable>

      <SpecialtyForm
        visible={isModalOpen}
        onHide={() => setIsModalOpen(false)}
        specialty={modalItem}
        nextOrder={nextOrder}
        onSubmit={handleSubmit}
        isLoading={isSubmitting}
      />

      <ConfirmDialog
        open={!!itemToDelete}
        onOpenChange={(open) => {
          if (!open) setItemToDelete(null);
        }}
        title="¿Eliminar especialidad?"
        description={`Se eliminará "${itemToDelete?.name ?? ""}" junto con sus tarifas y los extras de trabajadores en esta etapa. Si ya tiene etapas asignadas en docenas no se podrá eliminar; puedes desactivarla en su lugar.`}
        onConfirm={handleDelete}
        isLoading={isDeleting}
      />

      <Button
        rounded
        size="large"
        severity="success"
        icon="pi pi-plus"
        onClick={openCreate}
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
