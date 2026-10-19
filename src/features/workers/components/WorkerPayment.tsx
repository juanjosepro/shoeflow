import { useEffect, useRef, useState } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { Calendar } from "primereact/calendar";
import { Dropdown } from "primereact/dropdown";
import { InputNumber } from "primereact/inputnumber";
import { InputText } from "primereact/inputtext";
import { InputTextarea } from "primereact/inputtextarea";
import { Column } from "primereact/column";
import { DataTable } from "primereact/datatable";
import { toast } from "@/shared/lib/toast";
import dayjs from "@/shared/lib/dayjs";
import { paymentService } from "../services/paymentService";
import { formatDay, formatMoney, getApiError } from "../utils/format";
import type { Worker } from "../types/worker";
import type {
  AdjustmentPayload,
  PaymentPreview,
  PendingWeek,
} from "../types/payment";
import type { DozenAssignment } from "@/features/dozens/types/dozen";
import { Divider } from "primereact/divider";

interface Props {
  visible: boolean;
  onHide: () => void;
  worker: Worker | null;
  onPaid?: () => void;
}

const ADJUSTMENT_OPTIONS = [
  { label: "Bono (suma)", value: "BONO" },
  { label: "Descuento (resta)", value: "DESCUENTO" },
  { label: "Adelanto (resta)", value: "ADELANTO" },
];

const DATE_FORMAT = "YYYY-MM-DD";

// Semana de pago: lunes a domingo (la misma que usa el historial)
const weekFrom = (monday: ReturnType<typeof dayjs>): Date[] => [
  monday.toDate(),
  monday.add(6, "day").toDate(),
];

const mondayOf = (date: ReturnType<typeof dayjs>) =>
  date.subtract((date.day() + 6) % 7, "day").startOf("day");

const currentWeek = (): Date[] => weekFrom(mondayOf(dayjs()));

const formatWeek = (start: string, end: string) => {
  const from = dayjs(start);
  const to = dayjs(end);
  return from.month() === to.month()
    ? `${from.format("D")}–${to.format("D MMM")}`
    : `${from.format("D MMM")} – ${to.format("D MMM")}`;
};

// Opción del selector: una semana con lo que hay pendiente en ella
interface WeekOption {
  value: string; // lunes, YYYY-MM-DD
  label: string;
  isCurrent: boolean;
}

const emptyAdjustment = {
  type: "BONO" as AdjustmentPayload["type"],
  amount: null as number | null,
  reason: "",
};

