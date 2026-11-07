import { useState } from "react";
import { Link } from "react-router-dom";
import { useDozens } from "../hooks/useDozens";
import { useDozenMetadata } from "@/shared/hooks/useDozenMetadata";
import DozenList from "../components/DozenList";
import { Button } from "primereact/button";
import { InputSwitch } from "primereact/inputswitch";
import { ToggleButton } from 'primereact/togglebutton';
import Loading from "@/shared/components/Loading";

interface ContentProps {
  showFinished: boolean;
  onShowFinishedChange: (value: boolean) => void;
}

// Se monta de nuevo cada vez que cambia "ver finalizadas" (ver key abajo): así la lista
// vuelve a pedir los datos con el filtro correcto sin depender de cómo funcione el hook.
const DozensContent = ({ showFinished, onShowFinishedChange }: ContentProps) => {
  const { dozens, loading, toggleDozenStatus, assignStages, changeDozenStatus } =
    useDozens({
      autoLoad: true,
      exclude_finished: !showFinished,
      no_pagination: true,
    });
  const { metadata, loading: loadingMetadata } = useDozenMetadata();

  // Spinner solo en la primera carga: al refrescar tras asignar o activar/desactivar
  // no se desmonta la lista (se perdería la estación y la búsqueda elegidas).
  if ((loading && dozens.length === 0) || loadingMetadata || !metadata) return <Loading />;

  return (
    <>
      <div className="flex flex-wrap align-items-center justify-content-between gap-3 pb-4">
        <div className="flex flex-wrap align-items-center gap-3">
          {/* Las completadas y rechazadas salen del listado; aquí se pueden ver y reabrir */}
          {/* <label
            className="flex align-items-center gap-2"
            style={{ fontSize: 13.5, cursor: "pointer" }}
          >
            <InputSwitch
              checked={showFinished}
              onChange={(e) => onShowFinishedChange(!!e.value)}
            />
            Ver completadas y rechazadas
          </label> */}
        </div>
        <div className="flex items-center gap-1">
          <ToggleButton
            checked={showFinished}
            onChange={(e) => onShowFinishedChange(!!e.value)}
            onLabel="Ocultar completados y rechazados"
            offLabel="Completados/Rechazados"
            onIcon="pi pi-times"
            offIcon="pi pi-check" 
            tooltip="Mostrar u ocultar docenas completadas o rechazadas"
            tooltipOptions={{ position: "top" }}
            className="sf-btn--ink sf-btn--soft"
          />
          <Link to="/production/dozens/in-progress">
            <Button
              label="Vista en proceso"
              icon="pi pi-external-link"
              tooltip="ver el estado de las docenas en proceso"
              tooltipOptions={{ position: "top" }}
              className="sf-btn--ink sf-btn--soft"
            />
          </Link>
          <Link to="/production/dozens/new">
            <Button
              label="Nuevo"
              icon="pi pi-plus"
              severity="success"
            />
          </Link>
        </div>
      </div>

      <DozenList
        dozens={dozens}
        metadata={metadata}
        toggleDozenStatus={toggleDozenStatus}
        assignStages={assignStages}
        changeDozenStatus={changeDozenStatus}
      />
    </>
  );
};

export const DozensPage = () => {
  const [showFinished, setShowFinished] = useState(false);

  return (
    <DozensContent
      key={String(showFinished)}
      showFinished={showFinished}
      onShowFinishedChange={setShowFinished}
    />
  );
};
