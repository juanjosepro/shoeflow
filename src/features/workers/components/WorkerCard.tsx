import { Avatar } from "primereact/avatar";
import type { Worker } from "../types/worker";
import { Column } from "primereact/column";
import { DataTable } from "primereact/datatable";
import { FilterMatchMode } from "primereact/api";
import { InputText } from "primereact/inputtext";
// import { Dropdown } from "primereact/dropdown";
import { useState } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { Menu } from "primereact/menu";
import { classNames } from "primereact/utils";
import WorkerHistory from "./WorkerHistory";
import WorkerPayment from "./WorkerPayment";
import dayjs from "@/shared/lib/dayjs";
import useMediaQuery from "@/shared/hooks/useMediaQuery";

interface Props {
  workers: Worker[];
  loading: boolean;
  onEdit: (worker: Worker) => void;
}

export const WorkerCard = ({ workers, loading, onEdit }: Props) => {
  const isLaptopUp = useMediaQuery("(min-width: 1024px)");
  const [globalFilterValue, setGlobalFilterValue] = useState("");
  const [filters, setFilters] = useState({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
    names: { value: null, matchMode: FilterMatchMode.STARTS_WITH },
    "team.name": { value: null, matchMode: FilterMatchMode.STARTS_WITH },
    dni: { value: null, matchMode: FilterMatchMode.CONTAINS },
    phone: { value: null, matchMode: FilterMatchMode.CONTAINS },
  });

  const [selectedWorker, setSelectedWorker] = useState(null);
  const [isMenuDialogOpen, setIsMenuDialogOpen] = useState(false);
  const [isHistoryDialogOpen, setIsHistoryDialogOpen] = useState(false);
  const [workerHistory, setWorkerHistory] = useState([]);
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);

  const onGlobalFilterChange = (e) => {
    const value = e.target.value;
    const _filters = { ...filters };

    _filters["global"].value = value;

    setFilters(_filters);
    setGlobalFilterValue(value);
  };

  const renderHeader = () => {
    return (
      <div className="flex justify-content-start">
        <span className="p-input-icon-left">
          <i className="pi pi-search pl-2" />
          <InputText
            value={globalFilterValue}
            onChange={onGlobalFilterChange}
            placeholder="Buscar trabajador..."
            className="pr-2 pl-5"
          />
        </span>
      </div>
    );
  };

  // Tag con nuestros propios colores en vez de los severity fijos de PrimeReact,
  // así respeta el tema igual que el resto del panel de Docenas.
  const statusBodyTemplate = (rowData) => {
    return (
      <span
        className={`sf-tag ${rowData.is_active ? "moss" : "clay"}`}
        style={{ display: "inline-block", width: 80, textAlign: "center" }}
      >
        {rowData.is_active ? "Activo" : "Inactivo"}
      </span>
    );
  };

  const createdAtBodyTemplate = (rowData: Worker) => {
    if (!rowData || !rowData.created_at) return "—";
    const date = dayjs(rowData.created_at);
    return date.isValid() ? date.format("D [de] MMMM [de] YYYY") : "—";
  };

  const representativeBodyTemplate = (rowData) => {
    return (
      <div className="flex align-items-center gap-4">
        <Avatar
          icon="pi pi-user"
          size="large"
          shape="circle"
          label={rowData.names.slice(0, 1)}
          className="uppercase"
        />
        <span>{rowData.names}</span>
      </div>
    );
  };

  const onRowSelect = (event) => {
    setSelectedWorker(event.data);
    setIsMenuDialogOpen(true);
  };

  const processWorkerPayment = async () => {
    setIsPaymentDialogOpen(true);
    // const history = await fetchAllWorkerHistory(selectedWorker.id)
    // setWorkerHistory(history)
  };

  const getWorkerHistory = async () => {
    setIsHistoryDialogOpen(true);
    // const history = await fetchAllWorkerHistory(selectedWorker.id)
    // setWorkerHistory(history)
  };

  const header = renderHeader();

  const generateItems = () => {
    const items = [
      {
        label: "Pagar al trabajador",
        icon: "pi pi-wallet",
        template: (item, options) => (
          <button
            onClick={() => {
              setIsMenuDialogOpen(false);
              processWorkerPayment();
            }}
            className={classNames(
              options.className,
              "w-full p-link flex align-items-center p-2 border-noround sf-menu-btn",
            )}
          >
            <a className="flex items-center">
              <span className={item.icon} />
              <span
                className="mx-2"
                dangerouslySetInnerHTML={{ __html: item.label }}
              />
            </a>
          </button>
        ),
      },
      {
        label: "Ver <strong>(historial completo)</strong>",
        icon: "pi pi-list-check",
        template: (item, options) => (
          <button
            onClick={() => {
              setIsMenuDialogOpen(false);
              getWorkerHistory();
            }}
            className={classNames(
              options.className,
              "w-full p-link flex align-items-center p-2 border-noround sf-menu-btn",
            )}
          >
            <a className="flex items-center">
              <span className={item.icon} />
              <span
                className="mx-2"
                dangerouslySetInnerHTML={{ __html: item.label }}
              />
            </a>
          </button>
        ),
      },
      {
        label: "Editar información",
        icon: "pi pi-file-edit",
        command: () => {
          setIsMenuDialogOpen(false);
          onEdit(selectedWorker);
        },
      },
    ];

    return items;
  };

  return (
    <>
      <DataTable
        value={workers}
        onRowSelect={onRowSelect}
        onSelectionChange={(e) => setSelectedWorker(e.value)}
        selection={selectedWorker}
        metaKeySelection={false}
        selectionMode="single"
        paginator
        rows={10}
        dataKey="id"
        filters={filters}
        loading={loading}
        globalFilterFields={["names", "team.name", "dni", "phone"]}
        header={header}
        emptyMessage="No workers found."
        className="sf-table"
      >
        <Column field="id" header="ID" style={{ minWidth: "1rem" }} />
        <Column
          header="Nombres"
          filterField="names"
          style={{ minWidth: "14rem" }}
          body={representativeBodyTemplate}
        />
        <Column
          field="team.name"
          header="Equipo"
          style={{ minWidth: "12rem" }}
        />
        <Column
          field="dni"
          header="N° Documento"
          style={{ minWidth: "12rem" }}
        />
        <Column field="phone" header="Teléfono" />
        <Column field="is_active" header="Estado" body={statusBodyTemplate} />
        <Column
          field="created_at"
          header="Fecha de registro"
          body={createdAtBodyTemplate}
          style={{ minWidth: "14rem" }}
        />
      </DataTable>

      <Dialog
        header="¿Que deseas realizar?"
        position={isLaptopUp ? "center" : "bottom"}
        headerClassName="text-center"
        style={{ width: isLaptopUp ? "50vw" : "100vw" }}
        maskStyle={{ backdropFilter: "blur(4px)" }}
        visible={isMenuDialogOpen}
        onHide={() => {
          if (!isMenuDialogOpen) return;
          setIsMenuDialogOpen(false);
        }}
        footer={
          <Button
            label="Cerrar"
            icon="pi pi-times"
            onClick={() => setIsMenuDialogOpen(false)}
            outlined
            severity="secondary"
          />
        }
        closable={false}
        className="sf-dialog"
      >
        <Menu
          model={generateItems()}
          style={{ width: isLaptopUp ? "40vw" : "90vw", margin: "auto" }}
          className="sf-user-menu"
        />
      </Dialog>

      <WorkerHistory
        workerHistory={workerHistory}
        isHistoryDialogOpen={isHistoryDialogOpen}
        setIsHistoryDialogOpen={setIsHistoryDialogOpen}
      />

      <WorkerPayment
        selectedWorker={selectedWorker}
        workerHistory={workerHistory}
        isPaymentDialogOpen={isPaymentDialogOpen}
        setIsPaymentDialogOpen={setIsPaymentDialogOpen}
        processWorkerPayment={processWorkerPayment}
      />
    </>
  );
};
