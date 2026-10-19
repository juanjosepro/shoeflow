import useMediaQuery from "@/shared/hooks/useMediaQuery";
import dayjs from "@/shared/lib/dayjs";
import { capitalizeFirstWord } from "@/shared/lib/helpers";

import type { Dozen, DozenAssignment, StageOption } from "../types/dozen";

import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";

interface Props {
  dozen: Dozen | null;
  stages: StageOption[]; // etapas activas de la fábrica (especialidades activas)
  visible: boolean;
  onHide: () => void;
}

type StatusClass = "pending" | "in_progress" | "completed" | "canceled";

const STATUS_TAG_CLASS: Record<StatusClass, string> = {
  canceled: "red",
  completed: "moss",
  in_progress: "amber",
  pending: "clay",
};

const STATUS_ICON: Record<StatusClass, string> = {
  canceled: "pi-times-circle",
  completed: "pi-check",
  in_progress: "pi-user",
  pending: "pi-clock",
};

const getStatusClass = (
  assignment: DozenAssignment | undefined,
): StatusClass => {
  if (!assignment) return "pending";

  if (assignment.status === "COMPLETADO") return "completed";
  if (assignment.status === "EN PROCESO") return "in_progress";
  if (assignment.status === "CANCELADO") return "canceled";

  return "pending";
};

// Las fechas de las etapas son solo día (sin hora)
const formatDay = (date?: string | null) =>
  date && dayjs(date).isValid() ? dayjs(date).format("D MMM YYYY") : "—";

const DozenDetailDialog = ({ dozen, stages, visible, onHide }: Props) => {
  const isLaptopUp = useMediaQuery("(min-width: 1024px)");

  const formatRegisteredAt = (date?: string | null) => {
    if (!date) return "—";

    const parsedDate = dayjs(date);

    return parsedDate.isValid()
      ? parsedDate.format("D [de] MMMM [de] YYYY")
      : "—";
  };

  // Etapas a mostrar: las activas + las que ya tienen asignación aunque hoy estén
  // desactivadas (así el historial de esta docena no se pierde), en orden de proceso.
  const timelineStages = (() => {
    const list = [...stages];
    (dozen?.assignments ?? []).forEach((assignment) => {
      if (!list.some((stage) => stage.id === assignment.specialty.id)) {
        list.push(assignment.specialty);
      }
    });
    return list.sort((a, b) => a.order - b.order);
  })();

  const quantityLabel = dozen
    ? dozen.pairs === 12
      ? "1 docena · 12 pares"
      : `${dozen.pairs} pares (${dozen.pairs}/12 de docena)`
    : "";

  return (
    <Dialog
      header={
        <>
          <span className="font-bold">Detalle de la docena</span>

          <span className="mx-2">—</span>

          <span className="mono">{dozen?.code}</span>
        </>
      }
      position={isLaptopUp ? "center" : "bottom"}
      headerClassName="text-center"
      style={{
        width: isLaptopUp ? "50vw" : "100vw",
      }}
      maskStyle={{
        backdropFilter: "blur(4px)",
      }}
      visible={visible}
      onHide={onHide}
      footer={
        <Button
          label="Cerrar"
          icon="pi pi-times"
          onClick={onHide}
          outlined
          severity="secondary"
        />
      }
      closable={false}
      className="sf-dialog"
    >
      {dozen && (
        <div className="pt-2">
          {/* DATOS GENERALES */}
          <div className="sf-detail-grid">
            <div>
              <p className="sf-detail-label">Modelo</p>
              <p className="sf-detail-value">{dozen.model?.name || "—"}</p>
            </div>

            <div>
              <p className="sf-detail-label">Talla</p>
              <p className="sf-detail-value">{dozen.size?.name || "—"}</p>
            </div>

            <div>
              <p className="sf-detail-label">Material</p>
              <p className="sf-detail-value">
                {dozen.material_type?.name || "—"}
              </p>
            </div>

            <div>
              <p className="sf-detail-label">Color</p>
              <p className="sf-detail-value">
                {dozen.color && (
                  <span
                    className="inline-block border-circle mr-2"
                    style={{
                      width: "0.75rem",
                      height: "0.75rem",
                      background: dozen.color.hex_code,
                      border: "1px solid var(--sf-ink-2)",
                    }}
                  />
                )}
                {dozen.color?.name || "—"}
              </p>
            </div>

            <div>
              <p className="sf-detail-label">Tipo de Planta</p>
              <p className="sf-detail-value">{dozen.plant_type?.name || "—"}</p>
            </div>

            <div>
              <p className="sf-detail-label">Prioridad</p>
              <p className="sf-detail-value">
                {dozen.priority?.toLowerCase() || "—"}
              </p>
            </div>

            <div>
              <p className="sf-detail-label">Cantidad</p>
              <p className="sf-detail-value">{quantityLabel}</p>
            </div>

            <div>
              <p className="sf-detail-label">Registrado el</p>
              <p className="sf-detail-value">
                {formatRegisteredAt(dozen.registered_at)}
              </p>
            </div>

            {dozen.description && (
              <div className="full">
                <p className="sf-detail-label">Nota</p>
                <p className="sf-detail-value note">{dozen.description}</p>
              </div>
            )}
          </div>

          {/* RECORRIDO */}
          <h3 className="sf-section-title">Recorrido por áreas</h3>

          <div className="sf-timeline">
            {timelineStages.map((stage) => {
              const assignment = (dozen.assignments || []).find(
                (item) => item.specialty.id === stage.id,
              );

              const statusClass = getStatusClass(assignment);

              return (
                <div className="sf-timeline-item" key={stage.id}>
                  <span className={`sf-stage-icon ${statusClass}`}>
                    <i className={`pi ${STATUS_ICON[statusClass]}`} />
                  </span>

                  <div className="sf-timeline-body">
                    <div className="sf-timeline-head">
                      <span className="sf-timeline-stage">{stage.name}</span>

                      {assignment && (
                        <span
                          className={`sf-tag ${STATUS_TAG_CLASS[statusClass]}`}
                        >
                          {capitalizeFirstWord(assignment.status)}
                        </span>
                      )}
                    </div>

                    <p
                      className={`sf-timeline-worker ${
                        !assignment ? "unassigned" : ""
                      }`}
                    >
                      {assignment?.worker?.names || "Sin asignar todavía"}
                    </p>

                    {assignment && (
                      <div className="sf-timeline-meta">
                        <div className="flex align-items-center gap-4">
                          <span>
                            Entregado: {formatDay(assignment.delivered_at)}
                          </span>
                          <span>
                            Completado: {formatDay(assignment.completed_at)}
                          </span>
                        </div>

                        <span className="sf-timeline-payment">
                          S/ {Number(assignment.amount).toFixed(2)}
                          <span className="text-xs font-normal ml-2">
                            {assignment.settlement ? "Pagado" : "Por pagar"}
                          </span>
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </Dialog>
  );
};

export default DozenDetailDialog;
