import { useEffect, useState } from "react";
import { Dialog } from "primereact/dialog";
import { TabView, TabPanel } from "primereact/tabview";
import { SelectButton } from "primereact/selectbutton";
import { Column } from "primereact/column";
import { DataTable, type DataTableExpandedRows } from "primereact/datatable";
import { toast } from "@/shared/lib/toast";
import { paymentService } from "../services/paymentService";
import { formatDay, formatMoney, getApiError } from "../utils/format";
import type { Worker } from "../types/worker";
import type { DozenAssignment } from "@/features/dozens/types/dozen";
import type { Settlement, SettlementDetail } from "../types/payment";

interface Props {
  visible: boolean;
  onHide: () => void;
  worker: Worker | null;
}

type PaidFilter = "all" | "pending" | "paid";

const FILTER_OPTIONS = [
  { label: "Todo", value: "all" },
  { label: "Pendiente de pago", value: "pending" },
  { label: "Pagado", value: "paid" },
];

const WorkerHistory = ({ visible, onHide, worker }: Props) => {
  const [assignments, setAssignments] = useState<DozenAssignment[]>([]);
  const [settlements, setSettlements] = useState<Settlement[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<PaidFilter>("all");

  // Detalle de cada pago: se pide al expandir la fila y se guarda
  const [expandedRows, setExpandedRows] = useState<DataTableExpandedRows>({});
  const [details, setDetails] = useState<Record<number, SettlementDetail>>({});

  const workerId = worker?.id;

  useEffect(() => {
    if (!visible || workerId == null) return;

    let ignore = false;

    const load = async () => {
      setLoading(true);
      setFilter("all");
      setExpandedRows({});
      setDetails({});
      try {
        const [work, payments] = await Promise.all([
          paymentService.getAssignmentsByWorker(workerId),
          paymentService.getByWorker(workerId),
        ]);
        if (ignore) return;
        // Lo más reciente primero
        setAssignments(
          [...work].sort((a, b) =>
            b.completed_at.localeCompare(a.completed_at),
          ),
        );
        setSettlements(payments);
      } catch (error) {
        if (!ignore)
          toast.error(getApiError(error, "No se pudo cargar el historial."));
      } finally {
        if (!ignore) setLoading(false);
      }
    };

    load();
    return () => {
      ignore = true;
    };
  }, [visible, workerId]);

  const visibleAssignments = assignments.filter((a) =>
    filter === "all"
      ? true
      : filter === "paid"
        ? a.settlement !== null
        : a.settlement === null,
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
        const detail = await paymentService.getDetail(id);
        setDetails((prev) => ({ ...prev, [id]: detail }));
      } catch (error) {
        toast.error(
          getApiError(error, "No se pudo cargar el detalle del pago."),
        );
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
          <Column
            header="Etapa"
            body={(a: DozenAssignment) => a.specialty.name}
          />
          <Column
            header="Terminada"
            body={(a: DozenAssignment) => formatDay(a.completed_at)}
          />
          <Column
            header="Monto"
            body={(a: DozenAssignment) => formatMoney(a.amount)}
          />
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

        {row.description && (
          <small className="text-color-secondary">
            Nota: {row.description}
          </small>
        )}
      </div>
    );
  };

  const paidTag = (a: DozenAssignment) => (
    <span className={`sf-tag ${a.settlement ? "moss" : "amber"}`}>
      {a.settlement ? "Pagado" : "Pendiente"}
    </span>
  );

  return (
    <Dialog
      visible={visible}
      onHide={onHide}
      header={`Historial de ${worker?.names ?? ""}`}
      className="sf-dialog"
      style={{ width: "65vw" }}
      breakpoints={{ "960px": "90vw", "641px": "100vw" }}
      maskStyle={{ backdropFilter: "blur(4px)" }}
    >
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

          <DataTable
            value={visibleAssignments}
            loading={loading}
            size="small"
            className="sf-table"
            rowGroupMode="subheader"
            groupRowsBy="week_identifier"
            rowGroupHeaderTemplate={(a: DozenAssignment) => (
              <strong>{a.week_label}</strong>
            )}
            paginator
            rows={15}
            emptyMessage="Este trabajador aún no tiene etapas registradas."
          >
            <Column field="dozen_code" header="Docena" />
            <Column
              header="Etapa"
              body={(a: DozenAssignment) => a.specialty.name}
            />
            <Column
              header="Terminada"
              body={(a: DozenAssignment) => formatDay(a.completed_at)}
            />
            <Column
              header="Monto"
              body={(a: DozenAssignment) => formatMoney(a.amount)}
            />
            <Column header="Estado" body={paidTag} />
          </DataTable>
        </TabPanel>

        <TabPanel header="Pagos">
          <DataTable
            value={settlements}
            loading={loading}
            size="small"
            className="sf-table"
            dataKey="id"
            expandedRows={expandedRows}
            onRowToggle={(e) =>
              handleRowToggle(e.data as DataTableExpandedRows)
            }
            rowExpansionTemplate={paymentDetailTemplate}
            emptyMessage="Aún no se le ha registrado ningún pago."
          >
            <Column expander style={{ width: "3rem" }} />
            <Column
              header="Semana"
              body={(s: Settlement) =>
                `${formatDay(s.start_date)} – ${formatDay(s.end_date)}`
              }
            />
            <Column
              header="A pagar"
              body={(s: Settlement) => formatMoney(s.total_to_pay)}
            />
            <Column
              header="Entregado"
              body={(s: Settlement) => (
                <strong>{formatMoney(s.amount_paid)}</strong>
              )}
            />
            <Column
              header="Quedó pendiente"
              body={(s: Settlement) =>
                Number(s.pending_balance) > 0 ? (
                  <span className="sf-tag clay">
                    {formatMoney(s.pending_balance)}
                  </span>
                ) : (
                  "—"
                )
              }
            />
          </DataTable>
        </TabPanel>
      </TabView>
    </Dialog>
  );
};

export default WorkerHistory;
