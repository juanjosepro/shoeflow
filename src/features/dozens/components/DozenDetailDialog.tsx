import useMediaQuery from "@/shared/hooks/useMediaQuery";
import dayjs from "@/shared/lib/dayjs";
import { capitalizeFirstWord } from "@/shared/lib/helpers";

import type { Dozen } from "../types/dozen";

import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";

interface Props {
  dozen: Dozen | null;
  visible: boolean;
  onHide: () => void;
}

const DOZEN_STAGE_ASSIGNMENT = [
  { key: "CORTADO", label: "Corte" },
  { key: "APARADO", label: "Aparado" },
  { key: "ARMADO", label: "Armado" },
  { key: "REMATADO", label: "Rematado" },
  {
    key: "CONTROL_DE_CALIDAD",
    label: "Control de calidad",
  },
] as const;

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
  assignment: Dozen["assignments"][number] | undefined,
): StatusClass => {
  if (!assignment) return "pending";

  if (assignment.status === "COMPLETADO") {
    return "completed";
  }

  if (assignment.status === "EN PROCESO") {
    return "in_progress";
  }

  if (assignment.status === "CANCELADO") {
    return "canceled";
  }

  return "pending";
};

const DozenDetailDialog = ({ dozen, visible, onHide }: Props) => {
  const isLaptopUp = useMediaQuery("(min-width: 1024px)");

  const pairs = dozen ? Number(dozen.quantity) * 12 : 0;

  const formatRegisteredAt = (date?: string | null) => {
    if (!date) return "—";

    const parsedDate = dayjs(date);

    return parsedDate.isValid()
      ? parsedDate.format("D [de] MMMM [de] YYYY")
      : "—";
  };

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

              <p className="sf-detail-value">
                {dozen.variant?.model?.name || "—"}
              </p>
            </div>

            <div>
              <p className="sf-detail-label">Talla</p>

              <p className="sf-detail-value">
                {dozen.variant?.size?.name || "—"}
              </p>
            </div>

            <div>
              <p className="sf-detail-label">Material</p>

              <p className="sf-detail-value">
                {dozen.material?.toLowerCase() || "—"}
              </p>
            </div>

            <div>
              <p className="sf-detail-label">Color</p>

              <p className="sf-detail-value">
                {dozen.color?.toLowerCase() || "—"}
              </p>
            </div>

            <div>
              <p className="sf-detail-label">Cantidad</p>

              <p className="sf-detail-value">
                {dozen.quantity} docena(s) · {pairs} pares
              </p>
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
            {DOZEN_STAGE_ASSIGNMENT.map((stage) => {
              const assignment = (dozen.assignments || []).find(
                (item) => item.stage === stage.key,
              );

              const statusClass = getStatusClass(assignment);

              return (
                <div className="sf-timeline-item" key={stage.key}>
                  <span className={`sf-stage-icon ${statusClass}`}>
                    <i className={`pi ${STATUS_ICON[statusClass]}`} />
                  </span>

                  <div className="sf-timeline-body">
                    <div className="sf-timeline-head">
                      <span className="sf-timeline-stage">{stage.label}</span>

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

                    {assignment &&
                      (assignment.delivered_at ||
                        assignment.completed_at ||
                        assignment.total_payment) && (
                        <div className="sf-timeline-meta">
                          <div className="flex align-items-center gap-4">
                            {assignment.delivered_at && (
                              <span>
                                Entregado:{" "}
                                {dayjs(assignment.delivered_at).format(
                                  "D MMM, h:mm A",
                                )}
                              </span>
                            )}

                            {assignment.completed_at && (
                              <span>
                                Completado:{" "}
                                {dayjs(assignment.completed_at).format(
                                  "D MMM, h:mm A",
                                )}
                              </span>
                            )}
                          </div>

                          {assignment.total_payment && (
                            <span className="sf-timeline-payment">
                              S/ {Number(assignment.total_payment).toFixed(2)}
                            </span>
                          )}
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
