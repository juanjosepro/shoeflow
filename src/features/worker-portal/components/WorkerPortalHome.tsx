import { useEffect, useState } from "react";
import { Button } from "primereact/button";
import { toast } from "@/shared/lib/toast";
import WorkerHistoryView from "@/features/workers/components/WorkerHistoryView";
import { formatDay, formatMoney, getApiError } from "@/features/workers/utils/format";
import type { Settlement } from "@/features/workers/types/payment";
import { portalService } from "../services/portalService";
import type { PortalAssignment, PortalSession, PortalSummary } from "../types/portal";

interface Props {
  session: PortalSession;
  onLogout: () => void; // debe ser estable (useCallback)
}

const WorkerPortalHome = ({ session, onLogout }: Props) => {
  const [summary, setSummary] = useState<PortalSummary | null>(null);
  const [assignments, setAssignments] = useState<PortalAssignment[]>([]);
  const [payments, setPayments] = useState<Settlement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let ignore = false;

    const load = async () => {
      setLoading(true);
      try {
        const [s, a, p] = await Promise.all([
          portalService.getSummary(),
          portalService.getAssignments(),
          portalService.getPayments(),
        ]);
        if (ignore) return;
        setSummary(s);
        setAssignments(a);
        setPayments(p);
      } catch (error: any) {
        if (ignore) return;
        if (error?.response?.status === 401) {
          // Sesión vencida o trabajador desactivado
          toast.error("Tu sesión venció. Ingresa de nuevo con tu DNI.");
          onLogout();
        } else {
          toast.error(getApiError(error, "No se pudo cargar tu información."));
        }
      } finally {
        if (!ignore) setLoading(false);
      }
    };

    load();
    return () => {
      ignore = true;
    };
  }, [onLogout]);

  const adjustmentsTotal = Number(summary?.total_adjustments ?? 0);

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: 16 }}>
      <div className="flex align-items-center justify-content-between gap-2 pb-3">
        <div>
          <p style={{ fontSize: 13, color: "var(--sf-stone)", margin: 0 }}>Shoeflow</p>
          <h1 style={{ fontSize: 20, fontWeight: 600, margin: 0 }}>{session.worker.names}</h1>
        </div>
        <Button label="Salir" icon="pi pi-sign-out" className="p-button-sm p-button-text" onClick={onLogout} />
      </div>

      {loading && !summary ? (
        <div className="flex justify-content-center p-5">
          <i className="pi pi-spin pi-spinner" style={{ fontSize: "2rem" }} />
        </div>
      ) : (
        <>
          {summary && (
            <div className="p-3 sf-border-line border-round-lg mb-3">
              <p style={{ fontSize: 13, color: "var(--sf-ink-2)", margin: 0 }}>Te corresponde cobrar</p>
              <p className="mono" style={{ fontSize: 30, fontWeight: 600, margin: "2px 0 8px" }}>
                {formatMoney(summary.total_to_pay)}
              </p>

              <div className="flex flex-wrap gap-4" style={{ fontSize: 13.5 }}>
                <span>
                  Trabajo pendiente: <strong>{formatMoney(summary.total_earned)}</strong>{" "}
                  <span style={{ color: "var(--sf-stone)" }}>({summary.pending_count} etapas)</span>
                </span>
                {summary.pending_adjustments.length > 0 && (
                  <span>
                    Ajustes: <strong>{formatMoney(adjustmentsTotal)}</strong>
                  </span>
                )}
              </div>

              {summary.pending_weeks.length > 0 && (
                <div className="mt-3">
                  <p style={{ fontSize: 12.5, color: "var(--sf-stone)", margin: "0 0 4px" }}>Por semana</p>
                  {summary.pending_weeks.map((w) => (
                    <div key={w.start_date} className="flex justify-content-between" style={{ fontSize: 13.5 }}>
                      <span>
                        {formatDay(w.start_date)} – {formatDay(w.end_date)}
                      </span>
                      <strong>{formatMoney(w.amount)}</strong>
                    </div>
                  ))}
                </div>
              )}

              {summary.pending_adjustments.length > 0 && (
                <div className="mt-3">
                  <p style={{ fontSize: 12.5, color: "var(--sf-stone)", margin: "0 0 4px" }}>
                    Bonos, descuentos y adelantos pendientes
                  </p>
                  {summary.pending_adjustments.map((a) => (
                    <div key={a.id} className="flex justify-content-between gap-3" style={{ fontSize: 13.5 }}>
                      <span>
                        {a.type_label}
                        {a.reason ? ` · ${a.reason}` : ""}
                      </span>
                      <strong style={{ color: Number(a.signed_amount) < 0 ? "var(--sf-clay)" : undefined }}>
                        {formatMoney(a.signed_amount)}
                      </strong>
                    </div>
                  ))}
                </div>
              )}

              {summary.last_payment && (
                <p style={{ fontSize: 13, color: "var(--sf-ink-2)", margin: "14px 0 0" }}>
                  Último pago: {formatDay(summary.last_payment.start_date)} –{" "}
                  {formatDay(summary.last_payment.end_date)} ·{" "}
                  <strong>{formatMoney(summary.last_payment.amount_paid)}</strong>
                </p>
              )}
            </div>
          )}

          <div className="p-2 sf-border-line border-round-lg">
            <WorkerHistoryView
              assignments={assignments}
              settlements={payments}
              loading={loading}
              loadDetail={portalService.getPaymentDetail}
            />
          </div>
        </>
      )}
    </div>
  );
};

export default WorkerPortalHome;
