import { useState } from "react";
import { Button } from "primereact/button";
import { InputNumber } from "primereact/inputnumber";

interface Row {
  size: number | null;
  pairs: number | null;
}

interface Props {
  value: Record<string, number> | null | undefined; // valor inicial (usar `key` para reiniciar)
  totalPairs: number; // pares de la docena: la serie debe sumarlos
  onChange: (value: Record<string, number> | null) => void;
  error?: string;
}

const toRows = (value: Props["value"]): Row[] =>
  Object.entries(value ?? {})
    .map(([size, pairs]) => ({ size: Number(size), pairs }))
    .sort((a, b) => (a.size ?? 0) - (b.size ?? 0));

// Editor opcional de la serie de tallas: filas "talla / pares" con contador en vivo
const SizeRunEditor = ({ value, totalPairs, onChange, error }: Props) => {
  const [rows, setRows] = useState<Row[]>(() => toRows(value));

  const emit = (next: Row[]) => {
    setRows(next);
    const record: Record<string, number> = {};
    next.forEach((row) => {
      if (row.size && row.pairs) record[String(row.size)] = row.pairs;
    });
    onChange(Object.keys(record).length ? record : null);
  };

  const update = (index: number, patch: Partial<Row>) =>
    emit(rows.map((row, i) => (i === index ? { ...row, ...patch } : row)));

  const sum = rows.reduce((acc, row) => acc + (row.pairs ?? 0), 0);
  const sizes = rows.map((r) => r.size).filter((s): s is number => s != null);
  const hasDuplicates = new Set(sizes).size !== sizes.length;
  const matches = sum === totalPairs;

  return (
    <div className="flex flex-column gap-2">
      <div className="flex align-items-center justify-content-between">
        <label className="font-bold">Serie de tallas (opcional)</label>
        {rows.length > 0 && (
          <span
            className="mono text-sm"
            style={{ color: matches ? "var(--sf-moss, inherit)" : "var(--sf-amber, inherit)" }}
          >
            {sum} / {totalPairs} pares
          </span>
        )}
      </div>

      {rows.length === 0 && (
        <small style={{ color: "var(--ink-2)" }}>
          Si la docena mezcla tallas (ej. 2 pares de 38, 3 de 39…), agrégalas aquí.<br /> Si no, déjalo vacío.
        </small>
      )}

      {rows.map((row, index) => (
        <div key={index} className="flex align-items-center gap-2">
          <InputNumber
            value={row.pairs}
            onValueChange={(e) => update(index, { pairs: e.value ?? null })}
            placeholder="Pares"
            min={1}
            max={12}
            useGrouping={false}
            className="flex-1"
          />
          <span>×</span>
          <InputNumber
            value={row.size}
            onValueChange={(e) => update(index, { size: e.value ?? null })}
            placeholder="Talla"
            min={1}
            max={99}
            useGrouping={false}
            className="flex-1"
          />
          <Button
            type="button"
            icon="pi pi-trash"
            text
            rounded
            severity="danger"
            onClick={() => emit(rows.filter((_, i) => i !== index))}
          />
        </div>
      ))}

      <div>
        <Button
          type="button"
          label="Agregar talla"
          icon="pi pi-plus"
          size="small"
          outlined
          severity="secondary"
          onClick={() => setRows([...rows, { size: null, pairs: null }])}
        />
      </div>

      {hasDuplicates && <small className="p-error">Hay tallas repetidas.</small>}
      {rows.length > 0 && !matches && !error && (
        <small className="p-error">La serie debe sumar {totalPairs} pares.</small>
      )}
      {error && <small className="p-error">{error}</small>}
    </div>
  );
};

export default SizeRunEditor;
