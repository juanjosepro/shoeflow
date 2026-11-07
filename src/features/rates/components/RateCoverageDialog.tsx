import { useEffect, useState } from "react";
import { Dialog } from "primereact/dialog";
import { Column } from "primereact/column";
import { DataTable } from "primereact/datatable";
import { Message } from "primereact/message";
import { SelectButton } from "primereact/selectbutton";
import { toast } from "@/shared/lib/toast";
import { capitalizeWords } from "@/shared/lib/helpers";
import { rateService } from "../services/rateService";
import type { RateCoverage, RateCoverageGroup } from "../types/rate";

interface Props {
  visible: boolean;
  onHide: () => void;
}

type Filter = "all" | "missing" | "partial";

const RateCoverageDialog = ({ visible, onHide }: Props) => {
  const [coverage, setCoverage] = useState<RateCoverage | null>(null);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<Filter>("all");

  // Se recalcula cada vez que se abre: así refleja las tarifas recién creadas
  useEffect(() => {
    if (!visible) return;
    let ignore = false;

    const load = async () => {
      setLoading(true);
      setFilter("all");
      try {
        const data = await rateService.getCoverage();
        if (!ignore) setCoverage(data);
      } catch {
        if (!ignore) toast.error("No se pudo revisar la cobertura de tarifas.");
      } finally {
        if (!ignore) setLoading(false);
      }
    };

    load();
    return () => {
      ignore = true;
    };
  }, [visible]);

  const groups = (coverage?.groups ?? []).filter((g) => filter === "all" || g.status === filter);

  const filterOptions = [
    { label: "Todo", value: "all" },
    { label: `Sin tarifa (${coverage?.counts.missing ?? 0})`, value: "missing" },
    { label: `Parcial (${coverage?.counts.partial ?? 0})`, value: "partial" },
  ];

  const statusTag = (g: RateCoverageGroup) =>
    g.status === "missing" ? (
      <span className="sf-tag clay">Sin tarifa</span>
    ) : (
      <span className="sf-tag amber">Parcial</span>
    );

  const sizesCell = (g: RateCoverageGroup) =>
    g.all_sizes ? (
      <span>Todas las tallas</span>
    ) : (
      <div className="flex flex-wrap gap-1">
        {g.sizes.map((s) => (
          <span key={s.id} className="sf-tag">
            {s.name}
          </span>
        ))}
      </div>
    );

  const allGood = coverage && coverage.counts.missing === 0 && coverage.counts.partial === 0;

  return (
    <Dialog
      visible={visible}
      onHide={onHide}
      header="Cobertura de tarifas"
      className="sf-dialog"
      style={{ width: "65vw" }}
      breakpoints={{ "960px": "90vw", "641px": "100vw" }}
      maskStyle={{ backdropFilter: "blur(4px)" }}
    >
      {coverage && (
        <p style={{ fontSize: 13.5, margin: "0 0 12px" }}>
          <strong>{coverage.counts.covered}</strong> de {coverage.total} combinaciones (etapa, modelo y talla)
          tienen precio asegurado.
        </p>
      )}

      {allGood ? (
        <Message
          severity="success"
          className="w-full justify-content-start"
          text="Todas las combinaciones de etapas, modelos y tallas activos tienen tarifa."
        />
      ) : (
        <>
          <div className="mb-3">
            <SelectButton
              value={filter}
              options={filterOptions}
              onChange={(e) => e.value && setFilter(e.value)}
              allowEmpty={false}
            />
          </div>

          <DataTable
            value={groups}
            loading={loading}
            size="small"
            className="sf-table"
            paginator
            rows={12}
            emptyMessage="No hay combinaciones en esta categoría."
          >
            <Column field="specialty_name" header="Etapa" />
            <Column header="Modelo" body={(g: RateCoverageGroup) => capitalizeWords(g.model_name)} />
            <Column header="Estado" body={statusTag} />
            <Column header="Tallas" body={sizesCell} />
          </DataTable>

          <small className="block mt-3" style={{ color: "var(--sf-stone)" }}>
            <strong>Sin tarifa:</strong> ninguna regla aplica y la etapa no se podrá asignar. <strong>Parcial:</strong>{" "}
            solo hay tarifas para ciertos materiales o plantas; una docena con otro material no tendría precio.
            Se revisan solo etapas, modelos y tallas activos.
          </small>
        </>
      )}
    </Dialog>
  );
};

export default RateCoverageDialog;
