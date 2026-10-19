import { useEffect, useState } from "react";
import { Dialog } from "primereact/dialog";
import { Dropdown } from "primereact/dropdown";
import { Button } from "primereact/button";
import { Calendar } from "primereact/calendar";
import { InputTextarea } from "primereact/inputtextarea";
import { toast } from "@/shared/lib/toast";
import dayjs from "@/shared/lib/dayjs";
import { dozenService } from "../services/dozenService";
import type { AssignStagesPayload, Dozen, StageRow } from "../types/dozen";

interface RowState {
  stage: StageRow; // etapa + trabajadores disponibles + precios que calculó el backend
  workerId: number | null;
  deliveredAt: Date;
  completedAt: Date;
  note: string;
  showMore: boolean;
}

interface Props {
  visible: boolean;
  onHide: () => void;
  dozen: Dozen | null;
  onConfirm: (payload: AssignStagesPayload) => Promise<void>;
}

const formatMoney = (value?: string | number | null) =>
  value == null ? "—" : `S/ ${Number(value).toFixed(2)}`;

const formatDay = (value: string) => dayjs(value).format("D MMM YYYY");

// El backend responde { assignments: [mensajes] } o { detail: mensaje }
const getErrorMessage = (error: any) => {
  const data = error?.response?.data;
  if (Array.isArray(data?.assignments)) return data.assignments.join(" ");
  if (typeof data?.detail === "string") return data.detail;
  return "Error al realizar la asignación masiva.";
};

