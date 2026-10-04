import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useDozens } from "../hooks/useDozens";
import DozenList from "../components/DozenList";
import { useWorkers } from "@/features/workers/hooks/useWorkers";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";
import { useModels } from "@/features/models/hooks/useModels";

export const DozensPage = () => {
  const { metadata, dozens, loading, fetchDozensMetadata, toggleDozenStatus } =
    useDozens({ autoLoad: true, exclude_finished: true, no_pagination: true });
  const { models } = useModels();
  const { workers } = useWorkers({ noPagination: true });
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchDozensMetadata();
  }, [fetchDozensMetadata]);

  const groupedByTeamId = useMemo(() => {
    return workers.reduce((acc, item) => {
      const teamId = item.team_id;

      if (!acc[teamId]) {
        acc[teamId] = {
          team_id: item.team_id,
          // Asegúrate de que `item.teams` esté presente si lo usas
          team_name: item.teams ? item.teams.name : "Unknown Team",
          members: [],
        };
      }

      acc[teamId].members.push(item);

      return acc;
    }, {});
  }, [workers]); // Dependencia: solo recalcular cuando 'workers' cambie

  if (loading) {
    return (
      <div className="flex align-items-center justify-content-center w-screen">
        <i className="pi pi-spin pi-spinner" style={{ fontSize: "2.5rem" }} />
      </div>
    );
  }

  return (
    <>
      <div className="flex align-items-center justify-content-between pb-4">
        <div className="flex align-items-center gap-3">
          {/* <Dropdown
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            options={models}
            optionLabel="name"
            optionValue="id"
            placeholder="Seleccione"
          />

          <span className="p-input-icon-left block">
            <i className="pi pi-search pl-2" />
            <InputText
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="ej. AIR-0012"
              className="pl-5 w-full"
            />
          </span> */}
        </div>
        <Link to="/production/dozens/new">
          <Button
            label="Nuevo"
            icon="pi pi-plus"
            className={`sf-btn p-button-sm`}
          />
        </Link>
      </div>

      <DozenList
        dozens={dozens}
        metadata={metadata}
        groupedByTeamId={groupedByTeamId}
        toggleDozenStatus={toggleDozenStatus}
      />
    </>
  );
};
