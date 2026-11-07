import { useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "primereact/button";
import { Column } from "primereact/column";
import { DataTable } from "primereact/datatable";
import { InputText } from "primereact/inputtext";
import { Menu } from "primereact/menu";
import type { MenuItem } from "primereact/menuitem";
import { ProgressBar } from "primereact/progressbar";
import { SelectButton } from "primereact/selectbutton";
import { toast } from "@/shared/lib/toast";
import dayjs from "@/shared/lib/dayjs";
import { capitalizeWords } from "@/shared/lib/helpers";
import { useDozens } from "../hooks/useDozens";
import { useActiveStages } from "../hooks/useActiveStages";
import { useFichaPrint } from "../hooks/useFichaPrint";
import type { Stage } from "../services/stageService";
import type { AssignStagesPayload, Dozen } from "../types/dozen";
import BulkAssignDozenDialog from "../components/BulkAssignDozenDialog";
import Loading from "@/shared/components/Loading";
import { getStageProgress } from "../utils/stageProgress";

// Días sin movimiento a partir de los cuales una docena se marca. Ajústalos a tu taller.
const WARN_DAYS = 3; // ámbar
const STALE_DAYS = 5; // rojo: probablemente la ficha está perdida o sin registrar

const STATUS = { PENDING: "PENDIENTE", IN_PROGRESS: "EN_PROCESO" } as const;
const PRIORITY_RANK: Record<string, number> = { URGENTE: 4, ALTA: 3, NORMAL: 2, BAJA: 1 };

type QuickFilter = "all" | "stale" | "empty";

interface BoardRow {
  dozen: Dozen;
  code: string; // para ordenar
  idleDays: number; // días desde la última etapa registrada (o desde el registro)
  assigned: number;
  total: number; // etapas que aplican a esta docena (un grupo excluyente cuenta como una)
  missing: Stage[]; // etapas activas que aún no tienen trabajador
  priorityRank: number;
}

// Compara códigos ignorando guiones y mayúsculas: un lector con otro teclado
// a veces cambia el "-" por otro símbolo.
const normalizeCode = (value: string) => value.toLowerCase().replace(/[^a-z0-9]/g, "");

const idleLabel = (days: number) => (days === 0 ? "Hoy" : days === 1 ? "Ayer" : `Hace ${days} días`);

export const DozensInProgressPage = () => {
  const { dozens, loading, assignStages } = useDozens({
    autoLoad: true,
    exclude_finished: true,
    no_pagination: true,
  });
  const { stages, loading: loadingStages } = useActiveStages();
  const { printFichas, fichaPrinter, preparingFichas } = useFichaPrint();

  const [search, setSearch] = useState("");
  const [scan, setScan] = useState("");
  const [quick, setQuick] = useState<QuickFilter>("all");
  const [sort, setSort] = useState<{ field: string; order: 1 | -1 | 0 | null | undefined }>({
    field: "idleDays",
    order: -1,
  });

  const [assignTarget, setAssignTarget] = useState<Dozen | null>(null);
  const [assignOpen, setAssignOpen] = useState(false);

  const scanRef = useRef<HTMLInputElement>(null);
  const printMenuRef = useRef<Menu>(null);

  // ── Filas del tablero: solo docenas activas, pendientes o en proceso ──
  const rows = useMemo<BoardRow[]>(() => {
    const today = dayjs().startOf("day");
    return dozens
      .filter((d) => d.is_active && (d.status === STATUS.PENDING || d.status === STATUS.IN_PROGRESS))
      .map((dozen) => {
        const assignments = dozen.assignments ?? [];
        // Último movimiento real: la fecha de la última etapa; sin etapas, el día del registro
        const last = assignments.reduce<string | null>(
          (max, a) => (max === null || a.completed_at > max ? a.completed_at : max),
          null,
        );
        const lastDay = dayjs(last ?? dozen.registered_at).startOf("day");
        return {
          dozen,
          code: dozen.code,
          idleDays: Math.max(0, today.diff(lastDay, "day")),
          // Etapas excluyentes (armado completo vs armador + pegador): solo falta lo que aplica
          ...(() => {
            const progress = getStageProgress(stages, assignments.map((a) => a.specialty.id));
            return { assigned: progress.assigned, total: progress.total, missing: progress.missing };
          })(),
          priorityRank: PRIORITY_RANK[dozen.priority?.toUpperCase()] ?? 0,
        };
      });
  }, [dozens, stages]);

  const staleCount = rows.filter((r) => r.idleDays >= STALE_DAYS).length;
  const emptyCount = rows.filter((r) => r.assigned === 0).length;

  const visibleRows = useMemo(() => {
    const q = search.trim().toLowerCase();
    return rows.filter((r) => {
      if (quick === "stale" && r.idleDays < STALE_DAYS) return false;
      if (quick === "empty" && r.assigned !== 0) return false;
      if (!q) return true;
      return r.code.toLowerCase().includes(q) || (r.dozen.model?.name ?? "").toLowerCase().includes(q);
    });
  }, [rows, quick, search]);

  const quickOptions = [
    { label: `Todas (${rows.length})`, value: "all" },
    { label: `Sin movimiento (${staleCount})`, value: "stale" },
    { label: `Sin etapas (${emptyCount})`, value: "empty" },
  ];

  // ── Asignar etapas ──
  const openAssign = (dozen: Dozen) => {
    setAssignTarget(dozen);
    setAssignOpen(true);
  };

  const closeAssign = () => {
    setAssignOpen(false);
    // Vuelve al campo del lector para escanear la siguiente ficha
    window.setTimeout(() => scanRef.current?.focus(), 0);
  };

  const handleAssign = async (payload: AssignStagesPayload) => {
    if (!assignTarget) return;
    const updated = await assignStages(assignTarget.id, payload);
    if (updated.status === "COMPLETADO") {
      toast.success("Todas las etapas asignadas: la docena quedó completada.");
    }
  };

  // ── Lector: escanea el QR de la ficha (o escribe el código) y Enter ──
  const handleScanKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== "Enter") return;
    const typed = scan.trim();
    if (!typed) return;
    setScan("");
    const row = rows.find((r) => normalizeCode(r.code) === normalizeCode(typed));
    if (!row) {
      toast.error(`La docena ${typed} no está en proceso o no existe.`);
      return;
    }
    openAssign(row.dozen);
  };

  const printMenuItems: MenuItem[] = [
    {
      label: "4 por hoja A4 (recortar)",
      icon: "pi pi-th-large",
      command: () => printFichas(visibleRows.map((r) => r.dozen), "sheet4"),
    },
    {
      label: "Una por hoja (A6)",
      icon: "pi pi-file",
      command: () => printFichas(visibleRows.map((r) => r.dozen), "single"),
    },
  ];

  // ── Celdas ──
  const dozenCell = (r: BoardRow) => (
    <div className="flex align-items-center gap-2">
      <span
        style={{
          width: 10,
          height: 10,
          borderRadius: "50%",
          flexShrink: 0,
          background: r.dozen.color?.hex_code ?? "var(--sf-stone)",
        }}
      />
      <div>
        <div style={{ fontWeight: 500 }}>
          {capitalizeWords(r.dozen.model?.name)}{" "}
          <span className="mono" style={{ fontSize: 12, color: "var(--sf-stone)", fontWeight: 400 }}>
            {r.dozen.code}
          </span>
        </div>
        <div style={{ fontSize: 12, color: "var(--sf-stone)" }}>
          Talla {r.dozen.size?.name} — {capitalizeWords(r.dozen.material_type?.name)}
          {r.dozen.pairs < 12 && ` — ${r.dozen.pairs} pares`}
        </div>
      </div>
    </div>
  );

  const priorityCell = (r: BoardRow) => {
    const p = r.dozen.priority?.toUpperCase();
    if (p === "URGENTE") return <span className="sf-tag clay">Urgente</span>;
    if (p === "ALTA") return <span className="sf-tag amber">Alta</span>;
    return <span style={{ fontSize: 12.5, color: "var(--sf-stone)" }}>{capitalizeWords(r.dozen.priority)}</span>;
  };

  const progressCell = (r: BoardRow) => {
    const total = stages.length || r.dozen.total_stages || 1;
    return (
      <div style={{ minWidth: 90 }}>
        <span className="mono" style={{ fontSize: 12 }}>
          {r.assigned}/{total}
        </span>
        <ProgressBar value={(r.assigned / total) * 100} showValue={false} style={{ height: 6, marginTop: 4 }} />
      </div>
    );
  };

  const missingCell = (r: BoardRow) => {
    if (r.missing.length === 0) return <span style={{ color: "var(--sf-stone)" }}>Todo asignado</span>;
    return (
      <span>
        <strong>{r.missing[0].name}</strong>
        {r.missing.length > 1 && (
          <span style={{ color: "var(--sf-stone)" }}> y {r.missing.length - 1} más</span>
        )}
      </span>
    );
  };

  const idleCell = (r: BoardRow) => {
    const tone = r.idleDays >= STALE_DAYS ? "clay" : r.idleDays >= WARN_DAYS ? "amber" : null;
    return tone ? (
      <span className={`sf-tag ${tone}`}>{idleLabel(r.idleDays)}</span>
    ) : (
      <span style={{ fontSize: 13 }}>{idleLabel(r.idleDays)}</span>
    );
  };

  const actionsCell = (r: BoardRow) => (
    <div className="flex align-items-center gap-1 justify-content-end">
      <Button label="Asignar" icon="pi pi-users" className="p-button-sm sf-btn--moss" onClick={() => openAssign(r.dozen)} />
      <Button
        icon="pi pi-print"
        className="p-button-sm sf-btn--slate"
        tooltip="Imprimir ficha"
        tooltipOptions={{ position: "left" }}
        onClick={() => printFichas([r.dozen], "single")}
      />
    </div>
  );

  if ((loading && dozens.length === 0) || loadingStages) return <Loading />;

  return (
    <>
      <div className="flex flex-wrap align-items-center justify-content-between gap-3 pb-3">
        <div>
          <h2 style={{ fontSize: 19, fontWeight: 600, margin: 0 }}>Docenas en proceso</h2>
          <p style={{ fontSize: 13, color: "var(--sf-ink-2)", margin: "2px 0 0" }}>
            Las que siguen en el taller, de más a menos tiempo sin movimiento.
          </p>
        </div>
        <div className="flex align-items-center gap-2">
          <Link to="/production/dozens">
            <Button label="Todas las docenas" icon="pi pi-external-link" className="p-button-sm sf-btn--ink sf-btn--soft" />
          </Link>
          <Button
            label="Imprimir fichas"
            icon="pi pi-print"
            className="sf-btn p-button-sm sf-btn--slate"
            loading={preparingFichas}
            disabled={visibleRows.length === 0}
            onClick={(e) => printMenuRef.current?.toggle(e)}
          />
          <Menu model={printMenuItems} popup ref={printMenuRef} />
        </div>
      </div>

      <div className="p-3 sf-border-line border-round-lg">
        <div className="flex flex-wrap align-items-center justify-content-between gap-3 mb-3">
          <SelectButton
            value={quick}
            options={quickOptions}
            onChange={(e) => e.value && setQuick(e.value)}
            allowEmpty={false}
          />
          <div className="flex flex-wrap align-items-center gap-2">
            {/* Campo para el lector de QR: escanea la ficha y se abre la docena */}
            <span className="p-input-icon-left">
              <i className="pi pi-qrcode pl-2" />
              <InputText
                ref={scanRef}
                value={scan}
                onChange={(e) => setScan(e.target.value)}
                onKeyDown={handleScanKey}
                placeholder="Escanear ficha…"
                className="pl-5"
                autoFocus
                style={{ minWidth: 190 }}
              />
            </span>
            <span className="p-input-icon-left">
              <i className="pi pi-search pl-2" />
              <InputText
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar por código o modelo..."
                className="pl-5"
                style={{ minWidth: 220 }}
              />
            </span>
          </div>
        </div>

        <DataTable
          value={visibleRows}
          dataKey="dozen.id"
          size="small"
          className="sf-table"
          paginator
          rows={20}
          sortField={sort.field}
          sortOrder={sort.order}
          onSort={(e) => setSort({ field: e.sortField, order: e.sortOrder })}
          emptyMessage="No hay docenas que coincidan."
        >
          <Column header="Docena" body={dozenCell} field="code" sortable />
          <Column header="Prioridad" body={priorityCell} field="priorityRank" sortable />
          <Column header="Avance" body={progressCell} field="assigned" sortable />
          <Column header="Falta" body={missingCell} />
          <Column header="Último movimiento" body={idleCell} field="idleDays" sortable />
          <Column body={actionsCell} style={{ width: "1%" }} />
        </DataTable>
      </div>

      <BulkAssignDozenDialog
        visible={assignOpen}
        onHide={closeAssign}
        dozen={assignTarget}
        onConfirm={handleAssign}
      />

      {fichaPrinter}
    </>
  );
};

export default DozensInProgressPage;
