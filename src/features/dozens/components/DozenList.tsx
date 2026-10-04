import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { Chip } from "primereact/chip";
import { InputText } from "primereact/inputtext";
import { InputTextarea } from "primereact/inputtextarea";
import CheckRadio from "@/shared/components/CheckRadio";
import { teamsChoices } from "@/config/constants";
import { Calendar } from "primereact/calendar";
import { toast } from "@/shared/lib/toast";
import dayjs from "@/shared/lib/dayjs";
import { Accordion, AccordionTab } from "primereact/accordion";
import type { Dozen, MetadataItem } from "../types/dozen";
import { capitalizeWords } from "@/shared/lib/helpers";

// ── Qué equipo debe recibir la docena según su estado ACTUAL ──
// Ej: una docena "PENDIENTE" todavía no tiene cortador -> se le asigna un CORTADOR.
// Una docena "CORTADO" ya pasó por corte -> el siguiente es el APARADOR, etc.
// ⚠️ Ajusta las claves de la derecha para que coincidan exactamente con las
// que existan en tu objeto `teamsChoices` (no las tenía a la vista al escribir esto).
const STATUS_TO_NEXT_TEAM_KEY: Record<string, string> = {
  PENDIENTE: "CORTADOR",
  CORTADO: "APARADOR",
  APARADO: "ARMADOR",
  ARMADO: "REMATADOR",
  REMATADO: "CALIDAD",
};

// Estados en los que la acción principal es "asignar a alguien" (todavía nadie
// la tiene para ese paso). En cualquier otro estado, la acción es "avanzar".
const ASSIGNABLE_STATES = ["PENDIENTE", "CORTADO", "APARADO", "ARMADO", "REMATADO"];

// Clasificación visual de cada status -> color del tag (moss=éxito, amber=en curso, clay=atención)
const statusTagClass = (status: string) => {
  if (["COMPLETADO", "LISTO_PARA_VENTA"].includes(status)) return "moss";
  if (status === "RECHAZADO/FALLA") return "clay";
  return "amber";
};

// Colores con los que sí podemos pintar un punto real (los demás son solo texto)
const COLOR_DOT: Record<string, string> = {
  BLANCO: "#F2F0EA",
  NEGRO: "#1F1D1A",
  DARK_GRAY: "darkgray",
  TAN: "tan",
  SADDLE_BROWN: "saddlebrown",
  GOLD: "gold",
  STEEL_BLUE: "steelblue",
  OTHER: "#9A9284",
};

interface DozenListProps {
  dozens: Dozen[];
  metadata: MetadataItem;
  groupedByTeamId: any;
  toggleDozenStatus: (id: number, currentStatus: boolean) => Promise<void>;
  assignDozen?: (payload: { dozenId: number; workerId: number; assignedAt: Date; note?: string }) => Promise<void>;
  advanceDozenStatus?: (dozenId: number, nextStatusKey: string) => Promise<void>;
}

