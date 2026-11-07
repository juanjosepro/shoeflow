import { useState } from "react";
import dayjs from "@/shared/lib/dayjs";
import useMediaQuery from "@/shared/hooks/useMediaQuery";
import WorkerPayment from "./WorkerPayment";
import WorkerPinDialog from "./WorkerPinDialog";
import { PAGE_SIZE } from "../hooks/useWorkers";
import type { Worker } from "../types/worker";
import { Avatar } from "primereact/avatar";
import { Column } from "primereact/column";
import { DataTable } from "primereact/datatable";
import { InputText } from "primereact/inputtext";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { Menu } from "primereact/menu";
import { classNames } from "primereact/utils";
import WorkerHistoryDialog from "./WorkerHistoryDialog";
import { formatMoney } from "../utils/format";

interface Props {
  workers: Worker[];
  loading: boolean;
  onEdit: (worker: Worker) => void;
  search: string;
  onSearchChange: (value: string) => void;
  totalRecords: number;
  first: number;
  onPageChange: (page: number) => void;
  openCreate: () => void;
}

export const WorkerList = ({
  workers,
  loading,
  onEdit,
  search,
  onSearchChange,
  totalRecords,
  first,
  onPageChange,
  openCreate
}: Props) => {
  const isLaptopUp = useMediaQuery("(min-width: 1024px)");
  const [selectedWorker, setSelectedWorker] = useState<Worker | null>(null);
  const [isMenuDialogOpen, setIsMenuDialogOpen] = useState(false);
  const [isHistoryDialogOpen, setIsHistoryDialogOpen] = useState(false);
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [isPinDialogOpen, setIsPinDialogOpen] = useState(false);
  // Trabajadores a los que se les asignó PIN en esta sesión (la lista aún no se recarga)
  const [pinnedIds, setPinnedIds] = useState<number[]>([]);

  const hasPin = !!selectedWorker && (selectedWorker.has_pin || pinnedIds.includes(selectedWorker.id));

  const specialtiesBodyTemplate = (rowData: Worker) => {
    if (!rowData.specialties?.length) {
      return <span className="sf-tag">Sin especialidad</span>;
    }

    return (
      <div className="flex flex-wrap gap-2">
        {rowData.specialties.map((specialty) => (
          <span key={specialty.id} className="sf-tag slate">
            {specialty.name}
          </span>
        ))}
      </div>
    );
  };

  // Tag con nuestros propios colores en vez de los severity fijos de PrimeReact,
  // así respeta el tema igual que el resto del panel de Docenas.
  const statusBodyTemplate = (rowData: Worker) => {
    return (
      <span
        className={`sf-tag ${rowData.is_active ? "moss" : "clay"}`}
        style={{ display: "inline-block", width: 80, textAlign: "center" }}
      >
        {rowData.is_active ? "Activo" : "Inactivo"}
      </span>
    );
  };

  // Lo que se le debe hoy (trabajo sin pagar +/- ajustes). Negativo = los descuentos superan lo ganado.
  const pendingBodyTemplate = (rowData: Worker) => {
    if (rowData.pending_amount == null) return "—";
    const amount = Number(rowData.pending_amount);
    if (amount === 0) return <span style={{ color: "var(--sf-stone)" }}>{formatMoney(0)}</span>;
    return <span className={`sf-tag ${amount < 0 ? "clay" : "amber"}`}>{formatMoney(amount)}</span>;
  };

  const createdAtBodyTemplate = (rowData: Worker) => {
    if (!rowData || !rowData.created_at) return "—";
    const date = dayjs(rowData.created_at);
    return date.isValid() ? date.format("D [de] MMMM [de] YYYY") : "—";
  };

  const representativeBodyTemplate = (rowData: Worker) => {
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

  const onRowSelect = (event: { data: Worker }) => {
    setSelectedWorker(event.data);
    setIsMenuDialogOpen(true);
  };

  // Cada diálogo pide sus propios datos al abrirse: aquí solo se abren
  const processWorkerPayment = () => setIsPaymentDialogOpen(true);
  const getWorkerHistory = () => setIsHistoryDialogOpen(true);

  const header = (
    <>
      <span className="p-input-icon-left">
        <i className="pi pi-search pl-2" />
        <InputText
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Buscar por nombre o DNI..."
          className="pr-2 pl-5"
          style={{ width: "250px" }}
        />
      </span>
      <Button
        label="Nuevo"
        icon="pi pi-plus"
        severity="success"
        onClick={() => openCreate()}
      />
    </>
  );

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
              "w-full p-link flex align-items-center p-3 border-noround sf-menu-btn",
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
        label: "Historial completo",
        icon: "pi pi-list-check",
        template: (item, options) => (
          <button
            onClick={() => {
              setIsMenuDialogOpen(false);
              getWorkerHistory();
            }}
            className={classNames(
              options.className,
              "w-full p-link flex align-items-center p-3 border-noround sf-menu-btn",
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
        label: hasPin ? "Cambiar PIN del portal" : "Asignar PIN del portal",
        icon: "pi pi-key",
        template: (item, options) => (
          <button
            onClick={() => {
              setIsMenuDialogOpen(false);
              setIsPinDialogOpen(true);
            }}
            className={classNames(
              options.className,
              "w-full p-link flex align-items-center p-3 border-noround sf-menu-btn",
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
        label: "Editar",
        icon: "pi pi-file-edit",
        template: (item, options) => (
          <button
            onClick={() => {
              setIsMenuDialogOpen(false);
              if (selectedWorker) onEdit(selectedWorker);
            }}
            className={classNames(
              options.className,
              "w-full p-link flex align-items-center p-3 border-noround sf-menu-btn",
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
    ];

    return items;
  };

  return (
    <>
      <DataTable
        value={workers}
        lazy
        paginator
        first={first}
        rows={PAGE_SIZE}
        totalRecords={totalRecords}
        onPage={(e) => onPageChange(e.first / e.rows + 1)}
        loading={loading}
        header={header}
        onRowSelect={onRowSelect}
        onSelectionChange={(e) => setSelectedWorker(e.value)}
        selection={selectedWorker}
        metaKeySelection={false}
        selectionMode="single"
        dataKey="id"
        emptyMessage="No se encontraron trabajadores."
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
          body={specialtiesBodyTemplate}
          header="Especialidad"
          style={{ minWidth: "12rem" }}
        />
        <Column
          field="dni"
          header="N° Documento"
          style={{ minWidth: "12rem" }}
        />
        <Column header="Pendiente de pago" body={pendingBodyTemplate} style={{ minWidth: "10rem" }} />
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
        style={{ width: isLaptopUp ? "40vw" : "100vw" }}
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
          style={{ width: isLaptopUp ? "35vw" : "90vw", margin: "auto" }}
          className="sf-user-menu"
        />
      </Dialog>

      <WorkerHistoryDialog
        visible={isHistoryDialogOpen}
        onHide={() => setIsHistoryDialogOpen(false)}
        worker={selectedWorker}
      />

      <WorkerPayment
        visible={isPaymentDialogOpen}
        onHide={() => setIsPaymentDialogOpen(false)}
        worker={selectedWorker}
      />

      <WorkerPinDialog
        visible={isPinDialogOpen}
        onHide={() => setIsPinDialogOpen(false)}
        worker={selectedWorker}
        hasPin={hasPin}
        onSaved={(id) => setPinnedIds((prev) => (prev.includes(id) ? prev : [...prev, id]))}
      />
    </>
  );
};