const BulkAssignDozenDialog = ({
  visible,
  onHide,
  dozen,
  onConfirm,
}: Props) => {
  const [rows, setRows] = useState<RowState[]>([]);
  const [loadingRows, setLoadingRows] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const dozenId = dozen?.id;

  // Cada vez que se abre: pedir al backend las etapas activas con sus trabajadores y precios
  useEffect(() => {
    if (!visible || dozenId == null) return;

    let ignore = false;

    const load = async () => {
      setLoadingRows(true);
      try {
        const stages = await dozenService.getStageOptions(dozenId);
        if (ignore) return;
        setRows(
          stages.map((stage) => ({
            stage,
            workerId: null,
            deliveredAt: new Date(),
            completedAt: new Date(),
            note: "",
            showMore: false,
          })),
        );
      } catch {
        if (ignore) return;
        setRows([]);
        toast.error("No se pudieron cargar las etapas de la docena.");
      } finally {
        if (!ignore) setLoadingRows(false);
      }
    };
    load();

    return () => {
      ignore = true;
    };
  }, [visible, dozenId]);

  const isAssigned = (row: RowState) => row.stage.assignment !== null;
  const isFilled = (row: RowState) => isAssigned(row) || row.workerId != null;

  // Una fila se habilita cuando la anterior ya tiene trabajador (o ya estaba asignada).
  // Si no tiene tarifa o ya fue asignada, no se puede editar.
  const isRowEnabled = (index: number) => {
    const row = rows[index];
    if (isAssigned(row) || row.stage.missing_rate) return false;
    return index === 0 || isFilled(rows[index - 1]);
  };

  const updateRow = (index: number, patch: Partial<RowState>) => {
    setRows((prev) =>
      prev.map((row, i) => (i === index ? { ...row, ...patch } : row)),
    );
  };

  const handleSelectWorker = (index: number, workerId: number | null) => {
    setRows((prev) =>
      prev.map((row, i) => {
        if (i === index) return { ...row, workerId };
        // Si se borra una fila, las siguientes sin asignar se limpian y se vuelven a bloquear
        if (i > index && workerId == null && !isAssigned(row)) {
          return { ...row, workerId: null };
        }
        return row;
      }),
    );
  };

  // Trabajador elegido en una fila (con el precio que calculó el backend)
  const selectedWorker = (row: RowState) =>
    row.stage.workers.find((w) => w.id === row.workerId);

  const selectedRows = rows.filter(
    (row) => !isAssigned(row) && row.workerId != null,
  );

  const totalToRegister = selectedRows.reduce(
    (sum, row) => sum + Number(selectedWorker(row)?.amount ?? 0),
    0,
  );

  const handleSubmit = async () => {
    if (selectedRows.length === 0) {
      toast.error("Selecciona al menos un trabajador para asignar.");
      return;
    }

    const invalid = selectedRows.find(
      (row) => row.deliveredAt > row.completedAt,
    );
    if (invalid) {
      toast.error(
        `${invalid.stage.specialty.name}: la fecha de entrega no puede ser posterior a la de término.`,
      );
      return;
    }

    setIsSubmitting(true);
    try {
      await onConfirm({
        assignments: selectedRows.map((row) => ({
          specialty: row.stage.specialty.id,
          worker: row.workerId as number,
          delivered_at: dayjs(row.deliveredAt).format("YYYY-MM-DD"),
          completed_at: dayjs(row.completedAt).format("YYYY-MM-DD"),
          description: row.note || undefined,
        })),
      });
      toast.success("¡Asignación masiva realizada exitosamente!");
      onHide();
    } catch (error) {
      console.error(error);
      toast.error(getErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  const footer = (
    <div className="flex justify-content-between align-items-center">
      <Button
        label="Cerrar"
        icon="pi pi-times"
        severity="secondary"
        outlined
        onClick={onHide}
        disabled={isSubmitting}
      />
      <div className="flex align-items-center gap-3">
        <span className="mono font-bold">{formatMoney(totalToRegister)}</span>
        <Button
          severity="success"
          label="Asignar todo"
          icon="pi pi-check"
          loading={isSubmitting}
          onClick={handleSubmit}
        />
      </div>
    </div>
  );

  return (
    <Dialog
      header={`Asignación de etapas${dozen ? ` — ${dozen.code}` : ""}`}
      headerClassName="text-center"
      style={{ width: "48vw" }}
      breakpoints={{ "960px": "80vw", "641px": "94vw" }}
      maskStyle={{ backdropFilter: "blur(4px)" }}
      visible={visible}
      onHide={() => {
        if (isSubmitting) return;
        onHide();
      }}
      footer={footer}
      closable={!isSubmitting}
      className="sf-dialog"
    >
      {loadingRows ? (
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
        <div className="sf-bulk-assign-rows flex flex-column gap-2">
          {rows.map((row, index) => {
            const enabled = isRowEnabled(index);
            const assignment = row.stage.assignment;
            const worker = selectedWorker(row);
            const options = row.stage.workers.map((w) => ({
              label: `${w.names} · ${formatMoney(w.amount)}`,
              value: w.id,
            }));

            return (
              <div
                key={row.stage.specialty.id}
                className={`sf-bulk-row ${enabled || assignment ? "" : "sf-bulk-row-disabled"}`}
              >
                <div className="flex flex-column gap-3">
                  <div className="sf-bulk-row-label flex align-items-center justify-content-between w-full">
                    <span className="font-bold">
                      {row.stage.specialty.name}
                    </span>
                    <span
                      className="text-sm"
                      style={{ color: "var(--sf-stone)" }}
                    >
                      {row.stage.missing_rate
                        ? "Sin tarifa configurada"
                        : `Tarifa base ${formatMoney(row.stage.base_price)}`}
                    </span>
                  </div>

                  {/* Etapa ya asignada: solo lectura */}
                  {assignment ? (
                    <div className="flex flex-column gap-1">
                      <span>
                        {assignment.worker.names} ·{" "}
                        {formatMoney(assignment.amount)}{" "}
                        <span className="text-xs">
                          ({assignment.is_paid ? "Pagado" : "Por pagar"})
                        </span>
                      </span>
                      <span
                        className="text-sm"
                        style={{ color: "var(--sf-stone)" }}
                      >
                        Entregado: {formatDay(assignment.delivered_at)} ·
                        Completado: {formatDay(assignment.completed_at)}
                      </span>
                    </div>
                  ) : (
                    <>
                      <div className="flex align-items-center gap-3">
                        <Dropdown
                          value={row.workerId}
                          options={options}
                          onChange={(e) => handleSelectWorker(index, e.value)}
                          placeholder={
                            row.stage.missing_rate
                              ? "Configura la tarifa en Tarifas primero"
                              : !enabled
                                ? "Complete la fila anterior primero"
                                : options.length === 0
                                  ? "Sin trabajadores con esta especialidad"
                                  : `Seleccione — ${row.stage.specialty.name}`
                          }
                          disabled={!enabled || options.length === 0}
                          filter
                          showClear
                          className="sf-dropdown flex-1"
                        />

                        <Button
                          type="button"
                          icon={
                            row.showMore
                              ? "pi pi-chevron-up"
                              : "pi pi-chevron-down"
                          }
                          className="p-button-text p-button-sm sf-bulk-row-toggle"
                          disabled={!enabled}
                          onClick={() =>
                            updateRow(index, { showMore: !row.showMore })
                          }
                        />
                      </div>

                      {/* Cómo se calculó el pago de esta etapa */}
                      {worker && (
                        <span
                          className="text-sm"
                          style={{ color: "var(--sf-stone)" }}
                        >
                          {formatMoney(worker.unit_price)} por docena
                          {Number(worker.extra_price) !== 0 &&
                            ` (incluye extra de ${formatMoney(worker.extra_price)})`}
                          {dozen && dozen.pairs < 12 && ` × ${dozen.pairs}/12`}
                        </span>
                      )}
                    </>
                  )}
                </div>

                {!assignment && row.showMore && (
                  <div className="sf-bulk-row-extra flex flex-column gap-2 mt-2">
                    <div className="grid">
                      <div className="col-12 md:col-6 flex flex-column gap-1">
                        <label className="font-bold">Fecha de entrega</label>
                        <Calendar
                          value={row.deliveredAt}
                          onChange={(e) =>
                            updateRow(index, {
                              deliveredAt: (e.value as Date) ?? new Date(),
                            })
                          }
                          showIcon
                          dateFormat="dd/mm/yy"
                          locale="es"
                          className="sf-calendar w-full"
                          autoFocus={false}
                          readOnlyInput
                        />
                      </div>
                      <div className="col-12 md:col-6 flex flex-column gap-1">
                        <label className="font-bold">Fecha de término</label>
                        <Calendar
                          value={row.completedAt}
                          onChange={(e) =>
                            updateRow(index, {
                              completedAt: (e.value as Date) ?? new Date(),
                            })
                          }
                          showIcon
                          dateFormat="dd/mm/yy"
                          locale="es"
                          className="sf-calendar w-full"
                          autoFocus={false}
                          readOnlyInput
                        />
                      </div>
                    </div>
                    <InputTextarea
                      value={row.note}
                      onChange={(e) =>
                        updateRow(index, { note: e.target.value })
                      }
                      rows={3}
                      placeholder="Nota (opcional)"
                      className="w-full"
                    />
                  </div>
                )}
              </div>
            );
          })}

          {rows.length === 0 && (
            <p style={{ color: "var(--sf-stone)", fontSize: 13.5 }}>
              No hay etapas activas configuradas.
            </p>
          )}
        </div>
      )}
    </Dialog>
  );
};

export default BulkAssignDozenDialog;
