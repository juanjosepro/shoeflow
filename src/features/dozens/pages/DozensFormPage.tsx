import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useDozens } from "../hooks/useDozens";
import { useCatalogOptions } from "@/shared/hooks/useCatalogOptions";
import { useModels } from "@/features/models/hooks/useModels";
import DozenForm from "../components/DozenForm";
import BreadCrumbComponent from "@/shared/components/BreadCrumb";
import { toast } from "@/shared/lib/toast";
import { dozenService } from "../services/dozenService";
import type { Dozen } from "../types/dozen";
import type { DozenFormData, DozenPayload } from "../schemas/dozenSchema";
import { useDozenMetadata } from "@/shared/hooks/useDozenMetadata";

// La fecha viaja como texto ISO; el resto del formulario va igual
const toPayload = (data: DozenFormData): DozenPayload => ({
  ...data,
  registered_at: data.registered_at.toISOString(),
});

export const DozensFormPage = () => {
  const { id } = useParams();
  const isEditing = Boolean(id);

  // autoLoad: false -> aquí solo se guarda, no hace falta traer el listado
  const { addDozen, updateDozen } = useDozens({ autoLoad: false });
  const { metadata } = useDozenMetadata(); // prioridades
  const { options } = useCatalogOptions(); // materiales, colores, plantas, tallas
  const { models } = useModels({ noPagination: true });

  // Guardamos PARA QUÉ id es válido el dato que tenemos. "Loading" se DERIVA
  // comparando ese id con el de la URL, sin setState síncrono en el efecto.
  const [loaded, setLoaded] = useState<{ id: number | null; dozen?: Dozen }>({
    id: null,
    dozen: undefined,
  });

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

  const dozenLoading = isEditing && loaded.id !== Number(id);
  const dozen =
    isEditing && loaded.id === Number(id) ? loaded.dozen : undefined;

  const handleDozenAction = async (data: DozenFormData) => {
    try {
      if (isEditing) {
        const response = await updateDozen(Number(id), toPayload(data));
        toast.success("¡Docena actualizada exitosamente!");
        return response;
      }

      const response = await addDozen(toPayload(data));
      toast.success(
        data.count > 1
          ? `¡${data.count} docenas creadas exitosamente!`
          : "¡Docena creada exitosamente!",
      );
      return response;
    } catch (error) {
      console.error(error);
      toast.error("Error al guardar la docena.");
      return { error };
    }
  };

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
        models={models}
        metadata={metadata}
        options={options}
        saveAction={handleDozenAction}
      />
    </>
  );
};
