import { useEffect, useState } from "react";
import { toast } from "@/shared/lib/toast";
import { stageService, type Stage } from "../services/stageService";

export const useActiveStages = () => {
  const [stages, setStages] = useState<Stage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let ignore = false;
    stageService
      .getActive()
      .then((data) => {
        if (!ignore) setStages(data);
      })
      .catch(() => {
        if (!ignore) toast.error("No se pudieron cargar las etapas.");
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });
    return () => {
      ignore = true;
    };
  }, []);

  return { stages, loading };
};
