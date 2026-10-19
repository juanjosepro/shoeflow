import { useMemo, useRef, useState } from "react";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { Paginator, type PaginatorPageChangeEvent } from "primereact/paginator";
import { SelectButton } from "primereact/selectbutton";
import { ConfirmDialog } from "@/shared/components/ConfirmDialog";
import { toast } from "@/shared/lib/toast";
import { getApiError } from "@/shared/utils/getApiError";
import { useCatalog } from "@/shared/catalog/hooks/useCatalog";
import { colorService } from "../services/colorService";
import { ColorCard } from "../components/ColorCard";
import { ColorForm } from "../components/ColorForm";
import type { Color, ColorFormData } from "../types/color";

type StatusFilter = "all" | "active" | "inactive";

const STATUS_OPTIONS = [
  { label: "Todos", value: "all" },
  { label: "Activos", value: "active" },
  { label: "Inactivos", value: "inactive" },
];

const PAGE_SIZE = 12;

export const ColorsPage = () => {
  const {
    items: colors,
    loading,
    addItem,
    updateItem,
    toggleActive,
    deleteItem,
  } = useCatalog<Color, ColorFormData>(colorService);

  // Búsqueda, filtro y paginación en el navegador (son pocos colores)
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<StatusFilter>("all");
  const [first, setFirst] = useState(0);

  const [modalColor, setModalColor] = useState<Color | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [colorToDelete, setColorToDelete] = useState<Color | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Spinner de pantalla completa solo la primera vez
  const hasLoaded = useRef(false);
  if (!loading) hasLoaded.current = true;

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return colors.filter((color) => {
      if (status === "active" && !color.is_active) return false;
      if (status === "inactive" && color.is_active) return false;
      return (
        !term ||
        color.name.toLowerCase().includes(term) ||
        color.hex_code.toLowerCase().includes(term)
      );
    });
  }, [colors, search, status]);

  const visible = filtered.slice(first, first + PAGE_SIZE);

  const openCreate = () => {
    setModalColor(null);
    setIsModalOpen(true);
  };

  const openEdit = (color: Color) => {
    setModalColor(color);
    setIsModalOpen(true);
  };

  const handleSubmit = async (formData: ColorFormData) => {
    setIsSubmitting(true);
    try {
      if (modalColor) {
        await updateItem(modalColor.id, formData);
        toast.success("Color actualizado");
      } else {
        await addItem(formData);
        toast.success("Color creado");
      }
      setIsModalOpen(false);
    } catch (error) {
      // Nombre o código repetido: el backend dice cuál
      toast.error(getApiError(error, "Error al guardar el color."));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggle = async (color: Color) => {
    try {
      await toggleActive(color);
      toast.success(color.is_active ? "Color desactivado" : "Color activado");
    } catch (error) {
      toast.error(getApiError(error, "No se pudo cambiar el estado."));
    }
  };

  const handleDelete = async () => {
    if (!colorToDelete) return;
    setIsDeleting(true);
    try {
      await deleteItem(colorToDelete.id);
      toast.success("Color eliminado");
      // Si se borró el último de la página, retroceder una
      if (first > 0 && visible.length === 1) setFirst(first - PAGE_SIZE);
    } catch (error) {
      toast.error(getApiError(error, "No se pudo eliminar el color."));
    } finally {
      setColorToDelete(null);
      setIsDeleting(false);
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
      {/* Barra superior: búsqueda y filtro de estado */}
      <div className="flex align-items-center justify-content-between flex-wrap gap-3 mb-4">
        <span className="p-input-icon-left">
          <i className="pi pi-search pl-2" />
          <InputText
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setFirst(0);
            }}
            placeholder="Buscar por nombre o código..."
            className="pr-2 pl-5"
            style={{ width: "260px" }}
          />
        </span>

        <div className="flex align-items-center gap-3">
          <small className="text-color-secondary">
            {filtered.length} {filtered.length === 1 ? "color" : "colores"}
          </small>
          <SelectButton
            value={status}
            options={STATUS_OPTIONS}
            allowEmpty={false}
            onChange={(e) => {
              setStatus(e.value);
              setFirst(0);
            }}
          />
          <Button
            label="Nuevo"
            icon="pi pi-plus"
            className={`sf-btn p-button-sm`}
            onClick={() => openCreate()}
          />
        </div>
      </div>

      {/* Cuadrícula de tarjetas */}
      {visible.length === 0 ? (
        <div className="flex flex-column align-items-center gap-2 py-6 text-color-secondary">
          <i className="pi pi-palette" style={{ fontSize: "2.5rem" }} />
          <span>No se encontraron colores.</span>
        </div>
      ) : (
        <div className="grid">
          {visible.map((color) => (
            <div key={color.id} className="col-6 sm:col-6 md:col-4 xl:col-3">
              <ColorCard
                color={color}
                onEdit={openEdit}
                onToggle={handleToggle}
                onDelete={setColorToDelete}
              />
            </div>
          ))}
        </div>
      )}

      {filtered.length > PAGE_SIZE && (
        <Paginator
          first={first}
          rows={PAGE_SIZE}
          totalRecords={filtered.length}
          onPageChange={(e: PaginatorPageChangeEvent) => setFirst(e.first)}
          className="mt-3"
        />
      )}

      <ColorForm
        visible={isModalOpen}
        onHide={() => setIsModalOpen(false)}
        color={modalColor}
        onSubmit={handleSubmit}
        isLoading={isSubmitting}
      />

      <ConfirmDialog
        open={!!colorToDelete}
        onOpenChange={(open) => {
          if (!open) setColorToDelete(null);
        }}
        title="¿Eliminar color?"
        description={`Se eliminará "${colorToDelete?.name ?? ""}". Si ya se usa en docenas no se podrá eliminar; puedes desactivarlo en su lugar.`}
        onConfirm={handleDelete}
        isLoading={isDeleting}
        textButton="Eliminar"
      />
    </>
  );
};
