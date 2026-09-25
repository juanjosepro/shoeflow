import { useEffect, useState, useTransition } from 'react'
import CheckRadio from "@/shared/components/CheckRadio";
import { Button } from 'primereact/button'
import { InputNumber } from 'primereact/inputnumber'
import { InputTextarea } from "primereact/inputtextarea";
import { Calendar } from 'primereact/calendar';
import { addLocale, locale } from 'primereact/api';
import { Accordion, AccordionTab } from 'primereact/accordion';
import api from '@/shared/lib/axios';
import { toast } from '@/shared/lib/toast';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { Dozen } from '../types/dozen';

addLocale('es', {
  firstDayOfWeek: 1,
  dayNames: ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'],
  dayNamesShort: ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb'],
  dayNamesMin: ['D', 'L', 'M', 'X', 'J', 'V', 'S'],
  monthNames: ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'],
  monthNamesShort: ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'],
  today: 'Hoy',
  clear: 'Limpiar'
});

locale('es');

const dozenSchema = z.object({
  created_at: z.date({
    required_error: "La fecha de registro es requerida",
  }),
  quantity: z.number({
    required_error: "La cantidad es requerida",
    invalid_type_error: "La cantidad debe ser un número",
  }).refine(val => val === 0.5 || (val > 0 && Number.isInteger(val)), {
    message: "La cantidad debe ser 0.5 o un número entero mayor a 0",
  }),
  model_id: z.number({
    required_error: "El modelo es requerido",
    invalid_type_error: "El modelo es requerido",
  }),
  variant_id: z.number({
    required_error: "La variante es requerida",
    invalid_type_error: "La variante es requerida",
  }),
  material: z.string().min(1, "El material es requerido"),
  color: z.string().min(1, "El color es requerido"),
  description: z.string().optional().default(''),
  worker_id: z.number().nullable().optional(),
  is_active: z.boolean().default(true),
  status: z.string().default('PENDIENTE'),
});

type SchemaType = z.infer<typeof dozenSchema>;

interface DozenFormProps {
  saveAction: (data: any) => Promise<any>;
  groupedByTeamId: any;
  models: any[];
  metadata: any;
  teamsChoices: Record<string, number>;
  dozen?: Dozen | null;
}

