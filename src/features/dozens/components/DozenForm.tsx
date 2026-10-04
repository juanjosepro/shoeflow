import { useEffect, useState, useTransition } from "react";
import CheckRadio from "@/shared/components/CheckRadio";
import { Button } from "primereact/button";
import { InputNumber } from "primereact/inputnumber";
import { InputTextarea } from "primereact/inputtextarea";
import { Calendar } from "primereact/calendar";
import { Accordion, AccordionTab } from "primereact/accordion";
import api from "@/shared/lib/axios";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { Dozen } from "../types/dozen";
import {
  dozenSchema,
  getDefaultDozenFormValues,
  type DozenFormInput,
  type DozenFormData,
} from "../schemas/dozenSchema";
import { useNavigate } from "react-router-dom";

interface DozenFormProps {
  saveAction: (data: DozenFormData) => Promise<unknown>;
  isEditing?: boolean;
  groupedByTeamId: any;
  models: any[];
  metadata: any;
  teamsChoices: Record<string, number>;
  dozen?: Dozen | null;
}

const DozenForm = ({
  saveAction,
  isEditing,
  groupedByTeamId,
  models,
  metadata,
  teamsChoices,
  dozen,
}: DozenFormProps) => {
  const navigate = useNavigate();
  const [pending, startTransition] = useTransition();
  const [modelVariants, setModelVariants] = useState([]);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<DozenFormInput>({
    resolver: zodResolver(dozenSchema),
    defaultValues: getDefaultDozenFormValues(),
  });

  const fetchVariants = async (brandId: number) => {
    setLoading(true);
    try {
      const { data } = await api.get(
        `catalog/variants/?model_id=${brandId}&no_pagination=true`,
      );
      setModelVariants(data ?? []);
    } catch {
      setModelVariants([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (dozen) {
      reset({
        registered_at: new Date(dozen.registered_at),
        quantity: dozen.quantity,
        model_id: dozen.variant?.model?.id || null,
        variant_id: dozen.variant?.id || null,
        material: dozen.material || "",
        color: dozen.color || "",
        description: dozen.description || "",
        worker_id: dozen.worker_id || dozen.worker?.id || null,
        is_active: dozen.is_active ?? true,
        status: dozen.status || "",
      });
      if (dozen.variant?.model?.id) {
        fetchVariants(dozen.variant.model.id);
      }
    } else {
      reset(getDefaultDozenFormValues());
      setModelVariants([]);
    }
  }, [dozen, reset]);

  const onSubmit = (data: DozenFormData) => {
    startTransition(async () => {
      const result = await saveAction(data);

      if (result && "error" in result) return;

      if (isEditing) {
        navigate("/production/dozens");
        return;
      }

      reset(getDefaultDozenFormValues());
  
      setModelVariants([]);
    });
  };

  const modelIdVal = watch("model_id");
  const variantIdVal = watch("variant_id");
  const materialVal = watch("material");
  const colorVal = watch("color");
  const workerIdVal = watch("worker_id");

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)} className="sf-form mt-4">
        <div className="flex flex-column gap-4 mb-5">
          {/* Fecha y Cantidad */}
          <div className="grid">
            <div className="col-12 md:col-6 flex flex-column gap-1">
              <label className="font-bold">Fecha de Registro</label>
              <Controller
                name="registered_at"
                control={control}
                render={({ field }) => (
                  <Calendar
                    id="registered_at"
                    value={field.value}
                    onChange={(e) => field.onChange(e.value)}
                    showIcon
                    dateFormat="dd/mm/yy"
                    locale="es"
                    autoFocus={false}
                    readOnlyInput
                    touchUI
                    inputStyle={{ boxShadow: "none" }}
                    className="w-full sf-calendar"
                    panelClassName="md:!w-15rem lg:!w-18rem xl:!w-20rem"
                    panelStyle={{ minWidth: "auto" }}
                  />
                )}
              />
              {errors.registered_at && (
                <small className="p-error">{errors.registered_at.message}</small>
              )}
            </div>

            <div className="col-12 md:col-6 flex flex-column gap-1">
              <label className="font-bold">Cantidad</label>
              <Controller
                name="quantity"
                control={control}
                render={({ field }) => (
                  <InputNumber
                    id="quantity"
                    value={field.value}
                    onValueChange={(e) => field.onChange(e.value)}
                    onBlur={() => {
                      const val = field.value;
                      if (val !== undefined && val !== null) {
                        const finalValue = val < 1 ? 0.5 : Math.floor(val);
                        field.onChange(finalValue);
                      }
                    }}
                    min={0.5}
                    max={100}
                    showButtons
                    buttonLayout="horizontal"
                    step={1}
                    minFractionDigits={1}
                    locale="en-US"
                    decrementButtonClassName="p-button-secondary"
                    incrementButtonClassName="p-button-secondary"
                    incrementButtonIcon="pi pi-plus"
                    decrementButtonIcon="pi pi-minus"
                    className="w-full"
                  />
                )}
              />
              {errors.quantity && (
                <small className="p-error">{errors.quantity.message}</small>
              )}
            </div>
          </div>

          {/* Marca / Modelo */}
          <div className="flex flex-column gap-1">
            <label className="font-bold">Modelo</label>
            <div className="sf-chip-scroll">
              {models?.map((model, i) => (
                <CheckRadio
                  key={i}
                  label={model.name}
                  valueCheck={model.id}
                  name="model_id"
                  value={modelIdVal}
                  onChange={(e: any) => {
                    const brandId = Number(e.target.value);
                    setValue("model_id", brandId);
                    setValue("variant_id", null as any);
                    if (brandId) fetchVariants(brandId);
                    else setModelVariants([]);
                  }}
                />
              ))}
            </div>
            {errors.model_id && (
              <small className="p-error">{errors.model_id.message}</small>
            )}
          </div>

          {/* Variantes */}
          {modelVariants.length > 0 && (
            <div className="flex flex-column gap-1">
              <label className="font-bold">Variantes</label>
              {loading ? (
                <i
                  className="pi pi-spin pi-spinner"
                  style={{ color: "var(--clay)" }}
                />
              ) : (
                <div className="sf-chip-scroll">
                  {modelVariants.map((variant) => (
                    <CheckRadio
                      key={variant.id}
                      label={`${variant.size.name} (${variant.size.description})`}
                      valueCheck={variant.id}
                      name="variant_id"
                      value={variantIdVal}
                      onChange={(e: any) =>
                        setValue("variant_id", Number(e.target.value))
                      }
                    />
                  ))}
                </div>
              )}
              {errors.variant_id && (
                <small className="p-error">{errors.variant_id.message}</small>
              )}
            </div>
          )}

          {/* Material */}
          <div className="flex flex-column gap-1">
            <label className="font-bold">Material</label>
            <div className="sf-chip-scroll">
              {metadata?.materials.map((material: any, i: number) => (
                <CheckRadio
                  key={i}
                  label={material.label}
                  valueCheck={material.key}
                  name="material"
                  value={materialVal}
                  onChange={(e: any) => setValue("material", e.target.value)}
                />
              ))}
            </div>
            {errors.material && (
              <small className="p-error">{errors.material.message}</small>
            )}
          </div>

          {/* Color */}
          <div className="flex flex-column gap-1">
            <label className="font-bold">Color</label>
            <div className="sf-chip-scroll">
              {metadata?.colors.map((color: any, i: number) => (
                <CheckRadio
                  key={i}
                  label={color.label}
                  valueCheck={color.key}
                  name="color"
                  value={colorVal}
                  onChange={(e: any) => setValue("color", e.target.value)}
                />
              ))}
            </div>
            {errors.color && (
              <small className="p-error">{errors.color.message}</small>
            )}
          </div>

          {/* Nota Adicional */}
          <div className="flex flex-column gap-1">
            <label className="font-bold">Nota Adicional</label>
            <InputTextarea
              id="description"
              rows={4}
              {...register("description")}
              className="w-full"
            />
            {errors.description && (
              <small className="p-error">{errors.description.message}</small>
            )}
          </div>

          {/* Más Acciones */}
          {groupedByTeamId && teamsChoices && (
            <Accordion className="sf-accordion">
              <AccordionTab header="Más Acciones">
                <div className="flex flex-column gap-1 p-3">
                  <label className="font-bold">Cortador Responsable</label>
                  <div className="sf-chip-scroll">
                    {groupedByTeamId[teamsChoices.CORTADOR]?.members?.map(
                      (worker: any) => (
                        <CheckRadio
                          key={worker.id}
                          label={worker.names}
                          valueCheck={worker.id}
                          value={workerIdVal}
                          name="worker_id"
                          onChange={(e: any) =>
                            setValue("worker_id", Number(e.target.value))
                          }
                        />
                      ),
                    )}
                  </div>
                  {errors.worker_id && (
                    <small className="p-error">
                      {errors.worker_id.message}
                    </small>
                  )}
                </div>
              </AccordionTab>
            </Accordion>
          )}
        </div>

        {/* Botón guardar */}
        <div className="flex justify-content-end mb-5">
          <Button
            type="submit"
            severity="success"
            label={pending ? "Guardando..." : "Guardar"}
            icon="pi pi-check"
            loading={pending}
          />
        </div>
      </form>
    </>
  );
};

export default DozenForm;