const WorkerPayment = ({ visible, onHide, worker, onPaid }: Props) => {
  const [range, setRange] = useState<(Date | null)[]>(currentWeek);
  const [preview, setPreview] = useState<PaymentPreview | null>(null);
  const [loading, setLoading] = useState(false);
  const [pendingWeeks, setPendingWeeks] = useState<PendingWeek[]>([]);
  const [reloadKey, setReloadKey] = useState(0);

  // Etapas marcadas para pagar (todas por defecto)
  const [selected, setSelected] = useState<DozenAssignment[]>([]);
  const selectionKey = useRef("");

  // Monto que escribió el administrador. Se descarta solo cuando cambia el total
  // (otra selección, otro rango, un ajuste nuevo): ahí vuelve a valer el total.
  const [custom, setCustom] = useState<{
    total: number;
    value: number | null;
  } | null>(null);
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);

  const [adjustment, setAdjustment] = useState(emptyAdjustment);
  const [savingAdjustment, setSavingAdjustment] = useState(false);

  const workerId = worker?.id;
  const [start, end] = range;
  const startKey = start ? dayjs(start).format(DATE_FORMAT) : null;
  const endKey = end ? dayjs(end).format(DATE_FORMAT) : null;

  // Al abrir con otro trabajador: semana actual y formulario limpio
  useEffect(() => {
    if (!visible) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setRange(currentWeek());
    setNote("");
    setAdjustment(emptyAdjustment);
    setPreview(null);
  }, [visible, workerId]);

  // Semanas en las que este trabajador tiene algo sin pagar
  useEffect(() => {
    if (!visible || workerId == null) return;

    let ignore = false;

    const load = async () => {
      try {
        const weeks = await paymentService.getPendingWeeks(workerId);
        if (!ignore) setPendingWeeks(weeks);
      } catch {
        if (!ignore) setPendingWeeks([]);
      }
    };

    load();
    return () => {
      ignore = true;
    };
  }, [visible, workerId]);

  // Pedir la vista previa cuando hay trabajador y rango completo
  useEffect(() => {
    if (!visible || workerId == null || !startKey || !endKey) return;

    let ignore = false;

    const load = async () => {
      setLoading(true);
      try {
        const data = await paymentService.preview(workerId, startKey, endKey);
        if (ignore) return;
        setPreview(data);
        // Otro trabajador o rango: se marcan todas. Si solo se agregó un ajuste, se respeta la selección.
        const key = `${workerId}|${startKey}|${endKey}`;
        if (selectionKey.current !== key) {
          selectionKey.current = key;
          setSelected(data.items);
        } else {
          setSelected((prev) =>
            data.items.filter((item) => prev.some((p) => p.id === item.id)),
          );
        }
      } catch (error) {
        if (!ignore)
          toast.error(getApiError(error, "No se pudo calcular el pago."));
      } finally {
        if (!ignore) setLoading(false);
      }
    };

    load();
    return () => {
      ignore = true;
    };
  }, [visible, workerId, startKey, endKey, reloadKey]);

  // Totales según lo marcado (los ajustes pendientes entran siempre)
  const earned = selected.reduce((sum, item) => sum + Number(item.amount), 0);
  const adjustmentsTotal = Number(preview?.total_adjustments ?? 0);
  const totalToPay = earned + adjustmentsTotal;

  // Opciones del selector: la semana actual (siempre) + las semanas con pendientes
  const currentMonday = dayjs(currentWeek()[0]).format(DATE_FORMAT);
  const weekOptions: WeekOption[] = (() => {
    const options: WeekOption[] = pendingWeeks.map((week) => ({
      value: week.start_date,
      label: `${formatWeek(week.start_date, week.end_date)} · ${week.count} ${
        week.count === 1 ? "etapa" : "etapas"
      } · ${formatMoney(week.amount)}${week.start_date === currentMonday ? " · esta semana" : ""}`,
      isCurrent: week.start_date === currentMonday,
    }));
    if (!options.some((option) => option.isCurrent)) {
      const monday = dayjs(currentMonday);
      options.unshift({
        value: currentMonday,
        label: `${formatWeek(currentMonday, monday.add(6, "day").format(DATE_FORMAT))} · esta semana`,
        isCurrent: true,
      });
    }
    return options.sort((a, b) => b.value.localeCompare(a.value));
  })();

  // El selector marca la semana solo si el rango elegido es exactamente lunes-domingo
  const selectedWeek =
    startKey &&
    endKey &&
    dayjs(startKey).add(6, "day").format(DATE_FORMAT) === endKey &&
    dayjs(startKey).day() === 1
      ? startKey
      : null;
  const olderPending = pendingWeeks.filter(
    (week) => week.start_date < currentMonday,
  ).length;
  const isPartial = !!preview && selected.length < preview.items.length;

  // El monto entregado se calcula al renderizar (sin efectos), así nunca queda en 0 por timing
  const defaultAmount = Math.max(totalToPay, 0);
  const amountPaid =
    custom && custom.total === totalToPay ? custom.value : defaultAmount;

  const paid = isPartial ? defaultAmount : (amountPaid ?? 0);
  const pendingBalance = totalToPay - paid;
  const hasContent =
    !!preview && (selected.length > 0 || preview.adjustments.length > 0);

  const invalidReason = !hasContent
    ? "No hay nada pendiente en este periodo."
    : totalToPay < 0
      ? "Los descuentos superan lo ganado."
      : !isPartial && amountPaid == null
        ? "Indica el monto entregado."
        : paid > totalToPay
          ? "El monto entregado supera el total a pagar."
          : null;

  const handlePay = async () => {
    if (!worker || !startKey || !endKey || invalidReason) return;

    setSaving(true);
    try {
      await paymentService.create({
        worker: worker.id,
        start_date: startKey,
        end_date: endKey,
        assignment_ids: selected.map((item) => item.id),
        // Con selección parcial el backend paga el total exacto
        amount_paid: isPartial ? undefined : paid,
        description: note.trim() || undefined,
      });
      toast.success(
        isPartial
          ? `Pago registrado. ${preview!.items.length - selected.length} etapa(s) siguen pendientes.`
          : pendingBalance > 0
            ? `Pago registrado. Quedan ${formatMoney(pendingBalance)} pendientes para la próxima semana.`
            : "Pago registrado",
      );
      onPaid?.();
      onHide();
    } catch (error) {
      toast.error(getApiError(error, "No se pudo registrar el pago."));
    } finally {
      setSaving(false);
    }
  };

  const handleAddAdjustment = async () => {
    if (!worker || !adjustment.amount || adjustment.amount <= 0) {
      toast.error("Indica un monto mayor a 0.");
      return;
    }
    setSavingAdjustment(true);
    try {
      await paymentService.createAdjustment({
        worker: worker.id,
        type: adjustment.type,
        amount: adjustment.amount,
        reason: adjustment.reason.trim(),
      });
      setAdjustment(emptyAdjustment);
      setReloadKey((key) => key + 1);
    } catch (error) {
      toast.error(getApiError(error, "No se pudo agregar el ajuste."));
    } finally {
      setSavingAdjustment(false);
    }
  };

  const handleDeleteAdjustment = async (id: number) => {
    try {
      await paymentService.deleteAdjustment(id);
      setReloadKey((key) => key + 1);
    } catch (error) {
      toast.error(getApiError(error, "No se pudo eliminar el ajuste."));
    }
  };

  const footer = (
    <div className="flex justify-content-end gap-2">
      <Button
        label="Cancelar"
        icon="pi pi-times"
        severity="secondary"
        outlined
        onClick={onHide}
        disabled={saving}
      />
      <Button
        label={saving ? "Registrando..." : `Pagar ${formatMoney(paid)}`}
        icon="pi pi-wallet"
        severity="success"
        loading={saving}
        disabled={!!invalidReason || loading}
        tooltip={invalidReason ?? undefined}
        tooltipOptions={{ showOnDisabled: true, position: "top" }}
        onClick={handlePay}
      />
    </div>
  );

  return (
    <Dialog
      visible={visible}
      onHide={() => {
        if (!saving) onHide();
      }}
      header={`Pagar a ${worker?.names ?? ""}`}
      footer={footer}
      className="sf-dialog"
      style={{ width: "55vw" }}
      breakpoints={{ "960px": "80vw", "641px": "95vw" }}
      maskStyle={{ backdropFilter: "blur(4px)" }}
    >
      <div className="flex flex-column gap-4 pt-2">
        {/* Semana */}
        <div className="flex flex-column gap-2">
          <label className="font-bold">Semana a pagar</label>
          <div className="flex flex-wrap align-items-center gap-2">
            <Dropdown
              value={selectedWeek}
              options={weekOptions}
              onChange={(e) => setRange(weekFrom(dayjs(e.value)))}
              placeholder="Otro rango"
              className="w-full md:w-auto"
              style={{ minWidth: "22rem" }}
            />
            <Calendar
              value={range as Date[]}
              onChange={(e) => setRange((e.value as Date[]) ?? [])}
              selectionMode="range"
              readOnlyInput
              dateFormat="dd/mm/yy"
              showIcon
              placeholder="Selecciona el rango"
            />
          </div>
          {olderPending > 0 && (
            <small style={{ color: "var(--orange-600)" }}>
              <i className="pi pi-exclamation-triangle mr-1" />
              Tiene etapas sin pagar de {olderPending}{" "}
              {olderPending === 1 ? "semana anterior" : "semanas anteriores"}.
            </small>
          )}
          <small className="text-color-secondary">
            Semana de lunes a domingo. Se pagan las etapas terminadas en ese
            rango que aún no se hayan pagado.
          </small>
        </div>

        {loading && !preview ? (
          <div className="flex justify-content-center py-5">
            <i className="pi pi-spin pi-spinner" style={{ fontSize: "2rem" }} />
          </div>
        ) : (
          preview && (
            <>
              {/* Etapas del periodo */}
              <DataTable
                value={preview.items}
                selection={selected}
                onSelectionChange={(e) =>
                  setSelected(e.value as DozenAssignment[])
                }
                selectionMode="checkbox"
                dataKey="id"
                loading={loading}
                size="small"
                className="sf-table"
                emptyMessage="No hay etapas pendientes de pago en este periodo."
              >
                <Column
                  selectionMode="multiple"
                  headerStyle={{ width: "3rem" }}
                />
                <Column field="dozen_code" header="Docena" />
                <Column header="Etapa" body={(row) => row.specialty.name} />
                <Column
                  header="Terminada"
                  body={(row) => formatDay(row.completed_at)}
                />
                <Column
                  header="Precio docena"
                  body={(row) => formatMoney(row.unit_price)}
                />
                <Column
                  header="Monto"
                  body={(row) => <strong>{formatMoney(row.amount)}</strong>}
                />
              </DataTable>

              <Divider className="m-1" />

              {/* Ajustes pendientes (entran todos, sin importar la fecha) */}
              <div className="flex flex-column gap-2">
                <label className="font-bold">
                  Bonos, descuentos y adelantos pendientes
                </label>

                {preview.adjustments.length === 0 && (
                  <small className="text-color-secondary">
                    No hay ajustes pendientes.
                  </small>
                )}

                {preview.adjustments.map((a) => {
                  const negative = Number(a.signed_amount) < 0;
                  return (
                    <div
                      key={a.id}
                      className="flex align-items-center justify-content-between gap-2"
                    >
                      <div className="flex flex-column">
                        <span>{a.type_label}</span>
                        {a.reason && (
                          <small className="text-color-secondary">
                            {a.reason}
                          </small>
                        )}
                      </div>
                      <div className="flex align-items-center gap-2">
                        <strong
                          style={{
                            color: negative
                              ? "var(--red-500)"
                              : "var(--green-600)",
                          }}
                        >
                          {negative ? "-" : "+"} {formatMoney(a.amount)}
                        </strong>
                        {/* El saldo anterior lo genera el sistema: no se borra a mano */}
                        {a.type !== "SALDO" && (
                          <Button
                            icon="pi pi-trash"
                            rounded
                            text
                            severity="danger"
                            size="small"
                            onClick={() => handleDeleteAdjustment(a.id)}
                          />
                        )}
                      </div>
                    </div>
                  );
                })}

                <div className="flex justify-content-center align-items-start gap-2">
                  <div className="grid mt-1 w-full">
                    <div className="col-6 md:col-6">
                      <Dropdown
                        value={adjustment.type}
                        options={ADJUSTMENT_OPTIONS}
                        onChange={(e) =>
                          setAdjustment((prev) => ({ ...prev, type: e.value }))
                        }
                        className="w-full"
                      />
                    </div>
                    <div className="col-6 md:col-6">
                      <InputNumber
                        value={adjustment.amount}
                        onValueChange={(e) =>
                          setAdjustment((prev) => ({
                            ...prev,
                            amount: e.value ?? null,
                          }))
                        }
                        mode="currency"
                        currency="PEN"
                        locale="es-PE"
                        min={0}
                        placeholder="Monto"
                        className="w-full"
                      />
                    </div>
                    <div className="col-12 md:col-12">
                      <InputTextarea
                        value={adjustment.reason}
                        onChange={(e) =>
                          setAdjustment((prev) => ({
                            ...prev,
                            reason: e.target.value,
                          }))
                        }
                        placeholder="Motivo"
                        className="w-full"
                        rows={2}
                      />
                    </div>
                  </div>
                  <div style={{ marginTop: "12px" }}>
                    <Button
                      label="Agregar"
                      icon="pi pi-plus"
                      outlined
                      className="w-full"
                      size="small"
                      style={{
                        borderColor: "var(--sf-moss)",
                        color: "var(--sf-moss)",
                      }}
                      loading={savingAdjustment}
                      onClick={handleAddAdjustment}
                    />
                  </div>
                </div>
              </div>

              <Divider className="m-1" />

              {/* Totales */}
              <div className="w-full">
                <table className="border-collapse" style={{ float: "right" }}>
                  <thead>
                    <tr>
                      <th className="text-left p-2">Concepto</th>
                      <th className="text-right p-2">Importe</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="p-2">
                        Total ganado ({selected.length} de{" "}
                        {preview.items.length} etapas)
                      </td>
                      <td className="text-right p-2">{formatMoney(earned)}</td>
                    </tr>
                    <tr>
                      <td className="p-2">Ajustes</td>
                      <td className="text-right p-2">
                        {formatMoney(adjustmentsTotal)}
                      </td>
                    </tr>
                    <tr className="surface-100 text-xl">
                      <td className="p-2 font-bold">Total a pagar</td>
                      <td className="text-right p-2 font-bold">
                        {formatMoney(totalToPay)}
                      </td>
                    </tr>
                    <tr className="surface-100 text-xl">
                      <td colSpan={2} className="p-2">
                        <div className="flex flex-column gap-1">
                          <label className="font-bold">Monto entregado</label>
                          <InputNumber
                            value={isPartial ? defaultAmount : amountPaid}
                            disabled={isPartial}
                            onValueChange={(e) =>
                              setCustom({
                                total: totalToPay,
                                value: e.value ?? null,
                              })
                            }
                            mode="currency"
                            currency="PEN"
                            locale="es-PE"
                            min={0}
                            max={Math.max(totalToPay, 0)}
                            className="w-full"
                          />
                          {isPartial && (
                            <small className="text-color-secondary">
                              Al pagar solo algunas etapas se entrega el total
                              exacto. Las demás siguen pendientes.
                            </small>
                          )}
                          {!isPartial && pendingBalance > 0 && (
                            <small style={{ color: "var(--orange-600)" }}>
                              Quedan {formatMoney(pendingBalance)} pendientes:
                              se sumarán al próximo pago.
                            </small>
                          )}
                        </div>
                      </td>
                    </tr>
                    <tr className="surface-100 text-xl">
                      <td colSpan={2} className="p-2">
                        <div className="flex flex-column gap-1">
                          <label className="font-bold">Nota (opcional)</label>
                          <InputTextarea
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            rows={3}
                            autoResize
                          />
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Lo que realmente se entrega */}
              {/* <div className="grid">
                <div className="col-12 md:col-5 flex flex-column gap-1">
                  <label className="font-bold">Monto entregado</label>
                  <InputNumber
                    value={isPartial ? defaultAmount : amountPaid}
                    disabled={isPartial}
                    onValueChange={(e) =>
                      setCustom({ total: totalToPay, value: e.value ?? null })
                    }
                    mode="currency"
                    currency="PEN"
                    locale="es-PE"
                    min={0}
                    max={Math.max(totalToPay, 0)}
                    className="w-full"
                  />
                  {isPartial && (
                    <small className="text-color-secondary">
                      Al pagar solo algunas etapas se entrega el total exacto.
                      Las demás siguen pendientes.
                    </small>
                  )}
                  {!isPartial && pendingBalance > 0 && (
                    <small style={{ color: "var(--orange-600)" }}>
                      Quedan {formatMoney(pendingBalance)} pendientes: se
                      sumarán al próximo pago.
                    </small>
                  )}
                </div>
                <div className="col-12 md:col-7 flex flex-column gap-1">
                  <label className="font-bold">Nota (opcional)</label>
                  <InputTextarea
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    rows={2}
                    autoResize
                  />
                </div>
              </div> */}
            </>
          )
        )}
      </div>
    </Dialog>
  );
};

export default WorkerPayment;
