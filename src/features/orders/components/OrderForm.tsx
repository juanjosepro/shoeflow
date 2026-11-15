// [PED] ARCHIVO NUEVO ─ features/orders/components/OrderForm.tsx
import { useMemo, useState } from "react";
import { Button } from "primereact/button";
import { Calendar } from "primereact/calendar";
import { InputTextarea } from "primereact/inputtextarea";
import { SelectButton } from "primereact/selectbutton";
import {
  Controller,
  FormProvider,
  useFieldArray,
  useForm,
  useWatch,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import dayjs from "@/shared/lib/dayjs";
import { toast } from "@/shared/lib/toast";
import type {
  CatalogOptions,
  DozenMetadata,
} from "@/features/dozens/types/dozen";
import type { Model } from "@/features/models/types/model";
import CustomerSelect from "@/features/customers/components/CustomerSelect";
import {
  getDefaultOrderValues,
  getEmptyLine,
  orderSchema,
  type OrderFormInput,
  type OrderFormValues,
} from "../schemas/orderSchema";
import type { Order, OrderLinePayload, OrderPayload } from "../types/order";
import OrderLineCard from "./OrderLineCard";
import "./orders.css";

interface Props {
  models: Model[];
  options: CatalogOptions;
  metadata: DozenMetadata;
  // "create" = pedido nuevo | "add" = agregar docenas a un pedido existente (cliente y fechas ya definidos)
  mode: "create" | "add";
  order?: Order | null; // solo en modo "add"
  presetCustomerId?: number | null; // viene de "Nuevo pedido" en la tabla de clientes
  onSave: (payload: OrderPayload) => Promise<Order>;
}

const toLinePayload = (
  l: OrderFormValues["lines"][number],
): OrderLinePayload => ({
  model_id: l.model_id as number,
  size_id: l.size_id as number,
  material_type_id: l.material_type_id as number,
  color_id: l.color_id as number,
  plant_type_id: l.plant_type_id ?? null,
  pairs: l.pairs,
  size_run: l.size_run && Object.keys(l.size_run).length ? l.size_run : null,
  count: l.count,
  description: l.description ?? "",
});

// Texto del primer error que devuelve el backend
const serverMessage = (error: unknown): string => {
  const data = (error as { response?: { data?: unknown } })?.response?.data;
  if (data && typeof data === "object") {
    const first = Object.values(data as Record<string, unknown>)[0];
    const msg = Array.isArray(first) ? first[0] : first;
    if (typeof msg === "string") return msg;
    if (msg && typeof msg === "object") return JSON.stringify(msg);
  }
  return "No se pudo guardar el pedido.";
};

const OrderForm = ({
  models,
  options,
  metadata,
  mode,
  order,
  presetCustomerId = null,
  onSave,
}: Props) => {
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const isAdd = mode === "add";

  const methods = useForm<OrderFormInput>({
    resolver: zodResolver(orderSchema),
    defaultValues: getDefaultOrderValues(
      isAdd ? (order?.customer.id ?? null) : presetCustomerId,
    ),
  });
  const {
    control,
    handleSubmit,
    getValues,
    formState: { errors },
  } = methods;
  const { fields, append, insert, remove } = useFieldArray({
    control,
    name: "lines",
  });

  const lines = useWatch({ control, name: "lines" }) ?? [];
  const dueDate = useWatch({ control, name: "due_date" });
  const orderedAt = useWatch({ control, name: "ordered_at" });
  const priority = useWatch({ control, name: "priority" });

  // Totales en vivo
  const totals = useMemo(() => {
    const dozens = lines.reduce((s, l) => s + (l?.count || 0), 0);
    const pairs = lines.reduce(
      (s, l) => s + (l?.count || 0) * (l?.pairs || 0),
      0,
    );
    return { dozens, pairs, lines: lines.length };
  }, [lines]);

  // Nueva línea = copia de la última sin talla (casi siempre cambia solo la talla)
  const addLine = () => {
    const last = getValues("lines").at(-1);
    append(
      getEmptyLine(
        last
          ? { ...last, size_id: null, size_run: null, description: "" }
          : undefined,
      ),
    );
  };

  // Duplicar = copia exacta justo debajo
  const duplicateLine = (index: number) => {
    const src = getValues(`lines.${index}`);
    insert(index + 1, {
      ...src,
      size_run: src.size_run ? { ...src.size_run } : null,
    });
  };

  const submit = async (values: OrderFormInput) => {
    const v = values as OrderFormValues;
    setSaving(true);
    try {
      const saved = await onSave({
        customer_id: v.customer_id as number,
        ordered_at: dayjs(v.ordered_at).format("YYYY-MM-DD"),
        due_date: v.due_date ? dayjs(v.due_date).format("YYYY-MM-DD") : null,
        priority: v.priority,
        notes: v.notes ?? "",
        lines: v.lines.map(toLinePayload),
      });
      toast.success(
        isAdd ? "Docenas agregadas al pedido." : `Pedido ${saved.code} creado.`,
      );
      navigate("/production/orders");
    } catch (error) {
      toast.error(serverMessage(error));
    } finally {
      setSaving(false);
    }
  };

  const saveLabel = saving
    ? "Guardando..."
    : isAdd
      ? "Agregar docenas"
      : "Crear pedido";

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(submit)} className="sf-form sfo mt-3">
        <div className="sfo-layout">
          <div className="flex flex-column gap-3">
            {/* ── 1. Datos del pedido ── */}
            {isAdd ? (
              <div className="sfo-section">
                <h3 className="sfo-section-title">
                  <i className="pi pi-inbox" /> Pedido {order?.code}
                </h3>
                <div className="font-bold">{order?.customer.name}</div>
                <small style={{ color: "var(--ink-2)" }}>
                  Las docenas nuevas se suman a este pedido con su mismo
                  cliente, prioridad y entrega.
                </small>
              </div>
            ) : (
              <div className="sfo-section">
                <h3 className="sfo-section-title">
                  <i className="pi pi-user" /> 1 · Cliente y entrega
                </h3>
                <div className="grid">
                  <div className="col-12 md:col-6 flex flex-column gap-1">
                    <label className="font-bold" htmlFor="o-customer">
                      Cliente *
                    </label>
                    <Controller
                      name="customer_id"
                      control={control}
                      render={({ field }) => (
                        <CustomerSelect
                          id="o-customer"
                          value={field.value}
                          onChange={field.onChange}
                          invalid={!!errors.customer_id}
                        />
                      )}
                    />
                    {errors.customer_id && (
                      <small className="p-error">
                        {errors.customer_id.message}
                      </small>
                    )}
                  </div>

                  <div className="col-12 md:col-6 flex flex-column gap-1">
                    <label className="font-bold">Prioridad</label>
                    <Controller
                      name="priority"
                      control={control}
                      render={({ field }) => (
                        <SelectButton
                          value={field.value}
                          options={(metadata?.priorities ?? []).map((p) => ({
                            label: p.label,
                            value: p.key,
                          }))}
                          allowEmpty={false}
                          onChange={(e) => field.onChange(e.value)}
                        />
                      )}
                    />
                  </div>

                  <div className="col-6 md:col-6 flex flex-column gap-1">
                    <label className="font-bold">Fecha del pedido</label>
                    <Controller
                      name="ordered_at"
                      control={control}
                      render={({ field }) => (
                        <Calendar
                          value={field.value}
                          onChange={(e) => field.onChange(e.value)}
                          showIcon
                          dateFormat="dd/mm/yy"
                          locale="es"
                          readOnlyInput
                          touchUI
                          inputStyle={{ boxShadow: "none" }}
                          className="w-full sf-calendar"
                          panelClassName="md:!w-15rem lg:!w-18rem xl:!w-20rem"
                          panelStyle={{ minWidth: "auto" }}
                        />
                      )}
                    />
                    {errors.ordered_at && (
                      <small className="p-error">
                        {errors.ordered_at.message}
                      </small>
                    )}
                  </div>

                  <div className="col-6 md:col-6 flex flex-column gap-1">
                    <label className="font-bold">Entrega prometida</label>
                    <Controller
                      name="due_date"
                      control={control}
                      render={({ field }) => (
                        <Calendar
                          value={field.value ?? null}
                          onChange={(e) => field.onChange(e.value ?? null)}
                          minDate={orderedAt}
                          showIcon
                          showButtonBar
                          dateFormat="dd/mm/yy"
                          locale="es"
                          readOnlyInput
                          touchUI
                          placeholder="Opcional"
                          inputStyle={{ boxShadow: "none" }}
                          className="w-full sf-calendar"
                          panelClassName="md:!w-15rem lg:!w-18rem xl:!w-20rem"
                          panelStyle={{ minWidth: "auto" }}
                        />
                      )}
                    />
                    {errors.due_date && (
                      <small className="p-error">
                        {errors.due_date.message}
                      </small>
                    )}
                  </div>

                  <div className="col-12 flex flex-column gap-1">
                    <label className="font-bold">
                      Notas del pedido{" "}
                      <span style={{ fontWeight: 400, color: "var(--ink-2)" }}>
                        (opcional)
                      </span>
                    </label>
                    <Controller
                      name="notes"
                      control={control}
                      render={({ field }) => (
                        <InputTextarea
                          rows={2}
                          autoResize
                          value={field.value ?? ""}
                          onChange={field.onChange}
                          className="w-full"
                          placeholder="Ej. entregar en tienda, pago contra entrega"
                        />
                      )}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* ── 2. Líneas ── */}
            <div className="sfo-section">
              <h3 className="sfo-section-title">
                <i className="pi pi-box" />{" "}
                {isAdd ? "Docenas a agregar" : "2 · Qué se va a fabricar"}
              </h3>
              <div className="flex flex-column gap-3">
                {fields.map((f, index) => (
                  <OrderLineCard
                    key={f.id}
                    index={index}
                    models={models}
                    options={options}
                    canRemove={fields.length > 1}
                    onRemove={() => remove(index)}
                    onDuplicate={() => duplicateLine(index)}
                  />
                ))}
                {errors.lines?.message && (
                  <small className="p-error">{errors.lines.message}</small>
                )}
                <Button
                  type="button"
                  label="Agregar otra línea"
                  icon="pi pi-plus"
                  outlined
                  severity="secondary"
                  onClick={addLine}
                  className="align-self-start"
                />
              </div>
            </div>
          </div>

          {/* ── Resumen (escritorio) ── */}
          <aside className="sfo-section sfo-summary">
            <h3 className="sfo-section-title">
              <i className="pi pi-receipt" /> Resumen
            </h3>
            <div className="sfo-big">{totals.dozens}</div>
            <div className="mb-3" style={{ color: "var(--ink-2)" }}>
              {totals.dozens === 1 ? "docena" : "docenas"} · {totals.pairs}{" "}
              pares
            </div>
            <div className="sfo-summary-row">
              <span>Líneas</span>
              <b>{totals.lines}</b>
            </div>
            {!isAdd && (
              <>
                <div className="sfo-summary-row">
                  <span>Prioridad</span>
                  <b>{priority}</b>
                </div>
                <div className="sfo-summary-row">
                  <span>Entrega</span>
                  <b>
                    {dueDate
                      ? dayjs(dueDate).format("D MMM YYYY")
                      : "Sin fecha"}
                  </b>
                </div>
              </>
            )}
            <div className="flex flex-column gap-2 mt-3">
              <Button
                type="submit"
                severity="success"
                label={saveLabel}
                icon="pi pi-check"
                loading={saving}
              />
              <Button
                type="button"
                label="Cancelar"
                outlined
                severity="secondary"
                onClick={() => navigate("/production/orders")}
              />
            </div>
          </aside>
        </div>

        {/* ── Barra inferior (celular / tablet) ── */}
        <div className="sfo-mobilebar">
          <div>
            <div className="font-bold">
              {totals.dozens} {totals.dozens === 1 ? "docena" : "docenas"}
            </div>
            <small style={{ color: "var(--ink-2)" }}>
              {totals.pairs} pares · {totals.lines}{" "}
              {totals.lines === 1 ? "línea" : "líneas"}
            </small>
          </div>
          <Button
            type="submit"
            severity="success"
            label={saveLabel}
            icon="pi pi-check"
            loading={saving}
          />
        </div>
      </form>
    </FormProvider>
  );
};

export default OrderForm;
