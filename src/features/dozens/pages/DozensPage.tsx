import { Link } from "react-router-dom";
import { useDozens } from "../hooks/useDozens";
import DozenList from "../components/DozenList";
import { Button } from "primereact/button";
import { useDozenMetadata } from "@/shared/hooks/useDozenMetadata";

export const DozensPage = () => {
  const {
    dozens,
    loading,
    toggleDozenStatus,
    assignStages,
    changeDozenStatus,
  } = useDozens({
    autoLoad: true,
    exclude_finished: false,
    no_pagination: true,
  });
  const { metadata, loading: loadingMetadata } = useDozenMetadata();

  // Spinner solo en la primera carga: al refrescar tras asignar o activar/desactivar
  // no se desmonta la lista (se perdería la estación y la búsqueda elegidas).
  if ((loading && dozens.length === 0) || loadingMetadata || !metadata) {
    return (
      <div className="flex align-items-center justify-content-center w-screen">
        <i className="pi pi-spin pi-spinner" style={{ fontSize: "2.5rem" }} />
      </div>
    );
  }

  return (
    <>
      <div className="flex align-items-center justify-content-between pb-4">
        <div className="flex align-items-center gap-3" />
        <Link to="/production/dozens/new">
          <Button
            label="Nuevo"
            icon="pi pi-plus"
            className="sf-btn p-button-sm"
          />
        </Link>
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
