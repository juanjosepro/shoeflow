import { useRef, useState } from "react";
import { Button } from "primereact/button";
import { ConfirmDialog } from "@/shared/components/ConfirmDialog";
import { toast } from "@/shared/lib/toast";
import { RATES_PAGE_SIZE, useRates } from "../hooks/useRates";
import { useRateOptions } from "../hooks/useRateOptions";
import { RateList } from "../components/RateList";
import { RateForm } from "../components/RateForm";
import RateFilters from "../components/RateFilters";
import type { Rate, RateFormData, RateQueryParams } from "../types/rate";

const EMPTY_FILTERS: RateQueryParams = {
  specialty: null,
  model: null,
  size: null,
  material_type: null,
  plant_type: null,
};

// El backend responde { detail } o { non_field_errors: [...] } (por ejemplo, tarifa repetida)
const getApiError = (error: any, fallback: string) => {
  const data = error?.response?.data;
  if (typeof data?.detail === "string") return data.detail;
  if (Array.isArray(data?.non_field_errors))
    return data.non_field_errors.join(" ");
  return fallback;
};

export const RatesPage = () => {
  const [filters, setFilters] = useState<RateQueryParams>(EMPTY_FILTERS);
  const {
    rates,
    count,
    page,
    loading,
    getPaginated,
    addRate,
    updateRate,
    deleteRate,
  } = useRates({
    query: filters,
  });
  const { options } = useRateOptions();

  const [modalRate, setModalRate] = useState<Rate | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [rateToDelete, setRateToDelete] = useState<Rate | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Spinner de pantalla completa solo la primera vez
  const hasLoaded = useRef(false);
  if (!loading) hasLoaded.current = true;

  const hasActiveFilters = Object.values(filters).some(
    (value) => value !== null,
  );

  const openCreate = () => {
    setModalRate(null);
    setIsModalOpen(true);
  };

  const openEdit = (rate: Rate) => {
    setModalRate(rate);
    setIsModalOpen(true);
  };

  const handleSubmit = async (formData: RateFormData) => {
    setIsSubmitting(true);
    try {
      if (modalRate) {
        await updateRate(modalRate.id, formData);
        toast.success("Tarifa actualizada");
      } else {
        await addRate(formData);
        toast.success("Tarifa creada");
      }
      setIsModalOpen(false);
    } catch (error) {
      toast.error(getApiError(error, "Error al guardar la tarifa."));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!rateToDelete) return;
    setIsDeleting(true);
    try {
      await deleteRate(rateToDelete.id);
      toast.success("Tarifa eliminada");
      setRateToDelete(null);
    } catch (error) {
      toast.error(getApiError(error, "No se pudo eliminar la tarifa."));
    } finally {
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
      {/* <Message
        severity="secondary"
        className="w-full justify-content-start mb-3"
        text="Para cada docena se usa la tarifa más específica que le corresponda (la que cumple más condiciones). Si hay empate, pesa más material, luego planta, luego talla y luego modelo. Si ninguna aplica, la docena no se puede asignar."
      /> */}
      <div className="card flex justify-content-between mb-4">
        <div>
          <Button
            icon="pi pi-question"
            rounded
            aria-label="Bookmark"
            size="small"
            className="p-0"
            style={{
              width: "24px",
              height: "24px",
              background: "var(--sf-moss-light)",
              borderColor: "var(--sf-moss-light)",
              color: "var(--sf-moss)",
            }}
            tooltip="Para cada docena se usa la tarifa más específica que le corresponda (la que cumple más condiciones). Si hay empate, pesa más material, luego planta, luego talla y luego modelo. Si ninguna aplica, la docena no se puede asignar."
          />
        </div>
        <div>
          <Button
            label="Nuevo"
            icon="pi pi-plus"
            className="sf-btn p-button-sm"
            onClick={openCreate}
          />
        </div>
      </div>

      <RateList
        rates={rates}
        loading={loading}
        header={
          <RateFilters
            options={options}
            queryParams={filters}
            onFilterChange={(field, value) =>
              setFilters((prev) => ({ ...prev, [field]: value }))
            }
            clearFilters={() => setFilters(EMPTY_FILTERS)}
            hasActiveFilters={hasActiveFilters}
          />
        }
        onEdit={openEdit}
        onDelete={setRateToDelete}
        totalRecords={count}
        first={(page - 1) * RATES_PAGE_SIZE}
        onPageChange={(newPage) => getPaginated(newPage)}
      />

      <RateForm
        visible={isModalOpen}
        onHide={() => {
          if (isSubmitting) return;
          setIsModalOpen(false);
        }}
        rate={modalRate}
        onSubmit={handleSubmit}
        isLoading={isSubmitting}
        options={options}
      />

      <ConfirmDialog
        open={!!rateToDelete}
        onOpenChange={(open) => {
          if (!open) setRateToDelete(null);
        }}
        title="¿Eliminar tarifa?"
        description={`Se eliminará la tarifa de ${rateToDelete?.specialty_name ?? ""}. Si era la única que cubría ciertas docenas, ya no se podrán asignar esas etapas. Lo ya registrado no cambia.`}
        onConfirm={handleDelete}
        isLoading={isDeleting}
        textButton="Eliminar"
      />
    </>
  );
};
