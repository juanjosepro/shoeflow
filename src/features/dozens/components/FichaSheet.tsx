import type { CSSProperties } from "react";
import { QRCodeSVG } from "qrcode.react";
import dayjs from "@/shared/lib/dayjs";
import { capitalizeWords } from "@/shared/lib/helpers";
import type { Dozen } from "../types/dozen";
import type { Stage } from "../services/stageService";
import { getStageProgress } from "../utils/stageProgress";
import "./ficha.css";

// "single": una ficha por página (A6 apaisado, 148 x 105 mm).
// "sheet4": cuatro fichas en una hoja A4 apaisada, para imprimir y recortar.
export type FichaMode = "single" | "sheet4";

// Tamaño de cada ficha. Para pasar a A5 apaisado (210 x 148) cambia "single" a 210mm / 148mm
// y el @page de abajo; el diseño se estira solo.
const FICHA_SIZE: Record<FichaMode, { w: string; h: string }> = {
  single: { w: "148mm", h: "105mm" },
  sheet4: { w: "142mm", h: "98mm" },
};

const PAGE_RULE: Record<FichaMode, string> = {
  single: "@page { size: 148mm 105mm; margin: 0; }",
  sheet4: "@page { size: A4 landscape; margin: 0; }",
};

const PER_PAGE: Record<FichaMode, number> = { single: 1, sheet4: 4 };

const formatShort = (value?: string | null) =>
  value && dayjs(value).isValid() ? dayjs(value).format("DD/MM/YY") : "";

const chunk = <T,>(items: T[], size: number) => {
  const out: T[][] = [];
  for (let i = 0; i < items.length; i += size)
    out.push(items.slice(i, i + size));
  return out;
};

interface FichaProps {
  dozen: Dozen;
  stages: Stage[];
  mode: FichaMode;
}

const Ficha = ({ dozen, stages, mode }: FichaProps) => {
  const size = FICHA_SIZE[mode];
  const style = { "--fw": size.w, "--fh": size.h } as CSSProperties;

  // Serie de tallas "38×2 · 39×3 · 40×7"; si no hay, no se muestra
  const runText = dozen.size_run
    ? Object.entries(dozen.size_run)
        .sort(([a], [b]) => Number(a) - Number(b))
        .map(([size, pairs]) => `${pairs}×${size}`)
        .join(" · ")
    : "";

  // Etapas alternativas: "Armado completo o Armador + Pegador" (solo se anota una vez por grupo)
  const byId = new Map(stages.map((s) => [s.id, s]));
  const altNotes = stages
    .filter((s) => (s.excludes ?? []).length > 0)
    .filter((s) =>
      (s.excludes ?? []).every(
        (id) => (byId.get(id)?.order ?? Infinity) > s.order,
      ),
    )
    .map(
      (s) =>
        `${s.name} o ${(s.excludes ?? [])
          .map((id) => byId.get(id)?.name)
          .filter(Boolean)
          .join(" + ")}`,
    );
  const notApplicable = getStageProgress(
    stages,
    (dozen.assignments ?? []).map((a) => a.specialty.id),
  ).notApplicable;

  const prio = dozen.priority?.toUpperCase();
  const isUrgent = prio === "URGENTE";
  const isHigh = prio === "ALTA";

  return (
    <div className="ficha" style={style}>
      <div className="ficha-head">
        <div style={{ minWidth: 0 }}>
          <div className="ficha-code">{dozen.code}</div>
          <div className="ficha-model">
            {capitalizeWords(dozen.model?.name)}
          </div>
        </div>
        {/* El QR guarda solo el código: un lector USB lo "teclea" y abre la docena */}
        <div className="ficha-qr">
          <QRCodeSVG value={dozen.code} level="M" />
        </div>
      </div>

      <div className="ficha-data">
        <span>
          <b>Talla</b> {dozen.size?.name}
          {dozen.size?.description ? ` (${dozen.size.description})` : ""}
        </span>
        <span>
          <b>Material</b> {capitalizeWords(dozen.material_type?.name)}
        </span>
        <span>
          <b>Planta</b> {capitalizeWords(dozen.plant_type?.name)}
        </span>
        <span>
          <span
            className="ficha-dot"
            style={{ background: dozen.color?.hex_code }}
          />
          <b>Color</b> {capitalizeWords(dozen.color?.name)}
        </span>
        <span>
          <b>Pares</b> {dozen.pairs}
        </span>
        {runText && (
          <span className="ficha-run">
            <b>Serie</b> {runText}
          </span>
        )}
        {(isUrgent || isHigh) && (
          <span className={`ficha-prio ${isUrgent ? "urgent" : ""}`}>
            {prio}
          </span>
        )}
        <span>
          <b>Reg.</b> {formatShort(dozen.registered_at)}
        </span>
      </div>

      <div className="ficha-table">
        <div className="ficha-row head">
          <div className="ficha-cell">Etapa</div>
          <div className="ficha-cell">DNI</div>
          <div className="ficha-cell">Nombre</div>
          <div className="ficha-cell">Fecha</div>
          <div className="ficha-cell">Inicio</div>
          <div className="ficha-cell">Fin</div>
        </div>

        {stages.map((stage) => {
          // Si la ficha se reimprime con etapas ya registradas, salen marcadas
          const done = dozen.assignments?.find(
            (a) => a.specialty.id === stage.id,
          );
          return done ? (
            <div className="ficha-row done" key={stage.id}>
              <div className="ficha-cell">{stage.name}</div>
              <div className="ficha-cell">Registrado</div>
              <div className="ficha-cell">{done.worker.names}</div>
              <div className="ficha-cell">{formatShort(done.completed_at)}</div>
              <div className="ficha-cell" />
              <div className="ficha-cell" />
            </div>
          ) : (
            <div className="ficha-row" key={stage.id}>
              <div className="ficha-cell">
                {stage.name}
                {(stage.excludes ?? []).length > 0 ? " *" : ""}
              </div>
              <div className="ficha-cell">
                {notApplicable.has(stage.id) ? "No aplica" : ""}
              </div>
              <div className="ficha-cell" />
              <div className="ficha-cell" />
              <div className="ficha-cell" />
              <div className="ficha-cell" />
            </div>
          );
        })}
      </div>

      {altNotes.length > 0 && (
        <div className="ficha-obs">
          * Se usa una u otra: {altNotes.join("; ")}
        </div>
      )}
      <div className="ficha-obs">Observaciones:</div>
    </div>
  );
};

interface Props {
  dozens: Dozen[];
  stages: Stage[];
  mode: FichaMode;
}

// Se monta solo mientras se imprime (ver useFichaPrint)
const FichaSheet = ({ dozens, stages, mode }: Props) => (
  <div className="ficha-print-root">
    {/* Solo existe durante la impresión, así no afecta a otras impresiones de la app */}
    <style>{PAGE_RULE[mode]}</style>
    {chunk(dozens, PER_PAGE[mode]).map((group, i) => (
      <div className={`ficha-page ${mode}`} key={i}>
        {group.map((dozen) => (
          <Ficha key={dozen.id} dozen={dozen} stages={stages} mode={mode} />
        ))}
      </div>
    ))}
  </div>
);

export default FichaSheet;
