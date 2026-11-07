import { useState, type ReactNode } from "react";
import { Button } from "primereact/button";
import { SelectButton } from "primereact/selectbutton";
import { capitalizeWords } from "@/shared/lib/helpers";
import { useDashboard } from "../hooks/useDashboard";
import { WEEK_OPTIONS, type DashboardCards } from "../types/dashboard";
import { HBarList, StackBar, WeeklyBars } from "../components/DashboardCharts";
import { fmtDozens, fmtMoney, fmtMoneyShort } from "../components/format";
import "../components/dashboard.css";

interface CardProps {
  label: string;
  icon: string;
  value: string;
  unit?: string;
  note?: ReactNode;
  tone?: "moss" | "amber" | "clay";
}

const StatCard = ({ label, icon, value, unit, note, tone }: CardProps) => (
  <div className={`sfd-card ${tone ?? ""}`}>
    <div className="sfd-card-label">
      <i className={`pi ${icon}`} />
      {label}
    </div>
    <div className="sfd-card-value">
      {value}
      {unit && <span className="sfd-card-unit">{unit}</span>}
    </div>
    {note && <div className="sfd-card-note">{note}</div>}
  </div>
);

// Esta semana contra la anterior
const trend = (cards: DashboardCards) => {
  const last = cards.completed_last_week;
  if (last == null) return null;
  const diff = cards.completed_this_week - last;
  if (diff === 0) return <span>igual que la semana pasada</span>;
  return (
    <span className={diff > 0 ? "sfd-up" : "sfd-down"}>
      <i className={`pi ${diff > 0 ? "pi-arrow-up" : "pi-arrow-down"}`} style={{ fontSize: 10 }} /> {fmtDozens(Math.abs(diff))} vs semana pasada
    </span>
  );
};

const PRIORITIES = [
  { key: "URGENTE", label: "Urgente", color: "var(--sfd-red)" },
  { key: "ALTA", label: "Alta", color: "var(--sfd-amber)" },
  { key: "NORMAL", label: "Normal", color: "var(--sfd-moss)" },
  { key: "BAJA", label: "Baja", color: "color-mix(in srgb, currentColor 35%, transparent)" },
];

const ALERT_ICON = { warn: "pi-exclamation-triangle", danger: "pi-times-circle", info: "pi-info-circle" } as const;

