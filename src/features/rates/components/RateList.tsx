import { Button } from "primereact/button";
import { Column } from "primereact/column";
import { DataTable } from "primereact/datatable";
import { RATES_PAGE_SIZE } from "../hooks/useRates";
import type { Rate } from "../types/rate";

interface Props {
  rates: Rate[];
  loading: boolean;
  header: React.ReactNode; // los filtros
  onEdit: (rate: Rate) => void;
  onDelete: (rate: Rate) => void;
  totalRecords: number;
  first: number;
  onPageChange: (page: number) => void;
}

const money = (value: string) => `S/ ${Number(value).toFixed(2)}`;

export const RateList = ({
  rates,
  loading,
  header,
  onEdit,
  onDelete,
  totalRecords,
  first,
  onPageChange,
}: Props) => {
  // Las condiciones que define la regla; si no define ninguna, es la tarifa general de la etapa
  const conditionsBodyTemplate = (rate: Rate) => {
    const conditions = [
      rate.model_name && `Modelo ${rate.model_name}`,
      rate.size_name && `Talla ${rate.size_name}`,
      rate.material_type_name && rate.material_type_name,
      rate.plant_type_name && `Planta ${rate.plant_type_name}`,
    ].filter(Boolean) as string[];

    if (conditions.length === 0) {
      return <span className="sf-tag moss">General (cualquier docena)</span>;
    }

    return (
      <div className="flex flex-wrap gap-2">
        {conditions.map((condition) => (
          <span key={condition} className="sf-tag amber">
            {condition}
          </span>
        ))}
      </div>
    );
  };

  const actionsBodyTemplate = (rate: Rate) => (
    <div className="flex gap-1 justify-content-end">
      <Button
        icon="pi pi-pencil"
        text
        severity="secondary"
        size="small"
        className="p-1"
        tooltip="Editar"
        tooltipOptions={{ position: "top" }}
        onClick={() => onEdit(rate)}
      />
      <Button
        icon="pi pi-trash"
        text
        severity="secondary"
        size="small"
        className="p-0"
        tooltip="Eliminar"
        tooltipOptions={{ position: "top" }}
        onClick={() => onDelete(rate)}
      />
    </div>
  );

  return (
    <DataTable
      value={rates}
      lazy
      paginator
      first={first}
      rows={RATES_PAGE_SIZE}
      totalRecords={totalRecords}
      onPage={(e) => onPageChange(e.first / e.rows + 1)}
      loading={loading}
      header={header}
      dataKey="id"
      emptyMessage="No hay tarifas con estos filtros."
      className="sf-table"
    >
      <Column
        field="specialty_name"
        header="Etapa"
        style={{ minWidth: "10rem" }}
      />
      <Column
        header="Se aplica a"
        body={conditionsBodyTemplate}
        style={{ minWidth: "16rem" }}
      />
      <Column
        header="Precio por docena"
        body={(rate: Rate) => <strong>{money(rate.price)}</strong>}
        style={{ minWidth: "10rem" }}
      />
      <Column body={actionsBodyTemplate} style={{ width: "8rem" }} />
    </DataTable>
  );
};