const DozenForm = ({ saveAction, groupedByTeamId, models, metadata, teamsChoices, dozen }: DozenFormProps) => {
  const [pending, startTransition] = useTransition();
  const [brandVariants, setBrandVariants] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, control, watch, setValue, reset, formState: { errors } } = useForm<SchemaType>({
    resolver: zodResolver(dozenSchema),
    defaultValues: {
      created_at: new Date(),
      quantity: 1,
      model_id: null as any,
      variant_id: null as any,
      material: '',
      color: '',
      description: '',
      worker_id: null,
      is_active: true,
      status: 'PENDIENTE',
    }
  });

  const fetchVariants = async (brandId: number) => {
    setLoading(true);
    try {
      const { data } = await api.get(`catalog/variants/?model_id=${brandId}&no_pagination=true`);
      setBrandVariants(data ?? []);
    } catch {
      setBrandVariants([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (dozen) {
      const parsedDate = dozen.created_at ? new Date(dozen.created_at) : new Date();
      reset({
        created_at: parsedDate,
        quantity: dozen.quantity,
        model_id: dozen.variant?.model?.id || (null as any),
        variant_id: dozen.variant?.id || (null as any),
        material: dozen.material || '',
        color: dozen.color || '',
        description: dozen.description || '',
        worker_id: dozen.worker_id || dozen.worker?.id || null,
        is_active: dozen.is_active ?? true,
        status: dozen.status || 'PENDIENTE',
      });
      if (dozen.variant?.model?.id) {
        fetchVariants(dozen.variant.model.id);
      }
    } else {
      reset({
        created_at: new Date(),
        quantity: 1,
        model_id: null as any,
        variant_id: null as any,
        material: '',
        color: '',
        description: '',
        worker_id: null,
        is_active: true,
        status: 'PENDIENTE',
      });
      setBrandVariants([]);
    }
  }, [dozen, reset]);

  const onSubmit = (data: any) => {
    startTransition(async () => {
      const result = await saveAction(data);
      if (result && 'error' in result) {
        toast.error("Oops! Hubo un error al guardar la docena. 🥺");
      }
    });
  };

  const modelIdVal = watch("model_id");
  const variantIdVal = watch("variant_id");
  const materialVal = watch("material");
  const colorVal = watch("color");
  const workerIdVal = watch("worker_id");

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)} className="mt-4">
        <div className="flex flex-column gap-4 mb-5">

          {/* Fecha y Cantidad */}
          <div className="grid">
            <div className="col-12 md:col-6 flex flex-column gap-1">
              <label className="font-bold">Fecha de Registro</label>
              <Controller
                name="created_at"
                control={control}
                render={({ field }) => (
                  <Calendar
                    id="created_at"
                    value={field.value}
                    onChange={(e) => field.onChange(e.value)}
                    showIcon
                    dateFormat="dd/mm/yy"
                    locale="es"
                    autoFocus={false}
                    readOnlyInput
                    touchUI
                    inputStyle={{ boxShadow: 'none' }}
                    className="w-full"
                    panelClassName="md:!w-15rem lg:!w-18rem xl:!w-20rem"
                    panelStyle={{ minWidth: 'auto' }}
                  />
                )}
              />
              {errors.created_at && <small className="p-error">{errors.created_at.message}</small>}
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
              {errors.quantity && <small className="p-error">{errors.quantity.message}</small>}
            </div>
          </div>

          {/* Marca / Modelo */}
          <div className="flex flex-column gap-1">
            <label className="font-bold">Modelo</label>
            <div style={{ overflowX: 'auto', padding: '8px 0' }}>
              <div className="flex gap-2">
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
                      else setBrandVariants([]);
                    }}
                  />
                ))}
              </div>
            </div>
            {errors.model_id && <small className="p-error">{errors.model_id.message}</small>}
          </div>

          {/* Variantes */}
          {brandVariants.length > 0 && (
            <div className="flex flex-column gap-1">
              <label className="font-bold">Variantes</label>
              {loading ? (
                <i className="pi pi-spin pi-spinner" />
              ) : (
                <div style={{ overflowX: 'auto', padding: '8px 0' }}>
                  <div className="flex gap-2">
                    {brandVariants.map((variant) => (
                      <CheckRadio
                        key={variant.id}
                        label={`${variant.size.name} (${variant.size.description})`}
                        valueCheck={variant.id}
                        name="variant_id"
                        value={variantIdVal}
                        onChange={(e: any) => setValue("variant_id", Number(e.target.value))}
                      />
                    ))}
                  </div>
                </div>
              )}
              {errors.variant_id && <small className="p-error">{errors.variant_id.message}</small>}
            </div>
          )}

          {/* Material */}
          <div className="flex flex-column gap-1">
            <label className="font-bold">Material</label>
            <div style={{ overflowX: 'auto', padding: '8px 0' }}>
              <div className="flex gap-2">
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
            </div>
            {errors.material && <small className="p-error">{errors.material.message}</small>}
          </div>

          {/* Color */}
          <div className="flex flex-column gap-1">
            <label className="font-bold">Color</label>
            <div style={{ overflowX: 'auto', padding: '8px 0' }}>
              <div className="flex gap-2">
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
            </div>
            {errors.color && <small className="p-error">{errors.color.message}</small>}
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
            {errors.description && <small className="p-error">{errors.description.message}</small>}
          </div>

          {/* Más Acciones */}
          {groupedByTeamId && teamsChoices && (
            <Accordion>
              <AccordionTab header="Más Acciones">
                <div className="flex flex-column gap-1">
                  <label className="font-bold">Cortador Responsable</label>
                  <div style={{ overflowX: 'auto', padding: '8px 0' }}>
                    <div className="flex gap-2">
                      {
                        groupedByTeamId[teamsChoices.CORTADOR]?.members?.map((worker: any) => (
                          <CheckRadio
                            key={worker.id}
                            label={worker.names}
                            valueCheck={worker.id}
                            value={workerIdVal}
                            name="worker_id"
                            onChange={(e: any) => setValue("worker_id", Number(e.target.value))}
                          />
                        ))
                      }
                    </div>
                  </div>
                  {errors.worker_id && <small className="p-error">{errors.worker_id.message}</small>}
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
            label={pending ? 'Guardando...' : 'Guardar'}
            icon="pi pi-check"
            loading={pending}
          />
        </div>
      </form>
    </>
  );
};

export default DozenForm;