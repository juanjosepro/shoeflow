import { useRef, useState } from "react";
import { Button } from "primereact/button";
import { Column } from "primereact/column";
import { DataTable } from "primereact/datatable";
import { InputText } from "primereact/inputtext";
import { ConfirmDialog } from "./../../components/ConfirmDialog";
import { toast } from "./../../lib/toast";
import { getApiError } from "../../utils/getApiError";
import { CatalogForm } from "./../components/CatalogForm";
import { useCatalog } from "./../hooks/useCatalog";
import type {
  CatalogFormData,
  CatalogItem,
  CatalogService,
} from "./../types/catalog";

interface Labels {
  singular: string; // "material"
  plural: string; // "materiales"
  feminine?: boolean; // "categoría" = true, para "creada" en vez de "creado"
}

interface Props<T extends CatalogItem> {
  service: CatalogService<T, CatalogFormData>;
  labels: Labels;
  hasActive?: boolean; // muestra estado y el botón activar/desactivar
  descriptionLabel?: string;
  descriptionPlaceholder?: string;
}

const capitalize = (text: string) =>
  text.charAt(0).toUpperCase() + text.slice(1);

// Página genérica para las tablas simples del catálogo: tabla con búsqueda y paginación
// en el navegador (son pocas filas), más crear, editar, activar/desactivar y eliminar.
export const CatalogPage = <T extends CatalogItem>({
  service,
  labels,
  hasActive = false,
  descriptionLabel,
  descriptionPlaceholder,
}: Props<T>) => {
  const { items, loading, addItem, updateItem, toggleActive, deleteItem } =
    useCatalog<T, CatalogFormData>(service);

  const [search, setSearch] = useState("");

  const [modalItem, setModalItem] = useState<T | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [itemToDelete, setItemToDelete] = useState<T | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Spinner de pantalla completa solo la primera vez
  const hasLoaded = useRef(false);
  if (!loading) hasLoaded.current = true;

  // "Material creado" / "Categoría creada"
  const done = (verb: string) =>
    `${capitalize(labels.singular)} ${verb}${labels.feminine ? "a" : "o"}`;

  const openCreate = () => {
    setModalItem(null);
    setIsModalOpen(true);
  };

  const openEdit = (item: T) => {
    setModalItem(item);
    setIsModalOpen(true);
  };

  const handleSubmit = async (formData: CatalogFormData) => {
    setIsSubmitting(true);
    try {
      if (modalItem) {
        await updateItem(modalItem.id, formData);
        toast.success(done("actualizad"));
      } else {
        await addItem(formData);
        toast.success(done("cread"));
      }
      setIsModalOpen(false);
    } catch (error) {
      toast.error(
        getApiError(
          error,
          `Error al guardar ${labels.feminine ? "la" : "el"} ${labels.singular}.`,
        ),
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggle = async (item: T) => {
    try {
      await toggleActive(item);
      toast.success(done(item.is_active ? "desactivad" : "activad"));
    } catch (error) {
      toast.error(getApiError(error, "No se pudo cambiar el estado."));
    }
  };

  const handleDelete = async () => {
    if (!itemToDelete) return;
    setIsDeleting(true);
    try {
      await deleteItem(itemToDelete.id);
      toast.success(done("eliminad"));
      setItemToDelete(null);
    } catch (error) {
      // Si está en uso, el backend explica por qué no se puede eliminar
      toast.error(getApiError(error, "No se pudo eliminar."));
      setItemToDelete(null);
    } finally {
      setIsDeleting(false);
    }
  };

  const statusBodyTemplate = (item: T) => (
    <span
      className={`sf-tag ${item.is_active ? "moss" : "clay"}`}
      style={{ display: "inline-block", width: 80, textAlign: "center" }}
    >
      {item.is_active ? "Activo" : "Inactivo"}
    </span>
  );

  const actionsBodyTemplate = (item: T) => (
    <div className="flex gap-1 justify-content-end">
      <Button
        icon="pi pi-pencil"
        text
        severity="secondary"
        size="small"
        className="p-1"
        tooltip="Editar"
        tooltipOptions={{ position: "top" }}
        onClick={() => openEdit(item)}
      />
      {hasActive && (
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
      )}
      <Button
        icon="pi pi-trash"
        text
        severity="secondary"
        size="small"
        className="p-1"
        tooltip="Eliminar"
        tooltipOptions={{ position: "top" }}
        onClick={() => setItemToDelete(item)}
      />
    </div>
  );

  const header = (
    <div className="flex justify-content-start">
      <span className="p-input-icon-left">
        <i className="pi pi-search pl-2" />
        <InputText
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={`Buscar ${labels.plural}...`}
          className="pr-2 pl-5"
          style={{ width: "250px" }}
        />
      </span>
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
        paginator
        rows={10}
        rowsPerPageOptions={[10, 20, 50]}
        globalFilter={search}
        globalFilterFields={["name", "description"]}
        dataKey="id"
        emptyMessage={`No se encontraron ${labels.plural}.`}
        className="sf-table"
      >
        <Column
          field="name"
          header="Nombre"
          sortable
          style={{ minWidth: "12rem" }}
          body={(i: T) => <strong>{i.name}</strong>}
        />
        <Column
          field="description"
          header={descriptionLabel ?? "Descripción"}
          style={{ minWidth: "14rem" }}
          body={(i: T) => i.description || "—"}
        />
        {hasActive && <Column header="Estado" body={statusBodyTemplate} />}
        <Column body={actionsBodyTemplate} style={{ width: "9rem" }} />
      </DataTable>

      <CatalogForm
        visible={isModalOpen}
        title={`${modalItem ? "Editar" : labels.feminine ? "Nueva" : "Nuevo"} ${labels.singular}`}
        onHide={() => setIsModalOpen(false)}
        item={modalItem}
        onSubmit={handleSubmit}
        isLoading={isSubmitting}
        hasActive={hasActive}
        descriptionLabel={descriptionLabel}
        descriptionPlaceholder={descriptionPlaceholder}
      />

      <ConfirmDialog
        open={!!itemToDelete}
        onOpenChange={(open) => {
          if (!open) setItemToDelete(null);
        }}
        title={`¿Eliminar ${labels.singular}?`}
        description={`Se eliminará "${itemToDelete?.name ?? ""}". Si ya se usa en otros registros no se podrá eliminar${
          hasActive ? "; puedes desactivarlo en su lugar" : ""
        }.`}
        onConfirm={handleDelete}
        isLoading={isDeleting}
        textButton="Eliminar"
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
