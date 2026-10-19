import { useEffect, useState } from "react";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import api from "@/shared/lib/axios";
import { modelService } from "../services/modelService";
import type {
  Model,
  ModelSizeRate,
  SizeOption,
  SpecialtyOption,
} from "../types/model";
import type { Category } from "@/shared/types";
import {
  modelSchema,
  getDefaultModelFormValues,
  type ModelFormInput,
  type ModelFormData,
} from "../schemas/model-form.schema";
import { applyBackendErrors } from "@/shared/lib/applyBackendErrors";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { Dropdown } from "primereact/dropdown";
import { InputText } from "primereact/inputtext";
import { InputTextarea } from "primereact/inputtextarea";
import { InputNumber } from "primereact/inputnumber";
import { Accordion, AccordionTab } from "primereact/accordion";
import { Divider } from "primereact/divider";

interface Props {
  model?: Model | null;
  visible: boolean;
  onHide: () => void;
  onSubmit: (data: ModelFormData) => Promise<void>;
  isLoading: boolean;
}

export const ModelForm = ({
  model = null,
  visible,
  onHide,
  onSubmit,
  isLoading,
}: Props) => {
  // Catálogos que alimentan el formulario
  const [categories, setCategories] = useState<Category[]>([]);
  const [specialties, setSpecialties] = useState<SpecialtyOption[]>([]);
  const [sizes, setSizes] = useState<SizeOption[]>([]);

  const [loadingData, setLoadingData] = useState(true); // catálogos
  const [loadingDetail, setLoadingDetail] = useState(false); // precios del modelo a editar
  const [openTabs, setOpenTabs] = useState<number[]>([0]); // acordeón: primera especialidad abierta

  const {
    register,
    handleSubmit,
    control,
    reset,
    setError,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ModelFormInput>({
    resolver: zodResolver(modelSchema),
    defaultValues: getDefaultModelFormValues(),
  });

  // Una fila por cada combinación especialidad + talla: { specialty, size, price }
  const { fields } = useFieldArray({ control, name: "size_rates" });
  const rates = watch("size_rates");

  // 1. Cargar catálogos una sola vez
  useEffect(() => {
    const load = async () => {
      try {
        const [catsRes, specsRes, sizesRes] = await Promise.all([
          api.get<Category[]>("catalog/categories/?no_pagination=true"),
          api.get<SpecialtyOption[]>(
            "staff/specialties/?is_active=true&no_pagination=true",
          ),
          api.get<SizeOption[]>("catalog/sizes/?no_pagination=true"),
        ]);
        setCategories(catsRes.data);
        setSpecialties(specsRes.data);
        setSizes(sizesRes.data);
      } finally {
        setLoadingData(false);
      }
    };
    load();
  }, []);

  // 2. Cada vez que se abre el formulario, armar sus valores
  useEffect(() => {
    if (!visible || loadingData) return;

    // Arma la grilla completa (todas las especialidades x todas las tallas),
    // rellenando con los precios que el modelo ya tiene.
    const buildRates = (saved: ModelSizeRate[] = []) =>
      specialties.flatMap((sp) =>
        sizes.map((sz) => {
          const found = saved.find(
            (r) => r.specialty === sp.id && r.size === sz.id,
          );
          return {
            specialty: sp.id,
            size: sz.id,
            price: found?.price != null ? Number(found.price) : null,
          };
        }),
      );

    const prepare = async () => {
      if (!model) {
        reset({ ...getDefaultModelFormValues(), size_rates: buildRates() });
        return;
      }

      // La lista de tarjetas no trae los precios: se piden al abrir la edición
      setLoadingDetail(true);
      try {
        const detail = await modelService.getById(model.id);
        reset({
          name: model.name,
          code_prefix: model.code_prefix,
          description: model.description,
          category_id: model.category.id,
          is_active: model.is_active,
          size_rates: buildRates(detail.size_rates),
        });
      } finally {
        setLoadingDetail(false);
      }
    };
    prepare();
  }, [visible, model, loadingData, specialties, sizes, reset]);

  const submit = handleSubmit(async (data) => {
    try {
      await onSubmit(data as ModelFormData);
    } catch (e) {
      if (!applyBackendErrors(e, setError, data)) throw e;
    }
  });

  // Copia el primer precio escrito de una especialidad a todas sus tallas
  const copyFirstPriceToAllSizes = (specialtyId: number) => {
    const firstPrice =
      rates.find((r) => r.specialty === specialtyId && r.price !== null)
        ?.price ?? null;

    fields.forEach((field, index) => {
      if (field.specialty === specialtyId) {
        setValue(`size_rates.${index}.price`, firstPrice, {
          shouldDirty: true,
        });
      }
    });
  };

  const sizeOf = (sizeId: number) => sizes.find((s) => s.id === sizeId);

  const footer = (
    <div className="flex justify-content-end align-items-center">
      <Button
        label="Cancelar"
        icon="pi pi-times"
        severity="secondary"
        outlined
        onClick={onHide}
        disabled={isLoading}
      />
      <Button
        label={isLoading ? "Guardando..." : "Guardar"}
        icon="pi pi-check"
        severity={model ? "warning" : "success"}
        loading={isLoading}
        onClick={submit}
      />
    </div>
  );

  return (
    <Dialog
      visible={visible}
      onHide={() => {
        if (isLoading) return;
        onHide();
      }}
      header={model ? "Editar Modelo" : "Nuevo Modelo"}
      footer={footer}
      closable={!isLoading}
      className="p-fluid sf-dialog"
      style={{ width: "50vw" }}
      breakpoints={{ "960px": "75vw", "641px": "90vw" }}
    >
      {loadingData || loadingDetail ? (
        <div
          className="flex align-items-center justify-content-center"
          style={{ minHeight: "200px" }}
        >
          <i
            className="pi pi-spin pi-spinner"
            style={{ fontSize: "2rem", color: "var(--sf-clay)" }}
          />
        </div>
      ) : (
        <div className="flex flex-column gap-3 pt-2">
          {/* Categoría */}
          <div className="flex flex-column gap-1">
            <label className="font-bold">Línea de Calzado</label>
            <Controller
              name="category_id"
              control={control}
              render={({ field }) => (
                <Dropdown
                  {...field}
                  options={categories}
                  optionLabel="name"
                  optionValue="id"
                  placeholder="Seleccione una línea"
                  invalid={!!errors.category_id}
                  className="w-full"
                />
              )}
            />
            {errors.category_id && (
              <small className="p-error">{errors.category_id.message}</small>
            )}
          </div>

          {/* Nombre */}
          <div className="flex flex-column gap-1">
            <label className="font-bold">Nombre</label>
            <InputText
              {...register("name")}
              invalid={!!errors.name}
              className="uppercase"
              placeholder="Ej. AIR MAX"
            />
            {errors.name && (
              <small className="p-error">{errors.name.message}</small>
            )}
          </div>

          {/* Codigo de serie */}
          <div className="flex flex-column gap-1">
            <label className="font-bold">Codigo de serie</label>
            <Controller
              name="code_prefix"
              control={control}
              render={({ field }) => (
                <InputText
                  {...field}
                  invalid={!!errors.code_prefix}
                  disabled={!!model}
                  className="uppercase"
                  placeholder="Ej. AM"
                />
              )}
            />
            {errors.code_prefix && (
              <small className="p-error">{errors.code_prefix.message}</small>
            )}
          </div>

          {/* Descripción */}
          <div className="flex flex-column gap-1 mb-2">
            <label className="font-bold">Descripción</label>
            <InputTextarea
              {...register("description")}
              invalid={!!errors.description}
              rows={3}
              cols={150}
              className="uppercase"
              placeholder="Ej. Línea clásica con cámara de aire"
            />
            {errors.description && (
              <small className="p-error">{errors.description.message}</small>
            )}
          </div>

          {/* Precios por especialidad y talla */}
          <div className="flex flex-column gap-2">
            <Divider className="sf-divider" align="left">
              <div className="inline-flex align-items-center">
                <i className="pi pi-tag mr-2"></i>
                <b>Precios por especialidad y talla</b>
              </div>
            </Divider>
            <small className="mb-4" style={{ color: "var(--sf-ink-2)" }}>
              Precio por docena de cada etapa. Si dejas una talla vacía, usará
              la tarifa general.
            </small>

            {specialties.length === 0 || sizes.length === 0 ? (
              <small className="p-error">
                Primero registra especialidades y tallas para configurar
                precios.
              </small>
            ) : (
              <Accordion
                multiple
                activeIndex={openTabs}
                onTabChange={(e) => setOpenTabs(e.index as number[])}
                className="sf-accordion"
              >
                {specialties.map((specialty) => {
                  const filled = rates.filter(
                    (r) => r.specialty === specialty.id && r.price !== null,
                  ).length;

                  return (
                    <AccordionTab
                      key={specialty.id}
                      header={
                        <div className="flex align-items-center justify-content-between w-full">
                          <span>{specialty.name}</span>
                          <span
                            className="text-sm font-normal"
                            style={{ color: "var(--sf-ink-2)" }}
                          >
                            {filled}/{sizes.length} tallas
                          </span>
                        </div>
                      }
                    >
                      <div className="flex justify-content-end mb-2">
                        <Button
                          type="button"
                          label="Igualar todas las tallas"
                          icon="pi pi-copy"
                          size="small"
                          style={{
                            color: "var(--sf-moss)",
                          }}
                          text
                          onClick={() => copyFirstPriceToAllSizes(specialty.id)}
                        />
                      </div>

                      <div className="grid">
                        {fields.map((field, index) => {
                          if (field.specialty !== specialty.id) return null;
                          const size = sizeOf(field.size);

                          return (
                            <div
                              className="col-12 sm:col-6 md:col-4"
                              key={field.id}
                            >
                              <div className="flex flex-column gap-1">
                                <label className="text-sm font-bold">
                                  {size?.name}
                                  {size?.description && (
                                    <span
                                      className="font-normal ml-1"
                                      style={{ color: "var(--sf-ink-2)" }}
                                    >
                                      ({size.description})
                                    </span>
                                  )}
                                </label>
                                <Controller
                                  name={`size_rates.${index}.price`}
                                  control={control}
                                  render={({ field: priceField }) => (
                                    <InputNumber
                                      value={priceField.value}
                                      onValueChange={(e) =>
                                        priceField.onChange(e.value ?? null)
                                      }
                                      mode="currency"
                                      currency="PEN"
                                      locale="es-PE"
                                      min={0}
                                      placeholder="Sin precio"
                                      invalid={
                                        !!errors.size_rates?.[index]?.price
                                      }
                                      className="w-full"
                                    />
                                  )}
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </AccordionTab>
                  );
                })}
              </Accordion>
            )}
            {errors.size_rates?.message && (
              <small className="p-error">{errors.size_rates.message}</small>
            )}
          </div>
        </div>
      )}
    </Dialog>
  );
};
