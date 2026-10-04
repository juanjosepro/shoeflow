import { useEffect, useState, useMemo } from "react";
import { useParams } from "react-router-dom";
import { useDozens } from "../hooks/useDozens";
import { useWorkers } from "@/features/workers/hooks/useWorkers";
import { useModels } from "@/features/models/hooks/useModels";
import DozenForm from "../components/DozenForm";
import BreadCrumbComponent from "@/shared/components/BreadCrumb";
import { toast } from "@/shared/lib/toast";
import { teamsChoices } from "@/config/constants";
import { dozenService } from "../services/dozenService";
import type { Dozen } from "../types/dozen";
import type { DozenFormData } from "../schemas/dozenSchema";

export const DozensFormPage = () => {
  const { id } = useParams();
  const isEditing = Boolean(id);
  const { metadata, fetchDozensMetadata, addDozen, updateDozen } = useDozens();
  const { workers } = useWorkers({ noPagination: true });
  const { models } = useModels({ noPagination: true });

  // En vez de dos estados separados (dozen + dozenLoading) que había que
  // mantener sincronizados a mano con setState dentro del efecto, guardamos
  // PARA QUÉ id es válido el dato que tenemos. "Loading" se DERIVA comparando
  // ese id contra el id actual de la URL — no necesita su propio setState.
  const [loaded, setLoaded] = useState<{ id: number | null; dozen?: Dozen }>({
    id: null,
    dozen: undefined,
  });

  useEffect(() => {
    fetchDozensMetadata();
  }, [fetchDozensMetadata]);

  useEffect(() => {
    if (!isEditing) return;

    let ignore = false;

    dozenService
      .getById(Number(id))
      .then((data) => {
        if (!ignore) setLoaded({ id: Number(id), dozen: data });
      })
      .catch((err) => {
        if (!ignore) {
          console.error(err);
          toast.error("Error al cargar los datos de la docena.");
        }
      });

    return () => {
      ignore = true; // evita setState si el id cambió antes de que responda el fetch
    };
  }, [id, isEditing]);

  // Derivados — nada de setState síncrono en el efecto de arriba.
  const dozenLoading = isEditing && loaded.id !== Number(id);
  const dozen = isEditing && loaded.id === Number(id) ? loaded.dozen : undefined;

  const handleDozenAction = async (data: DozenFormData) => {
    try {
      if (isEditing) {
        const response = await updateDozen(Number(id), {
          ...data,
          model_variant_id: data.variant_id,
        });
        toast.success("¡Docena actualizada exitosamente!");
        return response;
      } else {
        const response = await addDozen({
          worker_id: data.worker_id,
          quantity: data.quantity || 1,
          material: data.material,
          color: data.color,
          description: data.description,
          model_variant_id: data.variant_id,
          registered_at: data.registered_at.toISOString(),
        });
        toast.success("¡Docena creada exitosamente!");
        return response;
      }
    } catch (error) {
      console.error(error);
      toast.error("Error al guardar la docena.");
      return { error };
    }
  };

  const workersGroupedByTeam = useMemo(() => {
    if (!workers) return {};
    return workers.reduce((acc, item) => {
      const teamId = item.team?.id;
      if (!teamId) return acc;

      if (!acc[teamId]) {
        acc[teamId] = {
          team_id: teamId,
          team_name: item.team?.name ?? "Equipo Desconocido",
          members: [],
        };
      }
      acc[teamId].members.push(item);
      return acc;
    }, {});
  }, [workers]);

  if (dozenLoading) {
    return (
      <div
        className="flex align-items-center justify-content-center"
        style={{ height: "100vh" }}
      >
        <i
          className="pi pi-spin pi-spinner"
          style={{ fontSize: "2.5rem", color: "var(--sf-clay)" }}
        />
      </div>
    );
  }

  return (
    <>
      <BreadCrumbComponent
        homeTo="/"
        items={[
          { label: "Docenas", to: "/production/dozens" },
          { label: isEditing ? "Editar" : "Nuevo" },
        ]}
      />

      <DozenForm
        isEditing={isEditing}
        dozen={dozen}
        groupedByTeamId={workersGroupedByTeam}
        models={models}
        metadata={metadata}
        teamsChoices={teamsChoices}
        saveAction={handleDozenAction}
      />
    </>
  );
};