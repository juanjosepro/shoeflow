import { useState } from "react";
import { useNavigate } from 'react-router-dom';
import DozenByWeeks from "./DozenByWeeks";
import { Dialog } from "primereact/dialog";
import { Menu } from "primereact/menu";
import { Button } from "primereact/button";
import { Chip } from "primereact/chip";
import { InputTextarea } from "primereact/inputtextarea";
import { Timeline } from "primereact/timeline";
import CheckRadio from "@/shared/components/CheckRadio";
import { teamsChoices } from "@/config/constants";
import { Calendar } from "primereact/calendar";
import { toast } from "@/shared/lib/toast";
import dayjs from "@/shared/lib/dayjs";

interface DozenListProps {
  dozens: any[];
  metadata: any;
  groupedByTeamId: any;
  toggleDozenStatus: (id: number, currentStatus: boolean) => Promise<void>;
}

const DozenList = ({ dozens, metadata, groupedByTeamId, toggleDozenStatus }: DozenListProps) => {
  const navigate = useNavigate();
  const [selectedDozen, setSelectedDozen] = useState<any>(null);
  const [selectedWorkerId, setSelectedWorkerId] = useState<any>(null);
  const [isMenuDialogOpen, setIsMenuDialogOpen] = useState(false);
  const [isAssignDozenDialogOpen, setIsAssignDozenDialogOpen] = useState(false);
  const [isHistoryDialogOpen, setIsHistoryDialogOpen] = useState(false);
  const [note, setNote] = useState("");
  const [showTextarea, setShowTextarea] = useState(false);
  const [assignedAt, setAssignedAt] = useState<any>(new Date());
  const isSubmitting = false;
  const isSearching = false;
  const dozenHistory: any = null;

  const generateItems = (state: string) => {
    if (!metadata || !metadata.statuses) return [];

    // 1. Buscamos el índice del estado actual dentro de la lista ordenada de la API
    const currentIndex = metadata.statuses.findIndex((item: any) => item.key === state);

    // Si el estado no se encuentra en los metadatos, evitamos que rompa
    if (currentIndex === -1) return [];

    const currentStatusObj = metadata.statuses[currentIndex];

    // 2. El siguiente estado es simplemente el que está en la posición siguiente (+1)
    // Si no hay un elemento posterior (es el último), 'nextStatusObj' será undefined
    const nextStatusObj = metadata.statuses[currentIndex + 1];

    const assignableStates = ['PENDIENTE', 'REMATADO'];

    // 3. Extraemos las etiquetas de forma 100% dinámica
    const stateText = {
      previus_state: currentStatusObj.label,
      next_state: nextStatusObj ? nextStatusObj.label : ""
    };

    const actionItems = [
      // Botón Asignar
      ...(assignableStates.includes(state) && state !== 'COMPLETADO'
        ? [{
          label: "Asignar",
          icon: "pi pi-user-plus",
          command: () => {
            setIsMenuDialogOpen(false);
            setIsAssignDozenDialogOpen(true);
          },
        }]
        : []),

      // Botón Cambiar Estado: Se muestra si no es asignable y existe un estado siguiente
      ...(!assignableStates.includes(state) && nextStatusObj
        ? [{
          label: "Cambiar Estado",
          icon: "pi pi-arrow-right-arrow-left",
          template: (item: any) => (
            <div className="p-menuitem-content pb-4" style={{ borderBottom: '1px solid var(--surface-border)' }}>
              <div className="flex flex-column">
                <a className="flex align-items-center p-menuitem-link">
                  <span className={item.icon} />
                  <span className="mx-2">{item.label}</span>
                </a>
                <p className="pl-5 pb-3" style={{ color: '#4b5563', fontSize: '0.875rem' }}>
                  Actualmente: <strong>{stateText.previus_state}</strong>.
                  <br />
                  Siguiente paso: <strong>{stateText.next_state}</strong>.
                </p>
                <Button
                  label={`Pasar a ${stateText.next_state.toLowerCase()}`}
                  severity="warning"
                  style={{ marginLeft: "44px" }}
                  onClick={() => {
                    // Le mandamos al backend la llave técnica del objeto siguiente
                    console.log("Enviar al backend:", nextStatusObj.key);
                  }}
                />
              </div>
            </div>
          ),
        }]
        : []),

      {
        label: "Historial",
        icon: "pi pi-history",
        command: () => { },
      },

      ...(state !== 'COMPLETADO' && state !== 'RECHAZADO/FALLA'
        ? [{
          label: "Editar",
          icon: "pi pi-file-edit",
          command: () => {
            setIsMenuDialogOpen(false);
            navigate(`/dozens/${selectedDozen.id}/edit`);
          },
        }]
        : []),

      // Botón Activar / Desactivar (sólo habilitado si el estado es PENDIENTE)
      ...(selectedDozen
        ? [{
          label: selectedDozen.is_active ? "Desactivar" : "Activar",
          icon: selectedDozen.is_active ? "pi pi-eye-slash" : "pi pi-eye",
          disabled: state !== 'PENDIENTE',
          command: async () => {
            setIsMenuDialogOpen(false);
            try {
              await toggleDozenStatus(selectedDozen.id, selectedDozen.is_active);
              toast.success(selectedDozen.is_active ? '¡Docena desactivada exitosamente!' : '¡Docena activada exitosamente!');
            } catch {
              toast.error('Error al cambiar el estado de la docena.');
            }
          },
        }]
        : []),
    ];

    return actionItems;
  };

  const handleSelection = (e: any) => {
    setSelectedDozen(e.value);
    setIsMenuDialogOpen(true);
  };

  const listBoxBodySection = (dozen: any) => {
    return (
      <div className="flex align-items-center">
        <div className="flex gap-4 justify-between items-start w-full">
          <div>
            <h3 className="text-gray-700 font-extrabold uppercase pb-1">
              {dozen?.variant?.model?.name || dozen?.models?.name}{" "}
              <em className="font-medium capitalize">({dozen?.variant?.size?.name || dozen?.size})</em>
            </h3>
            <ul className="list-disc pl-4">
              <li>
                <p className="text-gray-600 font-normal">
                  Codigo: <strong className="uppercase">{dozen?.code}</strong>
                </p>
              </li>
              <li>
                <p className="text-gray-600 font-normal">
                  Día de registro:{" "}
                  <strong className="capitalize">
                    {dayjs(dozen?.created_at).format("dddd D [de] MMMM")}
                  </strong>
                </p>
              </li>
              <li>
                <p className="text-gray-600 font-normal">
                  Material:{" "}
                  <strong className="capitalize">{dozen?.material}</strong>
                </p>
              </li>
              <li>
                <div className="text-gray-600 font-normal">
                  Estado:{" "}
                  <Chip
                    label={dozen?.status?.replace(/_/g, " ")}
                    icon="pi pi-circle-fill"
                    className={`pau-chip-dozen lowercase  ${dozen?.status}`}
                  />
                </div>
              </li>
              {dozen?.description && (
                <li>
                  <p className="text-gray-600 font-normal">Nota:{" "}{dozen?.description}</p>
                </li>
              )}
            </ul>
          </div>
          <i
            className="pi pi-circle-fill rounded-full pau-circle-shadow"
            style={{ color: dozen?.color }}
          ></i>
        </div>
      </div>
    );
  };

  const dialogAssignDozenFooterSection = (
    <div className="flex justify-between">
      <Button
        label="Cerrar"
        icon="pi pi-times"
        severity="secondary"
        outlined
        onClick={() => {
          setIsAssignDozenDialogOpen(false);
          setNote("");
          setShowTextarea(false);
        }}
      />
      <Button
        severity="success"
        label="Asignar"
        icon="pi pi-check"
        loading={isSubmitting}
      />
    </div>
  );

  return (
    <>
      <DozenByWeeks
        isSearching={isSearching}
        dozens={dozens}
        handleSelection={handleSelection}
      />

      {isMenuDialogOpen && (
        <Dialog
          header="¿Que deseas realizar?"
          headerClassName="text-center"
          className="p-fluid"
          style={{ width: '50vw' }}
          breakpoints={{ '960px': '75vw', '641px': '100vw' }}
          maskStyle={{ backdropFilter: "blur(4px)" }}
          visible={isMenuDialogOpen}
          onHide={() => {
            if (!isMenuDialogOpen) return;
            setIsMenuDialogOpen(false);
          }}
          footer={
            <div className="flex justify-content-end">
              <Button
                label="Cerrar"
                icon="pi pi-times"
                severity="secondary"
                outlined
                onClick={() => setIsMenuDialogOpen(false)}
              />
            </div>
          }
          closable={false}
        >
          <Menu
            model={generateItems(selectedDozen?.status)}
            style={{ width: "100%", margin: "auto" }}
            className="pau-menu-options-dozen"
          />
        </Dialog>
      )}

      <Dialog
        header="Asignar Docena"
        position="bottom"
        headerClassName="text-center"
        style={{ width: "94vw" }}
        maskStyle={{ backdropFilter: "blur(4px)" }}
        visible={isAssignDozenDialogOpen}
        onHide={() => {
          if (!isAssignDozenDialogOpen) return;
          setIsAssignDozenDialogOpen(false);
        }}
        footer={dialogAssignDozenFooterSection}
        closable={false}
      >
        <div className="flex flex-col gap-2 mb-4">
          <label htmlFor="assigned_at" className="font-bold">Fecha de Asignación</label>
          <Calendar
            name="assigned_at"
            value={assignedAt}
            onChange={(e: any) => setAssignedAt(e.value)}
            showIcon
            dateFormat="dd/mm/yy"
            locale="es"
            className="pau-calendar"
            autoFocus={false}
            readOnlyInput
            inputStyle={{ boxShadow: 'none', borderColor: '#ced4da' }}
          />
        </div>
        {selectedDozen?.status == metadata?.statuses?.APARADOR ? (
          <div className="flex flex-col gap-2 mb-4">
            <label htmlFor="worker_id" className="font-bold">Elegir al Aparador</label>
            <div className="container-check" style={{ overflowY: 'scroll', padding: '8px 0' }}>
              <div className="flex gap-2">
                {
                  groupedByTeamId[teamsChoices.APARADOR]?.members.map((worker: any) => (
                    <CheckRadio
                      key={worker.id}
                      label={worker.name}
                      valueCheck={worker.id}
                      value={selectedWorkerId}
                      name="worker_id"
                      onChange={(e: any) => setSelectedWorkerId(e.target.value)}
                    />
                  ))
                }
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-2 mb-4">
            <label htmlFor="worker_id" className="font-bold">Elegir al Armador</label>
            <div className="container-check" style={{ overflowY: 'scroll', padding: '8px 0' }}>
              <div className="flex gap-2">
                {
                  groupedByTeamId[teamsChoices.ARMADOR]?.members.map((worker: any) => (
                    <CheckRadio
                      key={worker.id}
                      label={worker.name}
                      valueCheck={worker.id}
                      value={selectedWorkerId}
                      name="worker_id"
                      onChange={(e: any) => setSelectedWorkerId(e.target.value)}
                    />
                  ))
                }
              </div>
            </div>
          </div>
        )}

        <div className="flex flex-col gap-2">
          <label htmlFor="note" className="font-bold">Nota Adicional</label>
          {showTextarea && (
            <InputTextarea
              id="note"
              name="note"
              aria-describedby="note-help"
              rows={5}
              cols={30}
              disabled={isSubmitting}
              value={note}
              onChange={(e: any) => {
                setNote(e.target.value);
              }}
            />
          )}
        </div>
      </Dialog>

      <Dialog
        header={(
          <>
            <h3 className="font-bold text-gray-700 pb-3 text-center">Historial de la docena</h3>
            <div className="py-4 border-b-gray-200" style={{ fontSize: '16px', borderBottom: '1px solid var(--surface-300)', borderTop: '1px solid var(--surface-300)' }}>
              {listBoxBodySection(selectedDozen)}
            </div>
          </>
        )}
        position="bottom"
        style={{ width: "94vw" }}
        maskStyle={{ backdropFilter: "blur(4px)" }}
        visible={isHistoryDialogOpen}
        onHide={() => {
          if (!isHistoryDialogOpen) return;
          setIsHistoryDialogOpen(false);
        }}
        footer={<Button
          label="Cerrar"
          icon="pi pi-times"
          severity="secondary"
          outlined
          onClick={() => setIsHistoryDialogOpen(false)}
        />}
        closable={false}
      >
        <Timeline value={dozenHistory?.workers} align="left" className="pau-timeline" content={(item: any) => {
          const d = item?.dozens_per_week?.find((dzn: any) => dzn?.dozen_id === dozenHistory?.id);

          return (
            <>
              <div className="flex gap-1 items-center">
                <h3 className="font-bold text-gray-700 text-md capitalize">{item?.workers?.name}</h3>
                <em className="font-medium first-letter-uppercase">({item?.workers?.teams?.name})</em>
              </div>
              <p className="text-gray-600 text-md">Fecha de asignación: <strong>{dayjs(d?.assigned_at).format('dddd D [de] MMMM')}</strong></p>
              <p className="text-gray-600 text-md">Fecha de finalización:
                <strong>
                  {d?.completed_at
                    ? dayjs(d.completed_at).format('dddd D [de] MMMM')
                    : ' En curso'
                  }
                </strong>
              </p>
              <p className="text-gray-600 text-md">Nota: {d?.note}</p>
              <br />
            </>
          )
        }}
          marker={(
            <span className="flex w-2rem h-2rem align-items-center justify-content-center text-green-500 border-circle z-1 shadow-1">
              <i className="pi pi-history"></i>
            </span>
          )} />
      </Dialog>
    </>
  );
};

export default DozenList;