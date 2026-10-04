import { useState } from "react";

import dayjs from "@/shared/lib/dayjs";

import type { Model } from "@/features/models/types/model";

import type { Dozen, DozenMetadata, DozenQueryParams } from "../types/dozen";

import { useDozenFilters } from "../hooks/useDozenFilters";

import DozenTableFilters from "./DozenTableFilters";
import DozenDetailDialog from "./DozenDetailDialog";

import { Column, type ColumnBodyOptions } from "primereact/column";
import { DataTable } from "primereact/datatable";
import type {
  DataTablePageEvent,
  DataTableSelectionSingleChangeEvent,
  DataTableSelectEvent,
} from "primereact/datatable";
import { capitalizeWords } from "@/shared/lib/helpers";

interface Props {
  models: Model[];
  dozens: Dozen[];
  total: number;
  loading: boolean;
  queryParams: DozenQueryParams;
  setQueryParams: React.Dispatch<React.SetStateAction<DozenQueryParams>>;
  metadata: DozenMetadata | null;
}

const DozenListTable = ({
  models,
  dozens,
  total,
  loading,
  queryParams,
  setQueryParams,
  metadata,
}: Props) => {
  const [selectedDozen, setSelectedDozen] = useState<Dozen | null>(null);

  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);

  const { onSearchChange, onFilterChange, clearFilters, hasActiveFilters } =
    useDozenFilters({
      queryParams,
      setQueryParams,
    });

  /*
   * ==========================================
   * PAGINATION
   * ==========================================
   */
  const onPageChange = (event: DataTablePageEvent) => {
    setQueryParams((prev) => ({
      ...prev,
      page: event.page + 1,
      limit: event.rows,
    }));
  };

  /*
   * ==========================================
   * ROW SELECTION
   * ==========================================
   */

  const onRowSelect = (event: DataTableSelectEvent) => {
    setSelectedDozen(event.data);
    setIsDetailDialogOpen(true);

    // Si posteriormente el listado no incluye
    // assignments, aquí  solicitar el detalle:
    //
    // api.get(`/dozens/${event.data.id}/`)
    //   .then((response) => {
    //     setSelectedDozen(response.data);
    //   });
  };

  const onSelectionChange = (
    event: DataTableSelectionSingleChangeEvent<Dozen>,
  ) => {
    setSelectedDozen(event.value);
  };

  /*
   * ==========================================
   * EMPTY MESSAGE
   * ==========================================
   */

  const emptyMessage = hasActiveFilters
    ? "No se encontraron docenas con los filtros seleccionados."
    : "No hay docenas registradas.";

  /*
   * ==========================================
   * TABLE TEMPLATES
   * ==========================================
   */
  const numberBodyTemplate = (
    _rowData: Dozen,
    options: ColumnBodyOptions
  ) => {
    return options.rowIndex + 1;
  };

  const colorBodyTemplate = (rowData: Dozen) => (
    <span>{capitalizeWords(rowData.color)}</span>
  );
  const modelBodyTemplate = (rowData: Dozen) => (
    <span>{capitalizeWords(rowData.variant.model.name)}</span>
  );
  
  const materialBodyTemplate = (rowData: Dozen) => (
    <span>{capitalizeWords(rowData.material)}</span>
  );
  
  const processBodyTemplate = (rowData: Dozen) => (
    <span>{capitalizeWords(rowData.status)}</span>
  );

  const statusBodyTemplate = (rowData: Dozen) => (
    <span
      className={`sf-tag ${rowData.is_active ? "moss" : "clay"}`}
      style={{
        display: "inline-block",
        width: 80,
        textAlign: "center",
      }}
    >
      {rowData.is_active ? "Activo" : "Inactivo"}
    </span>
  );

  const registeredAtBodyTemplate = (rowData: Dozen) => {
    if (!rowData.registered_at) {
      return "—";
    }

    const date = dayjs(rowData.registered_at);

    return date.isValid() ? date.format("D [de] MMMM [de] YYYY") : "—";
  };

  const codeBodyTemplate = (rowData: Dozen) => (
    <div className="flex flex-column gap-1">
      <span className="mono">{rowData.code}</span>
  
      {rowData.registration_group && (
        <small
          className="mono"
          style={{
            color: "var(--sf-stone)",
            fontSize: "0.7rem",
          }}
        >
          {rowData.registration_group}
        </small>
      )}
    </div>
  );

  const sizeTemplate = (rowData: Dozen) => (
    <div className="flex align-items-center flex-column gap-1">
      <span>{rowData.variant.size.name} <small style={{color: "var(--sf-stone)"}}>({rowData.variant.size.description})</small></span>
      
    </div>
  );

  /*
   * ==========================================
   * RENDER
   * ==========================================
   */

  return (
    <>
      <DataTable
        value={dozens}
        lazy
        paginator
        rowsPerPageOptions={[15, 30, 50, 100]}
        first={(queryParams.page - 1) * queryParams.limit}
        rows={queryParams.limit}
        totalRecords={total}
        onPage={onPageChange}
        onRowSelect={onRowSelect}
        onSelectionChange={onSelectionChange}
        selection={selectedDozen}
        metaKeySelection={false}
        selectionMode="single"
        dataKey="id"
        loading={loading}
        emptyMessage={emptyMessage}
        className="sf-table"
        header={
          <DozenTableFilters
            models={models}
            metadata={metadata}
            queryParams={queryParams}
            onSearchChange={onSearchChange}
            onFilterChange={onFilterChange}
            clearFilters={clearFilters}
            hasActiveFilters={hasActiveFilters}
          />
        }
      >
        <Column
          header="N.º"
          body={numberBodyTemplate}
          style={{ width: "4rem" }}
        />

        <Column
          header="Código"
          filterField="code"
          body={codeBodyTemplate}
          style={{ minWidth: "8rem" }}
        />

        <Column
          header="Cantidad"
          field="quantity"
        />

        <Column
          header="Modelo"
          body={modelBodyTemplate}
          style={{ minWidth: "10rem" }}
        />

        <Column
          header="Talla"
          body={sizeTemplate}
          style={{ minWidth: "10rem" }}
        />

        <Column header="Color" body={colorBodyTemplate} style={{ minWidth: "8rem" }} />

        <Column
          header="Material"
          body={materialBodyTemplate}
          style={{ minWidth: "8rem" }}
        />

        <Column header="Proceso" body={processBodyTemplate} />

        <Column header="Estado" field="is_active" body={statusBodyTemplate} />

        <Column
          header="Fecha de registro"
          body={registeredAtBodyTemplate}
          style={{ minWidth: "12rem" }}
        />
      </DataTable>

      <DozenDetailDialog
        dozen={selectedDozen}
        visible={isDetailDialogOpen}
        onHide={() => setIsDetailDialogOpen(false)}
      />
    </>
  );
};

export default DozenListTable;
