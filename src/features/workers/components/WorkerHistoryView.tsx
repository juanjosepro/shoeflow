import { useState } from "react";
import { TabView, TabPanel } from "primereact/tabview";
import { SelectButton } from "primereact/selectbutton";
import { Column } from "primereact/column";
import { DataTable, type DataTableExpandedRows } from "primereact/datatable";
import { toast } from "@/shared/lib/toast";
import { formatDay, formatMoney, getApiError } from "../utils/format";
import type { Adjustment, Settlement } from "../types/payment";

// Solo lo que la tabla necesita de una etapa: lo cumplen tanto la del administrador
// como la del portal del trabajador (que trae menos campos).
export interface HistoryAssignment {
  id: number;
  dozen_code: string;
  specialty: { id: number; name: string };
  completed_at: string;
  amount: string;
  week_identifier: string;
  week_label: string;
  settlement: number | null;
}

export interface HistoryDetail {
  items: HistoryAssignment[];
  adjustments: Adjustment[];
}

interface Props {
  assignments: HistoryAssignment[]; // más recientes primero
  settlements: Settlement[];
  loading: boolean;
  // Cómo pedir el detalle de un pago (cambia según quién consulta)
  loadDetail: (settlementId: number) => Promise<HistoryDetail>;
}

type PaidFilter = "all" | "pending" | "paid";

const FILTER_OPTIONS = [
  { label: "Todo", value: "all" },
  { label: "Pendiente de pago", value: "pending" },
  { label: "Pagado", value: "paid" },
];

// Historial de un trabajador: su trabajo por semana y sus pagos.
// Lo usan el diálogo de Trabajadores (administrador) y el portal del trabajador.
const WorkerHistoryView = ({ assignments, settlements, loading, loadDetail }: Props) => {
  const [filter, setFilter] = useState<PaidFilter>("all");

  // Detalle de cada pago: se pide al expandir la fila y se guarda
  const [expandedRows, setExpandedRows] = useState<DataTableExpandedRows>({});
  const [details, setDetails] = useState<Record<number, HistoryDetail>>({});

  const visibleAssignments = assignments.filter((a) =>
    filter === "all" ? true : filter === "paid" ? a.settlement !== null : a.settlement === null,
  );

  const pendingTotal = assignments
    .filter((a) => a.settlement === null)
    .reduce((sum, a) => sum + Number(a.amount), 0);

  const handleRowToggle = async (rows: DataTableExpandedRows) => {
    setExpandedRows(rows);
    // Pedir el detalle de los pagos recién expandidos
    for (const key of Object.keys(rows)) {
      const id = Number(key);
      if (details[id]) continue;
      try {
        const detail = await loadDetail(id);
        setDetails((prev) => ({ ...prev, [id]: detail }));
      } catch (error) {
        toast.error(getApiError(error, "No se pudo cargar el detalle del pago."));
      }
    }
  };

  const paymentDetailTemplate = (row: Settlement) => {
    const detail = details[row.id];
    if (!detail) {
      return (
        <div className="flex justify-content-center p-3">
          <i className="pi pi-spin pi-spinner" />
        </div>
      );
    }

    return (
      <div className="flex flex-column gap-3 p-2">
        <DataTable value={detail.items} size="small" className="sf-table">
          <Column field="dozen_code" header="Docena" />
          <Column header="Etapa" body={(a: HistoryAssignment) => a.specialty.name} />
          <Column header="Terminada" body={(a: HistoryAssignment) => formatDay(a.completed_at)} />
          <Column header="Monto" body={(a: HistoryAssignment) => formatMoney(a.amount)} />
        </DataTable>

        {detail.adjustments.map((a) => (
          <div key={a.id} className="flex justify-content-between">
            <span>
              {a.type_label}
              {a.reason ? ` · ${a.reason}` : ""}
            </span>
            <strong>{formatMoney(a.signed_amount)}</strong>
          </div>
        ))}

        {row.description && <small className="text-color-secondary">Nota: {row.description}</small>}
      </div>
    );
  };

  const paidTag = (a: HistoryAssignment) => (
    <span className={`sf-tag ${a.settlement ? "moss" : "amber"}`}>{a.settlement ? "Pagado" : "Pendiente"}</span>
  );

  return (
    <TabView>
      <TabPanel header="Trabajo realizado">
        <div className="flex flex-wrap align-items-center justify-content-between gap-2 mb-3">
          <SelectButton
            value={filter}
            options={FILTER_OPTIONS}
            onChange={(e) => e.value && setFilter(e.value)}
            allowEmpty={false}
          />
          <span>
            Pendiente de pago: <strong>{formatMoney(pendingTotal)}</strong>
          </span>
        </div>

        <div style={{ overflowX: "auto" }}>
          <DataTable
            value={visibleAssignments}
            loading={loading}
            size="small"
            className="sf-table"
            rowGroupMode="subheader"
            groupRowsBy="week_identifier"
            rowGroupHeaderTemplate={(a: HistoryAssignment) => <strong>{a.week_label}</strong>}
            paginator
            rows={15}
            emptyMessage="Aún no hay etapas registradas."
          >
            <Column field="dozen_code" header="Docena" />
            <Column header="Etapa" body={(a: HistoryAssignment) => a.specialty.name} />
            <Column header="Terminada" body={(a: HistoryAssignment) => formatDay(a.completed_at)} />
            <Column header="Monto" body={(a: HistoryAssignment) => formatMoney(a.amount)} />
            <Column header="Estado" body={paidTag} />
          </DataTable>
        </div>
      </TabPanel>

      <TabPanel header="Pagos">
        <div style={{ overflowX: "auto" }}>
          <DataTable
            value={settlements}
            loading={loading}
            size="small"
            className="sf-table"
            dataKey="id"
            expandedRows={expandedRows}
            onRowToggle={(e) => handleRowToggle(e.data as DataTableExpandedRows)}
            rowExpansionTemplate={paymentDetailTemplate}
            emptyMessage="Aún no hay pagos registrados."
          >
            <Column expander style={{ width: "3rem" }} />
            <Column
              header="Semana"
              body={(s: Settlement) => `${formatDay(s.start_date)} – ${formatDay(s.end_date)}`}
            />
            <Column header="A pagar" body={(s: Settlement) => formatMoney(s.total_to_pay)} />
            <Column header="Entregado" body={(s: Settlement) => <strong>{formatMoney(s.amount_paid)}</strong>} />
            <Column
              header="Quedó pendiente"
              body={(s: Settlement) =>
                Number(s.pending_balance) > 0 ? (
                  <span className="sf-tag clay">{formatMoney(s.pending_balance)}</span>
                ) : (
                  "—"
                )
              }
            />
          </DataTable>
        </div>
      </TabPanel>
    </TabView>
  );
};

export default WorkerHistoryView;