export const DashboardPage = () => {
  const [weeks, setWeeks] = useState<number>(8);
  const { data, loading, error, reload } = useDashboard(weeks);

  // Spinner de pantalla completa solo mientras no hay datos; al cambiar el periodo se mantiene lo anterior
  if (!data) {
    return (
      <div className="sfd sfd-state">
        {error ? (
          <>
            <i className="pi pi-exclamation-circle" style={{ fontSize: "2rem" }} />
            <span>No se pudo cargar el dashboard.</span>
            <Button label="Reintentar" icon="pi pi-refresh" onClick={reload} outlined />
          </>
        ) : (
          <i className="pi pi-spin pi-spinner" style={{ fontSize: "2.5rem" }} />
        )}
      </div>
    );
  }

  const { cards } = data;
  const periodText = `últimas ${data.weeks} semanas`;
  const openTotal = data.by_priority.reduce((s, p) => s + p.dozens, 0);

  return (
    <div className="sfd" style={{ opacity: loading ? 0.6 : 1, transition: "opacity .2s" }}>
      <div className="sfd-head">
        <div>
          <h2 className="sfd-title">Resumen de producción</h2>
          <span className="sfd-sub">Todo en docenas (12 pares). Una docena de 6 pares cuenta 0.5.</span>
        </div>
        <div className="flex align-items-center gap-2 flex-wrap">
          <SelectButton
            value={weeks}
            onChange={(e) => e.value && setWeeks(e.value)}
            options={WEEK_OPTIONS.map((w) => ({ label: `${w} sem`, value: w }))}
            allowEmpty={false}
          />
          <Button icon="pi pi-refresh" rounded text severity="secondary" tooltip="Actualizar" onClick={reload} loading={loading} />
        </div>
      </div>

      {/* Alertas: solo si hay algo que atender */}
      {data.alerts.length > 0 && (
        <div className="sfd-alerts">
          {data.alerts.map((alert) => (
            <div className={`sfd-alert ${alert.level}`} key={alert.code}>
              <i className={`pi ${ALERT_ICON[alert.level]}`} />
              <span>{alert.text}</span>
            </div>
          ))}
        </div>
      )}

      <div className="sfd-cards">
        <StatCard label="En proceso" icon="pi-cog" value={fmtDozens(cards.in_process)} unit="doc." tone="amber" />
        <StatCard label="Pendientes" icon="pi-clock" value={fmtDozens(cards.pending)} unit="doc." note="Sin etapas asignadas" />
        <StatCard
          label="Terminadas"
          icon="pi-check-circle"
          value={fmtDozens(cards.completed_period)}
          unit="doc."
          tone="moss"
          note={<>Esta semana: {fmtDozens(cards.completed_this_week)} · {trend(cards)}</>}
        />
        <StatCard label="Registradas" icon="pi-plus-circle" value={fmtDozens(cards.registered_period)} unit="doc." note={periodText} />
        <StatCard
          label="Detenidas"
          icon="pi-pause-circle"
          value={fmtDozens(cards.stale)}
          unit="doc."
          tone={cards.stale > 0 ? "clay" : undefined}
          note="Sin movimiento hace 7 días o más"
        />
        <StatCard label="Por pagar" icon="pi-wallet" value={fmtMoney(cards.to_pay)} tone="amber" note="Trabajo terminado sin liquidar" />
        <StatCard label="Pagado" icon="pi-money-bill" value={fmtMoney(cards.paid_period)} note={periodText} />
        <StatCard
          label="Mano de obra"
          icon="pi-users"
          value={fmtMoney(cards.labor_cost_period)}
          note={
            cards.completed_period > 0
              ? `${fmtMoney(cards.labor_cost_period / cards.completed_period)} por docena terminada`
              : periodText
          }
        />
      </div>

      <div className="sfd-grid">
        <section className="sfd-panel sfd-span-8">
          <h3>Docenas por semana</h3>
          <p className="sfd-panel-sub">Lo que entra al taller contra lo que se termina.</p>
          <WeeklyBars
            data={data.weekly}
            format={fmtDozens}
            unit="doc."
            series={[
              { key: "registered", label: "Registradas", className: "a" },
              { key: "completed", label: "Terminadas", className: "b" },
            ]}
          />
        </section>

        <section className="sfd-panel sfd-span-4">
          <h3>Abiertas por prioridad</h3>
          <p className="sfd-panel-sub">{fmtDozens(openTotal)} docenas pendientes o en proceso.</p>
          <StackBar
            items={PRIORITIES.map((p) => ({
              ...p,
              value: data.by_priority.find((x) => x.key === p.key)?.dozens ?? 0,
            }))}
          />
          <h3 style={{ marginTop: "1.2rem" }}>Abiertas por modelo</h3>
          <p className="sfd-panel-sub">Los 6 con más docenas.</p>
          <HBarList
            color="clay"
            empty="No hay docenas abiertas."
            rows={data.by_model.map((m) => ({
              key: m.name,
              name: capitalizeWords(m.name),
              value: m.dozens,
              valueLabel: `${fmtDozens(m.dozens)} doc.`,
            }))}
          />
        </section>

        <section className="sfd-panel sfd-span-6">
          <h3>Dónde se acumula el trabajo</h3>
          <p className="sfd-panel-sub">Docenas que esperan cada etapa. Abajo, las que ya pasaron en el periodo.</p>
          <HBarList
            color="amber"
            rows={data.funnel.map((s) => ({
              key: s.id,
              name: s.name,
              value: s.waiting,
              valueLabel: `${fmtDozens(s.waiting)} doc.`,
              sub: `Hechas en el periodo: ${fmtDozens(s.done)}`,
            }))}
          />
        </section>

        <section className="sfd-panel sfd-span-6">
          <h3>Pagos por semana</h3>
          <p className="sfd-panel-sub">Lo entregado en cada liquidación.</p>
          <WeeklyBars data={data.weekly} format={fmtMoneyShort} series={[{ key: "paid", label: "Pagado", className: "c" }]} />
        </section>

        <section className="sfd-panel sfd-span-6">
          <h3>Quién produjo más</h3>
          <p className="sfd-panel-sub">Docenas por etapa terminada en el periodo ({periodText}).</p>
          <HBarList
            color="moss"
            empty="Nadie terminó etapas en este periodo."
            rows={data.top_workers.map((w) => ({
              key: w.name,
              name: capitalizeWords(w.name),
              value: w.dozens,
              valueLabel: `${fmtDozens(w.dozens)} doc.`,
              sub: `Ganó ${fmtMoney(w.amount)}`,
            }))}
          />
        </section>

        <section className="sfd-panel sfd-span-6">
          <h3>Pendiente de pago por trabajador</h3>
          <p className="sfd-panel-sub">Lo terminado que todavía no se liquida.</p>
          <HBarList
            color="amber"
            empty="Todo está al día."
            rows={data.pending_workers.map((w) => ({
              key: w.name,
              name: capitalizeWords(w.name),
              value: w.amount,
              valueLabel: fmtMoney(w.amount),
              sub: `${fmtDozens(w.dozens)} docenas por pagar`,
            }))}
          />
        </section>
      </div>
    </div>
  );
};

export default DashboardPage;
