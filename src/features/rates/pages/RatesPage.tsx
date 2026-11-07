import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "primereact/button";
import { ConfirmDialog } from "@/shared/components/ConfirmDialog";
import { toast } from "@/shared/lib/toast";
import { RATES_PAGE_SIZE, useRates } from "../hooks/useRates";
import { useRateOptions } from "../hooks/useRateOptions";
import { RateList } from "../components/RateList";
import { RateForm } from "../components/RateForm";
import RateFilters from "../components/RateFilters";
import { rateService } from "../services/rateService";
import type { MissingBaseSpecialty, Rate, RateFormData, RateQueryParams } from "../types/rate";
// import RateCoverageDialog from "../components/RateCoverageDialog";
import Loading from "@/shared/components/Loading";
import { Message } from "primereact/message";

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

  // const [isCoverageOpen, setIsCoverageOpen] = useState(false);
    // Etapas antiguas que todavía no tienen tarifa base (las nuevas la traen desde que se crean)
  const [missingBase, setMissingBase] = useState<MissingBaseSpecialty[]>([]);
  // Si no es null, el formulario crea la tarifa base de esa etapa
  const [baseFor, setBaseFor] = useState<number | null>(null);

  const loadMissingBase = useCallback(() => {
    rateService
      .getMissingBase()
      .then(setMissingBase)
      .catch(() => setMissingBase([])); // el aviso es de ayuda: si falla, no estorba
  }, []);

  useEffect(() => {
    loadMissingBase();
  }, [loadMissingBase]);

  // Spinner de pantalla completa solo la primera vez
  const hasLoaded = useRef(false);
  if (!loading) hasLoaded.current = true;

  const hasActiveFilters = Object.values(filters).some(
    (value) => value !== null,
  );

  const openCreate = () => {
    setModalRate(null);
    setBaseFor(null);
    setIsModalOpen(true);
  };

  const openCreateBase = (specialtyId: number) => {
    setModalRate(null);
    setBaseFor(specialtyId);
    setIsModalOpen(true);
  };

  const openEdit = (rate: Rate) => {
    setModalRate(rate);
    setBaseFor(null);
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
      loadMissingBase();
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
      loadMissingBase();
    } catch (error) {
      toast.error(getApiError(error, "No se pudo eliminar la tarifa."));
    } finally {
      setIsDeleting(false);
    }
  };

  if (loading && !hasLoaded.current) return <Loading />

  return (
    <>
      {/* <Message
        severity="info"
        className="w-full justify-content-start mb-3"
        text="Para cada docena se usa la tarifa más específica que le corresponda (la que cumple más condiciones). Si hay empate, pesa más material, luego planta, luego talla y luego modelo. Si ninguna aplica, la docena no se puede asignar."
      /> */}

      {/* Etapas antiguas sin base: sin ella, una docena que no cumpla otra tarifa no se podría asignar */}
      {missingBase.length > 0 && (
        <Message
          severity="warn"
          className="w-full justify-content-start mb-3"
          content={
            <div className="flex flex-column gap-2">
              <span style={{ color: "#765016" }}>
                {missingBase.length === 1 ? "Esta etapa no tiene" : "Estas etapas no tienen"} tarifa base. Sin ella,
                las docenas que no cumplan otra tarifa no se podrán asignar.
              </span>
              <div className="flex flex-wrap gap-2">
                {missingBase.map((specialty) => (
                  <Button
                    key={specialty.id}
                    label={`Crear base de ${specialty.name}`}
                    icon="pi pi-plus"
                    className="p-button-sm sf-btn--amber sf-btn--soft"
                    onClick={() => openCreateBase(specialty.id)}
                  />
                ))}
              </div>
            </div>
          }
        />
      )}

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
            openCreate={openCreate}
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
        baseFor={baseFor}
        onSubmit={handleSubmit}
        isLoading={isSubmitting}
        options={options}
      />

      {/* <RateCoverageDialog visible={isCoverageOpen} onHide={() => setIsCoverageOpen(false)} /> */}

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
