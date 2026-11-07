import dayjs from "@/shared/lib/dayjs";
import { fmtDozens } from "./format";
import type { WeekPoint } from "../types/dashboard";

// ── Barras verticales por semana (hasta 2 series agrupadas) ─────────────────
interface SeriesDef {
  key: "registered" | "completed" | "paid";
  label: string;
  className: "a" | "b" | "c";
}

interface WeeklyProps {
  data: WeekPoint[];
  series: SeriesDef[];
  format: (value: number) => string;
  unit?: string;
}

export const WeeklyBars = ({ data, series, format, unit }: WeeklyProps) => {
  const max = Math.max(1, ...data.flatMap((w) => series.map((s) => w[s.key])));
  // Con muchas semanas solo se rotulan algunas para que quepan en celular
  const step = data.length > 12 ? 4 : data.length > 8 ? 2 : 1;

  return (
    <>
      <div className="sfd-bars" role="img" aria-label="Gráfico de barras por semana">
        {data.map((week) => (
          <div className="sfd-bar-group" key={week.week_start}>
            {series.map((s) => (
              <div
                key={s.key}
                className={`sfd-bar ${s.className}`}
                style={{ height: `${(week[s.key] / max) * 100}%` }}
                title={`Semana del ${dayjs(week.week_start).format("D MMM")} · ${s.label}: ${format(week[s.key])}${unit ? ` ${unit}` : ""}`}
              />
            ))}
          </div>
        ))}
      </div>
      <div className="sfd-xlabels">
        {data.map((week, i) => (
          <span key={week.week_start}>{i % step === (data.length - 1) % step ? dayjs(week.week_start).format("D MMM") : ""}</span>
        ))}
      </div>
      <div className="sfd-legend">
        {series.map((s) => (
          <span key={s.key}>
            <span className="sfd-dot" style={{ background: `var(--sfd-${s.className === "a" ? "clay" : s.className === "b" ? "moss" : "amber"})` }} />
            {s.label}
          </span>
        ))}
      </div>
    </>
  );
};

// ── Lista de barras horizontales ────────────────────────────────────────────
export interface HRow {
  key: string | number;
  name: string;
  value: number;
  valueLabel: string;
  sub?: string;
}

interface HListProps {
  rows: HRow[];
  color?: "moss" | "amber" | "clay";
  empty?: string;
}

export const HBarList = ({ rows, color = "clay", empty = "Sin datos todavía." }: HListProps) => {
  if (rows.length === 0) return <div className="sfd-empty">{empty}</div>;
  const max = Math.max(...rows.map((r) => r.value), 0.0001);
  return (
    <div className="sfd-hlist">
      {rows.map((row) => (
        <div key={row.key}>
          <div className="sfd-hrow-top">
            <span className="sfd-hrow-name">{row.name}</span>
            <b>{row.valueLabel}</b>
          </div>
          <div className="sfd-track">
            <div className={`sfd-fill ${color}`} style={{ width: `${(row.value / max) * 100}%` }} />
          </div>
          {row.sub && <div className="sfd-hrow-sub">{row.sub}</div>}
        </div>
      ))}
    </div>
  );
};

// ── Barra apilada con leyenda (prioridades) ─────────────────────────────────
interface StackItem {
  key: string;
  label: string;
  value: number;
  color: string;
}

export const StackBar = ({ items }: { items: StackItem[] }) => {
  const total = items.reduce((sum, i) => sum + i.value, 0);
  if (total === 0) return <div className="sfd-empty">No hay docenas abiertas.</div>;
  return (
    <>
      <div className="sfd-stack">
        {items
          .filter((i) => i.value > 0)
          .map((i) => (
            <span key={i.key} style={{ width: `${(i.value / total) * 100}%`, background: i.color }} title={`${i.label}: ${fmtDozens(i.value)}`} />
          ))}
      </div>
      <div className="sfd-legend">
        {items.map((i) => (
          <span key={i.key}>
            <span className="sfd-dot" style={{ background: i.color }} />
            {i.label} <b className="mono">{fmtDozens(i.value)}</b>
          </span>
        ))}
      </div>
    </>
  );
};
