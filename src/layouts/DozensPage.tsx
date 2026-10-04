import { useMemo, useState } from "react";
import { InputText } from "primereact/inputtext";
import { Accordion, AccordionTab } from "primereact/accordion";
import { Button } from "primereact/button";
import "./DozensPage.scss";

// Las "estaciones" representan el traspaso entre áreas: qué docenas
// terminaron un área y están esperando ser asignadas a la siguiente.
const STATIONS = [
  { key: "all", name: "Todas", count: 42 },
  { key: "CORTADO", name: "Corte", count: 6 },
  { key: "APARADO", name: "Aparado → Armado", count: 4 },
  { key: "ARMADO", name: "Armado → Rematado", count: 3 },
  { key: "REMATADO", name: "Rematado → Calidad", count: 2 },
  { key: "CONTROL_DE_CALIDAD", name: "Control de calidad", count: 5 },
];

const STATUS_LABEL = {
  unassigned: { label: "Sin asignar", cls: "amber" },
  in_progress: { label: "En proceso", cls: "moss" },
  delayed: { label: "Retrasado", cls: "clay" },
};

// Datos de ejemplo — reemplazar por el resultado real de
// GET /api/dozen-stage-assignments/?stage=APARADO (agrupado por semana en backend o frontend)
const MOCK_WEEKS = [
  {
    title: "Esta semana",
    label: "del 22 al 28 de septiembre",
    items: [
      {
        code: "AIR-0142",
        model: "Air Force",
        size: "42",
        material: "Cuero",
        color: "#2B2620",
        meta: "Aparado por María López · terminó ayer",
        status: "unassigned",
      },
      {
        code: "DOM-0087",
        model: "Dominante",
        size: "40",
        material: "Gamusa",
        color: "#8C4A2F",
        meta: "Aparado por Rosa Díaz · terminó hoy, 9:10 a.m.",
        status: "unassigned",
      },
      {
        code: "DOM-0088",
        model: "Dominante",
        size: "40",
        material: "Sintético",
        color: "#3A5A78",
        meta: "Asignado a Luis Vega · en armado desde hoy, 8:40 a.m.",
        status: "in_progress",
      },
    ],
  },
  {
    title: "Semana pasada",
    label: "del 15 al 21 de septiembre",
    items: [
      {
        code: "AIR-0139",
        model: "Air Force",
        size: "43",
        material: "Cuero",
        color: "#2B2620",
        meta: "Aparado por María López · terminó el 19 de sep.",
        status: "delayed",
      },
    ],
  },
];

export const DozensPage = () => {
  const [activeStation, setActiveStation] = useState("APARADO");
  const [search, setSearch] = useState("");

  const activeStationData = STATIONS.find((s) => s.key === activeStation);

  const filteredWeeks = useMemo(() => {
    if (!search) return MOCK_WEEKS;
    const q = search.toLowerCase();
    return MOCK_WEEKS.map((week) => ({
      ...week,
      items: week.items.filter((item) => item.code.toLowerCase().includes(q)),
    })).filter((week) => week.items.length > 0);
  }, [search]);

  return (
    <div className="dozens-layout" style={{ display: "flex", gap: 32 }}>
      {/* Filtro por estación (secundario a la navegación principal) */}
      <div className="dozens-stations" style={{ width: 176, flexShrink: 0 }}>
        <p style={{ fontSize: 12, color: "var(--stone)", margin: "0 0 10px" }}>
          Docenas en proceso
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          {STATIONS.map((s) => (
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
                borderLeft: `2px solid ${activeStation === s.key ? "var(--clay)" : "transparent"}`,
                background:
                  activeStation === s.key ? "var(--clay-light)" : "transparent",
                cursor: "pointer",
                textAlign: "left",
                width: "100%",
              }}
            >
              <span
                style={{ fontSize: 13.5, fontWeight: 500, color: "var(--ink)" }}
              >
                {s.name}
              </span>
              <span
                className="mono"
                style={{
                  fontSize: 12,
                  color:
                    activeStation === s.key ? "var(--clay)" : "var(--stone)",
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
      <div style={{ flex: 1, minWidth: 0 }}>
        <span
          className="p-input-icon-left sf-search"
          style={{ display: "block", marginBottom: 6 }}
        >
          <i className="pi pi-search" />
          <InputText
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por código, ej. AIR-0012"
            style={{ width: "100%" }}
          />
        </span>

        <h2 style={{ fontSize: 19, fontWeight: 600, margin: "22px 0 4px" }}>
          Listas para {activeStationData?.name.split(" → ")[1] || "asignar"}
        </h2>
        <p style={{ fontSize: 13, color: "var(--ink-2)", margin: "0 0 22px" }}>
          Estas docenas ya terminaron la etapa anterior y esperan un trabajador.{" "}
          {activeStationData?.count} pendientes.
        </p>

        <Accordion multiple activeIndex={[0]} className="sf-accordion">
          {filteredWeeks.map((week, i) => (
            <AccordionTab
              key={i}
              header={
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    width: "100%",
                    alignItems: "center",
                  }}
                >
                  <span>
                    <strong style={{ fontSize: 14 }}>{week.title}</strong>{" "}
                    <span style={{ fontSize: 12.5, color: "var(--stone)" }}>
                      {week.label}
                    </span>
                  </span>
                  <span
                    className="mono"
                    style={{
                      fontSize: 12,
                      border: "1px solid var(--line)",
                      borderRadius: 20,
                      padding: "3px 10px",
                    }}
                  >
                    {week.items.length}
                  </span>
                </div>
              }
            >
              {week.items.map((item, j) => {
                const st = STATUS_LABEL[item.status];
                return (
                  <div
                    key={j}
                    className="dozen-row"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 14,
                      padding: "12px 18px",
                      borderTop: j > 0 ? "1px solid var(--line)" : "none",
                    }}
                  >
                    <span
                      style={{
                        width: 10,
                        height: 10,
                        borderRadius: "50%",
                        background: item.color,
                        flexShrink: 0,
                      }}
                    />
                    <div
                      className="dozen-row-main"
                      style={{ flex: 1, minWidth: 0 }}
                    >
                      <div style={{ fontSize: 13.5, fontWeight: 500 }}>
                        {item.model}{" "}
                        <span
                          className="mono"
                          style={{
                            fontSize: 12,
                            color: "var(--stone)",
                            fontWeight: 400,
                          }}
                        >
                          {item.code}
                        </span>
                      </div>
                      <div style={{ fontSize: 12, color: "var(--stone)" }}>
                        Talla {item.size} · {item.material} · {item.meta}
                      </div>
                    </div>
                    <span className={`sf-tag ${st.cls}`}>{st.label}</span>
                    <Button
                      label={
                        item.status === "in_progress"
                          ? "Ver detalle"
                          : "Asignar armador"
                      }
                      className={`sf-btn p-button-sm ${item.status === "in_progress" ? "ghost" : ""}`}
                      onClick={() => {
                        // POST /api/dozen-stage-assignments/deliver/  { dozen_id, stage, worker_id }
                      }}
                    />
                  </div>
                );
              })}
            </AccordionTab>
          ))}
        </Accordion>
      </div>
    </div>
  );
};

export default DozensPage;