const DozenList = ({
  dozens,
  metadata,
  groupedByTeamId,
  toggleDozenStatus,
  assignDozen,
  advanceDozenStatus,
}: DozenListProps) => {
  const navigate = useNavigate();
  const [selectedDozen, setSelectedDozen] = useState<Dozen | null>(null);
  const [selectedWorkerId, setSelectedWorkerId] = useState<number | null>(null);
  const [isAssignDozenDialogOpen, setIsAssignDozenDialogOpen] = useState(false);
  const [note, setNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [search, setSearch] = useState("");
  const [assignedAt, setAssignedAt] = useState(new Date());
  const [activeStation, setActiveStation] = useState("all");

  // ── Estaciones: cuenta real de docenas por estado, no datos de ejemplo ──
  const stations = useMemo(
    () => [
      { key: "all", name: "Todas", count: dozens.length },
      ...(metadata?.statuses ?? []).map((status) => ({
        key: status.key,
        name: status.label,
        count: dozens.filter((d) => d.status === status.key).length,
      })),
    ],
    [dozens, metadata],
  );
  // ── Filtra por estación activa + buscador, sobre los datos REALES ──
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
          d.variant?.model?.name?.toLowerCase().includes(q),
      );
    }
    return list;
  }, [dozens, activeStation, search]);

  // ── Agrupa por semana (igual criterio que DozenByWeeks) + resumen por modelo ──
  const groupedByWeek = useMemo(() => {
    if (!filteredDozens.length) return [];

    const sorted = [...filteredDozens].sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    );

    const currentDate = dayjs();
    const tempGroups = new Map<string, { title: string; label: string; items: Dozen[] }>();

    sorted.forEach((item) => {
      const date = dayjs(item.created_at);
      const startOfWeek = date.startOf("isoWeek");
      const endOfWeek = date.endOf("isoWeek");
      const dateKey = startOfWeek.toISOString();

      const label = `del ${startOfWeek.format("D [de] MMMM")} al ${endOfWeek.format("D [de] MMMM")}`;
      const weeksDiff = currentDate.startOf("isoWeek").diff(startOfWeek, "week");

      let title: string;
      if (weeksDiff === 0) title = "Esta semana";
      else if (weeksDiff === 1) title = "Semana pasada";
      else if (weeksDiff <= 4) title = `Hace ${weeksDiff} semanas`;
      else if (weeksDiff <= 8) title = "Hace más de un mes";
      else title = "Hace más de dos meses";

      if (!tempGroups.has(dateKey)) tempGroups.set(dateKey, { title, label, items: [] });
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
      const modelId = item.variant?.model?.id;
      const modelName = item.variant?.model?.name ?? "—";
      if (modelId == null) continue;
      if (!map.has(modelId)) map.set(modelId, { model: modelName, amount: 1 });
      else map.get(modelId)!.amount += 1;
    }
    return Array.from(map.values());
  };

  const getStatusLabel = (key: string) =>
    metadata?.statuses?.find((s) => s.key === key)?.label ?? key;

  const getNextTeamMembers = (dozen: Dozen) => {
    const teamKey = STATUS_TO_NEXT_TEAM_KEY[dozen.status];
    const teamId = teamKey ? (teamsChoices as any)[teamKey] : undefined;
    return teamId ? groupedByTeamId[teamId]?.members ?? [] : [];
  };

  const openAssignDialog = (dozen: Dozen) => {
    setSelectedDozen(dozen);
    setSelectedWorkerId(null);
    setNote("");
    setAssignedAt(new Date());
    setIsAssignDozenDialogOpen(true);
  };

  const handleRowAction = (dozen: Dozen) => {
    if (ASSIGNABLE_STATES.includes(dozen.status)) {
      openAssignDialog(dozen);
      return;
    }
    // Estado final o sin siguiente paso definido: no hay acción de avance.
    toast.info?.("Esta docena no tiene un siguiente paso configurado.");
  };

  const handleConfirmAssign = async () => {
    if (!selectedDozen || !selectedWorkerId) {
      toast.error("Selecciona un trabajador antes de asignar.");
      return;
    }
    setIsSubmitting(true);
    try {
      if (assignDozen) {
        await assignDozen({
          dozenId: selectedDozen.id,
          workerId: selectedWorkerId,
          assignedAt,
          note: note || undefined,
        });
      } else {
        // TODO: conectar al endpoint real, p. ej. POST /dozen-stage-assignments/deliver/
        console.log("Asignar docena:", {
          dozenId: selectedDozen.id,
          workerId: selectedWorkerId,
          assignedAt,
          note,
        });
      }
      toast.success("¡Docena asignada exitosamente!");
      setIsAssignDozenDialogOpen(false);
    } catch (error) {
      console.error(error);
      toast.error("Error al asignar la docena.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const dialogAssignDozenFooterSection = (
    <div className="flex justify-content-between">
      <Button
        label="Cerrar"
        icon="pi pi-times"
        severity="secondary"
        outlined
        onClick={() => setIsAssignDozenDialogOpen(false)}
        disabled={isSubmitting}
      />
      <Button
        severity="success"
        label="Asignar"
        icon="pi pi-check"
        loading={isSubmitting}
        onClick={handleConfirmAssign}
      />
    </div>
  );

  const nextTeamMembers = selectedDozen ? getNextTeamMembers(selectedDozen) : [];
  // Nombre del equipo que recibirá la docena (no el estado actual) para mostrar
  // algo como "Elegir trabajador (APARADOR)" en el diálogo.
  const nextTeamLabel = selectedDozen ? STATUS_TO_NEXT_TEAM_KEY[selectedDozen.status] ?? "" : "";

  return (
    <>
      <div className="dozens-layout" style={{ display: "flex", gap: 24 }}>
        {/* Filtro por estación */}
        <div
          className="dozens-stations p-3 sf-border-line border-round-lg"
          style={{ width: 220, flexShrink: 0 }}
        >
          <p style={{ fontSize: 12, color: "var(--sf-stone)", margin: "0 0 10px" }}>
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
                  background: activeStation === s.key ? "var(--sf-clay-light)" : "transparent",
                  cursor: "pointer",
                  textAlign: "left",
                  width: "100%",
                }}
              >
                <span style={{ fontSize: 13.5, fontWeight: 500, color: "var(--sf-ink)" }}>
                  {s.name}
                </span>
                <span
                  className="mono"
                  style={{
                    fontSize: 12,
                    color: activeStation === s.key ? "var(--sf-clay)" : "var(--sf-stone)",
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
        <div style={{ flex: 1, minWidth: 0 }} className="p-3 sf-border-line border-round-lg">
          <div className="flex align-items-center justify-content-between gap-3 mb-3">
            <div>
              <h2 style={{ fontSize: 19, fontWeight: 600, margin: 0 }}>
                {activeStation === "all" ? "Todas las docenas" : getStatusLabel(activeStation)}
              </h2>
              <p style={{ fontSize: 13, color: "var(--sf-ink-2)", margin: "2px 0 0" }}>
                {stations.find((s) => s.key === activeStation)?.count ?? 0} docenas
              </p>
            </div>
            <span className="p-input-icon-left taller-search" style={{ minWidth: 220 }}>
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
            <p style={{ color: "var(--sf-stone)", fontSize: 13.5, padding: "20px 0" }}>
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
                          <span style={{ fontSize: 12.5, color: "var(--sf-stone)" }}>
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
                  {week.items.map((item, j) => (
                    <div
                      key={item.id}
                      className="dozen-row"
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 14,
                        padding: "12px 18px",
                        borderTop: j > 0 ? "1px solid var(--sf-line)" : "none",
                      }}
                    >
                      <span style={{ fontSize: 12, color: "var(--sf-stone)", fontWeight: 600 }}>{j + 1}. </span>
                      <span
                        style={{
                          width: 10,
                          height: 10,
                          borderRadius: "50%",
                          boxShadow: "0 0 0 2px color-mix(in srgb, currentColor 12%, transparent)",
                          background: COLOR_DOT[item.color] ?? "var(--sf-stone)",
                          flexShrink: 0,
                        }}
                      />
                      <div className="dozen-row-main" style={{ flex: 1, minWidth: 0 }}>
                        <div
                          style={{ fontSize: 13.5, fontWeight: 500, cursor: "pointer" }}
                          onClick={() => navigate(`/production/dozens/${item.id}/edit`)}
                        >
                          {capitalizeWords(item.variant?.model?.name)}{" "}
                          <span className="mono" style={{ fontSize: 12, color: "var(--sf-stone)", fontWeight: 400 }}>
                            {item.code}
                          </span>
                        </div>
                        <div style={{ fontSize: 12, color: "var(--sf-stone)" }}>
                          Talla {item.variant?.size?.name} ({item.variant?.size?.description}) — {capitalizeWords(item.material)}
                        </div>
                      </div>
                      <span className={`sf-tag ${statusTagClass(item.status)}`}>
                        {getStatusLabel(item.status)}
                      </span>
                      <Button
                        label={ASSIGNABLE_STATES.includes(item.status) ? "Asignar" : "Sin acción"}
                        className="sf-btn p-button-sm"
                        disabled={!ASSIGNABLE_STATES.includes(item.status)}
                        onClick={() => handleRowAction(item)}
                      />
                      <Button
                        icon={item.is_active ? "pi pi-eye-slash" : "pi pi-eye"}
                        className="p-button-sm p-button-text"
                        onClick={async () => {
                          try {
                            await toggleDozenStatus(item.id, item.is_active);
                            toast.success(item.is_active ? "Docena desactivada." : "Docena activada.");
                          } catch {
                            toast.error("Error al cambiar el estado de la docena.");
                          }
                        }}
                      />
                    </div>
                  ))}
                </AccordionTab>
              ))}
            </Accordion>
          )}
        </div>
      </div>

      {/* Diálogo de asignación */}
      <Dialog
        header={`Asignar docena${selectedDozen ? ` — ${selectedDozen.code}` : ""}`}
        headerClassName="text-center"
        style={{ width: "40vw" }}
        breakpoints={{ "960px": "75vw", "641px": "90vw" }}
        maskStyle={{ backdropFilter: "blur(4px)" }}
        visible={isAssignDozenDialogOpen}
        onHide={() => {
          if (isSubmitting) return;
          setIsAssignDozenDialogOpen(false);
        }}
        footer={dialogAssignDozenFooterSection}
        closable={!isSubmitting}
        className="sf-dialog"
      >
        <div className="flex flex-column gap-2 mb-4">
          <label htmlFor="assigned_at" className="font-bold">
            Fecha de Asignación
          </label>
          <Calendar
            name="assigned_at"
            value={assignedAt}
            onChange={(e: any) => setAssignedAt(e.value)}
            showIcon
            dateFormat="dd/mm/yy"
            locale="es"
            className="sf-calendar w-full"
            autoFocus={false}
            readOnlyInput
          />
        </div>

        <div className="flex flex-column gap-2 mb-4">
          <label htmlFor="worker_id" className="font-bold">
            Elegir trabajador{nextTeamLabel ? ` (${nextTeamLabel})` : ""}
          </label>
          {nextTeamMembers.length === 0 ? (
            <p style={{ color: "var(--sf-stone)", fontSize: 13 }}>
              No hay trabajadores configurados para este equipo todavía.
            </p>
          ) : (
            <div className="sf-chip-scroll">
              {
              nextTeamMembers.map((worker: any) => (
                <CheckRadio
                  key={worker.id}
                  label={worker.names}
                  valueCheck={worker.id}
                  value={selectedWorkerId}
                  name="worker_id"
                  onChange={(e: any) => setSelectedWorkerId(Number(e.target.value))}
                />
                // groupedByTeamId[teamsChoices.APARADOR]?.members.map((worker) => (
                //   <CheckRadio
                //     key={worker.id}
                //     label={worker.name}
                //     valueCheck={worker.id}
                //     value={selectedWorkerId}
                //     name="worker_id"
                //     onChange={(e: any) => setSelectedWorkerId(Number(e.target.value))}
                //   />
                ))
              }
            </div>
          )}
        </div>

        <div className="flex flex-column gap-2">
          <label htmlFor="note" className="font-bold">
            Nota Adicional
          </label>
          <InputTextarea
            id="note"
            name="note"
            rows={4}
            disabled={isSubmitting}
            value={note}
            onChange={(e: any) => setNote(e.target.value)}
          />
        </div>
      </Dialog>
    </>
  );
};

export default DozenList;