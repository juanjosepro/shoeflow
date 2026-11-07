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
import { Tooltip } from "primereact/tooltip";
import Loading from "@/shared/components/Loading";

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
    } catch (e) {
      if (e.response?.status === 400) throw e;
      toast.error(getApiError(e, "Error al guardar la especialidad."));
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
    const confirmed = window.confirm(
      "¿Seguro que quieres cambiar el orden de las etapas de producción?\n\nEsto afecta el orden en que se muestran y se asignan las etapas.",
    );
    if (!confirmed) return; // cancelar: no se guarda nada

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
        <small className="text-gray-300 text-xs mt-1">{item.description}</small>
      )}
      {(item.excludes?.length ?? 0) > 0 && (
        <small className="text-red-300 flex gap-2 mt-2 text-xs font-semibold">
          {/* No se usa junto con: <span className="sf-tag clay">{item.excludes.map((id) => items.find((i) => i.id === id)?.name ?? id).join(", ")}</span> */}
          No se usa junto con:
          {item.excludes.map((id) => {
            const name = items.find((i) => i.id === id)?.name ?? id;

            return (
              <span key={id} className="sf-tag red">
                {name}
              </span>
            );
          })}
        </small>
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
    <>
      <div className="flex flex-column gap-1">
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
        <small className="text-gray-200 font-light">
          {canReorder
            ? "Arrastra las filas para cambiar el orden del proceso."
            : "Limpia la búsqueda para reordenar."}
        </small>
      </div>
      <div>
        <Button
          label="Nuevo"
          icon="pi pi-plus"
          severity="success"
          onClick={() => openCreate()}
        />
      </div>
    </>
  );

  if (loading && !hasLoaded.current) return <Loading />;

  return (
    <>
      <Tooltip
        target=".p-datatable-reorderablerow-handle"
        content="Arrastra para reordenar las etapas de producción"
        position="top"
      />

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
        {canReorder && (
          <Column
            header={<span title="Arrastra para reordenar">↕</span>}
            rowReorder
            style={{ width: "3rem" }}
          />
        )}
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
        others={items.filter((item) => item.id !== modalItem?.id)}
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
    </>
  );
};
