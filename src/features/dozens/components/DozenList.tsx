import { useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "primereact/button";
import { Chip } from "primereact/chip";
import { InputText } from "primereact/inputtext";
import { Accordion, AccordionTab } from "primereact/accordion";
import { Menu } from "primereact/menu";
import type { MenuItem } from "primereact/menuitem";
import { ConfirmDialog } from "@/shared/components/ConfirmDialog";
import { toast } from "@/shared/lib/toast";
import dayjs from "@/shared/lib/dayjs";
import { capitalizeWords } from "@/shared/lib/helpers";
import type {
  AssignStagesPayload,
  Dozen,
  DozenMetadata,
  DozenStatusAction,
} from "../types/dozen";
import BulkAssignDozenDialog from "./BulkAssignDozenDialog";

// Estados de una docena (los mismos que define el backend)
const STATUS = {
  PENDING: "PENDIENTE",
  IN_PROGRESS: "EN_PROCESO",
  COMPLETED: "COMPLETADO",
  REJECTED: "RECHAZADO",
} as const;

// Solo en estos estados se pueden asignar etapas
const ASSIGNABLE_STATES: string[] = [STATUS.PENDING, STATUS.IN_PROGRESS];

// Textos de cada cambio de estado manual
const STATUS_ACTION_TEXT: Record<
  DozenStatusAction,
  {
    title: string;
    description: (code: string) => string;
    success: string;
    textButton: string;
  }
> = {
  complete: {
    title: "¿Marcar como completada?",
    description: (code) =>
      `La docena ${code} saldrá de "en proceso" y ya no admitirá nuevas etapas.`,
    success: "Docena completada.",
    textButton: "Completar",
  },
  reject: {
    title: "¿Rechazar docena?",
    description: (code) =>
      `La docena ${code} se marcará como rechazada por falla grave. Las etapas ya registradas se siguen pagando.`,
    success: "Docena rechazada.",
    textButton: "Rechazar",
  },
  reopen: {
    title: "¿Reabrir docena?",
    description: (code) => `La docena ${code} volverá a estar en proceso.`,
    success: "Docena reabierta.",
    textButton: "Reabrir",
  },
};

interface DozenListProps {
  dozens: Dozen[];
  metadata: DozenMetadata;
  toggleDozenStatus: (id: number, currentStatus: boolean) => Promise<void>;
  // Guarda varias etapas de una docena en un solo envío
  assignStages: (
    dozenId: number,
    payload: AssignStagesPayload,
  ) => Promise<Dozen>;
  // Completar, rechazar o reabrir una docena
  changeDozenStatus: (id: number, action: DozenStatusAction) => Promise<void>;
}

const DozenList = ({
  dozens,
  metadata,
  toggleDozenStatus,
  assignStages,
  changeDozenStatus,
}: DozenListProps) => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [activeStation, setActiveStation] = useState("all");

  // Diálogo de asignación: docena objetivo + visibilidad
  const [assignTarget, setAssignTarget] = useState<Dozen | null>(null);
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);

  // Menú de acciones de la fila + confirmación del cambio de estado
  const menuRef = useRef<Menu>(null);
  const [menuTarget, setMenuTarget] = useState<Dozen | null>(null);
  const [statusChange, setStatusChange] = useState<{
    dozen: Dozen;
    action: DozenStatusAction;
  } | null>(null);
  const [isChangingStatus, setIsChangingStatus] = useState(false);

  // Color del tag según el estado (moss=éxito, amber=en curso, clay=atención)
  const statusTagClass = (status: string) => {
    if (status === STATUS.COMPLETED) return "moss";
    if (status === STATUS.REJECTED) return "clay";
    return "amber";
  };

  const getStatusLabel = (key: string) =>
    metadata.statuses.find((status) => status.key === key)?.label ?? key;

  // ── Estaciones: cuenta real de docenas por estado ──
  const stations = useMemo(
    () => [
      { key: "all", name: "Todas", count: dozens.length },
      ...metadata.statuses.map((status) => ({
        key: status.key,
        name: status.label,
        count: dozens.filter((d) => d.status === status.key).length,
      })),
    ],
    [dozens, metadata.statuses],
  );

  // ── Filtra por estación activa + buscador ──
  const filteredDozens = useMemo(() => {
    let list = dozens;
    if (activeStation !== "all") {
      list = list.filter((d) => d.status === activeStation);
    }
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (d) =>
          d.code.toLowerCase().includes(q) ||
          d.model?.name?.toLowerCase().includes(q),
      );
    }
    return list;
  }, [dozens, activeStation, search]);

  // ── Agrupa por semana de creación ──
  const groupedByWeek = useMemo(() => {
    if (!filteredDozens.length) return [];

    const sorted = [...filteredDozens].sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    );

    const currentDate = dayjs();
    const tempGroups = new Map<
      string,
      { title: string; label: string; items: Dozen[] }
    >();

    sorted.forEach((item) => {
      const date = dayjs(item.created_at);
      const startOfWeek = date.startOf("isoWeek");
      const endOfWeek = date.endOf("isoWeek");
      const dateKey = startOfWeek.toISOString();

      const label = `del ${startOfWeek.format("D [de] MMMM")} al ${endOfWeek.format("D [de] MMMM")}`;
      const weeksDiff = currentDate
        .startOf("isoWeek")
        .diff(startOfWeek, "week");

      let title: string;
      if (weeksDiff === 0) title = "Esta semana";
      else if (weeksDiff === 1) title = "Semana pasada";
      else if (weeksDiff <= 4) title = `Hace ${weeksDiff} semanas`;
      else if (weeksDiff <= 8) title = "Hace más de un mes";
      else title = "Hace más de dos meses";

      if (!tempGroups.has(dateKey))
        tempGroups.set(dateKey, { title, label, items: [] });
      tempGroups.get(dateKey)!.items.push(item);
    });

    return Array.from(tempGroups.entries())
      .sort((a, b) => new Date(b[0]).getTime() - new Date(a[0]).getTime())
      .map(([, group]) => group);
  }, [filteredDozens]);

  // ── Resumen "qué modelos y cuántos" para el header del acordeón ──
  const groupByModel = (items: Dozen[]) => {
    const map = new Map<number, { model: string; amount: number }>();
    for (const item of items) {
      if (!item.model) continue;
      const entry = map.get(item.model.id);
      if (entry) entry.amount += 1;
      else map.set(item.model.id, { model: item.model.name, amount: 1 });
    }
    return Array.from(map.values());
  };

  const getMenuItems = (dozen: Dozen | null): MenuItem[] => {
    if (!dozen) return [];

    if (ASSIGNABLE_STATES.includes(dozen.status)) {
      return [
        {
          label: "Marcar como completada",
          icon: "pi pi-check-circle",
          disabled: dozen.assigned_stages === 0, // necesita al menos una etapa
          command: () => setStatusChange({ dozen, action: "complete" }),
        },
        {
          label: "Rechazar docena",
          icon: "pi pi-ban",
          command: () => setStatusChange({ dozen, action: "reject" }),
        },
      ];
    }

    return [
      {
        label: "Reabrir docena",
        icon: "pi pi-replay",
        command: () => setStatusChange({ dozen, action: "reopen" }),
      },
    ];
  };

  const handleConfirmStatusChange = async () => {
    if (!statusChange) return;
    setIsChangingStatus(true);
    try {
      await changeDozenStatus(statusChange.dozen.id, statusChange.action);
      toast.success(STATUS_ACTION_TEXT[statusChange.action].success);
      setStatusChange(null);
    } catch (error: any) {
      toast.error(
        error?.response?.data?.detail ??
          "Error al cambiar el estado de la docena.",
      );
    } finally {
      setIsChangingStatus(false);
    }
  };

  // Guarda las etapas y avisa si con eso la docena quedó completa
  const handleAssignStages = async (payload: AssignStagesPayload) => {
    if (!assignTarget) return;
    const updated = await assignStages(assignTarget.id, payload);
    if (updated.status === STATUS.COMPLETED) {
      toast.success("Todas las etapas asignadas: la docena quedó completada.");
    }
  };

  const openAssignDialog = (dozen: Dozen) => {
    setAssignTarget(dozen);
    setIsAssignDialogOpen(true);
  };

  return (
    <>
      <div className="dozens-layout" style={{ display: "flex", gap: 24 }}>
        {/* Filtro por estación */}
        <div
          className="dozens-stations p-3 sf-border-line border-round-lg"
          style={{ width: 220, flexShrink: 0 }}
        >
          <p
            style={{
              fontSize: 12,
              color: "var(--sf-stone)",
              margin: "0 0 10px",
            }}
          >
            Docenas en proceso
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {stations.map((s) => (
              <button
                key={s.key}
                onClick={() => setActiveStation(s.key)}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "10px 10px",
                  borderRadius: 4,
                  border: "none",
                  borderLeft: `2px solid ${activeStation === s.key ? "var(--sf-clay)" : "transparent"}`,
                  background:
                    activeStation === s.key
                      ? "var(--sf-clay-light)"
                      : "transparent",
                  cursor: "pointer",
                  textAlign: "left",
                  width: "100%",
                }}
              >
                <span
                  style={{
                    fontSize: 13.5,
                    fontWeight: 500,
                    color: "var(--sf-ink)",
                  }}
                >
                  {s.name}
                </span>
                <span
                  className="mono"
                  style={{
                    fontSize: 12,
                    color:
                      activeStation === s.key
                        ? "var(--sf-clay)"
                        : "var(--sf-stone)",
                    fontWeight: activeStation === s.key ? 500 : 400,
                  }}
                >
                  {s.count}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Contenido principal */}
        <div
          style={{ flex: 1, minWidth: 0 }}
          className="p-3 sf-border-line border-round-lg"
        >
          <div className="flex align-items-center justify-content-between gap-3 mb-3">
            <div>
              <h2 style={{ fontSize: 19, fontWeight: 600, margin: 0 }}>
                {activeStation === "all"
                  ? "Todas las docenas"
                  : getStatusLabel(activeStation)}
              </h2>
              <p
                style={{
                  fontSize: 13,
                  color: "var(--sf-ink-2)",
                  margin: "2px 0 0",
                }}
              >
                {stations.find((s) => s.key === activeStation)?.count ?? 0}{" "}
                docenas
              </p>
            </div>
            <span
              className="p-input-icon-left taller-search"
              style={{ minWidth: 220 }}
            >
              <i className="pi pi-search pl-2" />
              <InputText
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar por código o modelo..."
                className="pl-5 w-full"
              />
            </span>
          </div>

          {groupedByWeek.length === 0 ? (
            <p
              style={{
                color: "var(--sf-stone)",
                fontSize: 13.5,
                padding: "20px 0",
              }}
            >
              No hay docenas que coincidan.
            </p>
          ) : (
            <Accordion multiple activeIndex={[0]} className="sf-accordion">
              {groupedByWeek.map((week, i) => (
                <AccordionTab
                  key={i}
                  header={
                    <div style={{ width: "100%" }}>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <span>
                          <strong style={{ fontSize: 14 }}>{week.title}</strong>{" "}
                          <span
                            style={{ fontSize: 12.5, color: "var(--sf-stone)" }}
                          >
                            {week.label}
                          </span>
                        </span>
                        <span
                          className="mono"
                          style={{
                            fontSize: 12,
                            border: "1px solid var(--sf-line)",
                            borderRadius: 20,
                            padding: "3px 10px",
                          }}
                        >
                          {week.items.length}
                        </span>
                      </div>
                      {/* Resumen: qué modelos y cuántos se registraron esta semana */}
                      <div className="flex flex-wrap gap-1 mt-2">
                        {groupByModel(week.items).map((m, idx) => (
                          <Chip
                            key={idx}
                            label={`${capitalizeWords(m.model)} (${m.amount})`}
                            style={{ fontSize: 10, fontWeight: 600 }}
                            className="sf-tag moss py-0"
                          />
                        ))}
                      </div>
                    </div>
                  }
                >
                  {week.items.map((item, j) => {
                    const canAssign = ASSIGNABLE_STATES.includes(item.status);

                    return (
                      <div
                        key={item.id}
                        className="dozen-row"
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 14,
                          padding: "12px 18px",
                          borderTop:
                            j > 0 ? "1px solid var(--sf-line)" : "none",
                        }}
                      >
                        <span
                          style={{
                            fontSize: 12,
                            color: "var(--sf-stone)",
                            fontWeight: 600,
                          }}
                        >
                          {j + 1}.{" "}
                        </span>
                        {/* Punto con el color real de la docena */}
                        <span
                          style={{
                            width: 10,
                            height: 10,
                            borderRadius: "50%",
                            boxShadow:
                              "0 0 0 2px color-mix(in srgb, currentColor 12%, transparent)",
                            background:
                              item.color?.hex_code ?? "var(--sf-stone)",
                            flexShrink: 0,
                          }}
                        />
                        <div
                          className="dozen-row-main"
                          style={{ flex: 1, minWidth: 0 }}
                        >
                          <div
                            style={{
                              fontSize: 13.5,
                              fontWeight: 500,
                              cursor: "pointer",
                            }}
                            onClick={() =>
                              navigate(`/production/dozens/${item.id}/edit`)
                            }
                          >
                            {capitalizeWords(item.model?.name)}{" "}
                            <span
                              className="mono"
                              style={{
                                fontSize: 12,
                                color: "var(--sf-stone)",
                                fontWeight: 400,
                              }}
                            >
                              {item.code}
                            </span>
                          </div>
                          <div
                            style={{ fontSize: 12, color: "var(--sf-stone)" }}
                          >
                            Talla {item.size?.name}
                            {item.size?.description &&
                              ` (${item.size.description})`}{" "}
                            — {capitalizeWords(item.material_type?.name)}
                            {item.pairs < 12 && ` — ${item.pairs} pares`}
                            {` — ${item.assigned_stages}/${item.total_stages} etapas`}
                          </div>
                        </div>
                        <span
                          className={`sf-tag ${statusTagClass(item.status)}`}
                        >
                          {getStatusLabel(item.status)}
                        </span>
                        <Button
                          label={canAssign ? "Asignar etapas" : "Sin acción"}
                          icon={canAssign ? "pi pi-users" : undefined}
                          className="sf-btn p-button-sm"
                          disabled={!canAssign}
                          onClick={() => openAssignDialog(item)}
                        />
                        <Button
                          icon={
                            item.is_active ? "pi pi-eye-slash" : "pi pi-eye"
                          }
                          className="p-button-sm p-button-text"
                          style={{ color: "var(--sf-ink)" }}
                          onClick={async () => {
                            try {
                              await toggleDozenStatus(item.id, item.is_active);
                              toast.success(
                                item.is_active
                                  ? "Docena desactivada."
                                  : "Docena activada.",
                              );
                            } catch {
                              toast.error(
                                "Error al cambiar el estado de la docena.",
                              );
                            }
                          }}
                        />
                        <Button
                          icon="pi pi-ellipsis-v"
                          className="p-button-sm p-button-text"
                          style={{ color: "var(--sf-ink)" }}
                          onClick={(e) => {
                            setMenuTarget(item);
                            menuRef.current?.toggle(e);
                          }}
                        />
                      </div>
                    );
                  })}
                </AccordionTab>
              ))}
            </Accordion>
          )}
        </div>
      </div>

      {/* Asignación de etapas: todas las especialidades activas de una vez */}
      <BulkAssignDozenDialog
        visible={isAssignDialogOpen}
        onHide={() => setIsAssignDialogOpen(false)}
        dozen={assignTarget}
        onConfirm={handleAssignStages}
      />

      {/* Menú de acciones de la fila (completar, rechazar, reabrir) */}
      <Menu model={getMenuItems(menuTarget)} popup ref={menuRef} />

      <ConfirmDialog
        open={statusChange !== null}
        onOpenChange={(open) => {
          if (!open && !isChangingStatus) setStatusChange(null);
        }}
        title={
          statusChange ? STATUS_ACTION_TEXT[statusChange.action].title : ""
        }
        description={
          statusChange
            ? STATUS_ACTION_TEXT[statusChange.action].description(
                statusChange.dozen.code,
              )
            : ""
        }
        onConfirm={handleConfirmStatusChange}
        isLoading={isChangingStatus}
        textButton={
          statusChange ? STATUS_ACTION_TEXT[statusChange.action].textButton : ""
        }
      />
    </>
  );
};

export default DozenList;
