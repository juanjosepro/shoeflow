import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDozens } from "../hooks/useDozens";
import { useWorkers } from "@/features/workers/hooks/useWorkers";
import { useModels } from "@/features/models/hooks/useModels";
import DozenForm from "../components/DozenForm";
import BreadCrumbComponent from "@/shared/components/BreadCrumb";
import { toast } from "@/shared/lib/toast";
import { teamsChoices } from "@/config/constants";
import { dozenService } from "../services/dozenService";

export const DozensFormPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { metadata, fetchDozensMetadata, addDozen, updateDozen } = useDozens();
  const { workers } = useWorkers({ noPagination: true });
  const { models } = useModels({ noPagination: true });
  const [dozen, setDozen] = useState<any>(null);
  const [dozenLoading, setDozenLoading] = useState(false);

  useEffect(() => {
    fetchDozensMetadata();
  }, []);

  useEffect(() => {
    if (id) {
      setDozenLoading(true);
      dozenService.getById(Number(id))
        .then((data) => setDozen(data))
        .catch((err) => {
          console.error(err);
          toast.error("Error al cargar los datos de la docena.");
        })
        .finally(() => setDozenLoading(false));
    } else {
      setDozen(null);
    }
  }, [id]);

  const handleDozenAction = async (data: any) => {
    const isUpdate = !!id;

    try {
      if (isUpdate) {
        const response = await updateDozen(Number(id), { ...data, model_variant_id: data.variant_id });
        toast.success('¡Docena actualizada exitosamente!');
        navigate('/dozens');
        return response;

      } else {
        const response = await addDozen({ ...data, model_variant_id: data.variant_id });
        toast.success('¡Docena creada exitosamente!');
        navigate('/dozens');
        return response;
      }
    } catch (error) {
      console.error(error);
      toast.error('Error al guardar la docena.');
      return { error };
    }
  }

  const workersGroupedByTeam = workers?.reduce((acc: any, item: any) => {
    const teamId = item.team.id;
    if (!acc[teamId]) {
      acc[teamId] = {
        team_id: item.team.id,
        team_name: item.team ? item.team.name : "Equipo Desconocido",
        members: [],
      };
    }
    acc[teamId].members.push(item);
    console.log("workersGroupedByTeam", acc)
    return acc;
  }, {});

  if (dozenLoading) {
    return (
      <div className="flex align-items-center justify-content-center" style={{ height: '100vh' }}>
        <i className="pi pi-spin pi-spinner" style={{ fontSize: '2.5rem' }} />
      </div>
    );
  }

  return (
    <>
      <BreadCrumbComponent />

      <DozenForm
        dozen={dozen}
        groupedByTeamId={workersGroupedByTeam}
        models={models}
        metadata={metadata}
        teamsChoices={teamsChoices}
        saveAction={handleDozenAction}
      />
    </>
  );
}
