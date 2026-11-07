import { createElement, useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { toast } from "@/shared/lib/toast";
import { stageService, type Stage } from "../services/stageService";
import type { Dozen } from "../types/dozen";
import FichaSheet, { type FichaMode } from "../components/FichaSheet";

interface PrintJob {
  dozens: Dozen[];
  stages: Stage[];
  mode: FichaMode;
}

// Uso:
//   const { printFichas, fichaPrinter } = useFichaPrint();
//   <Button onClick={() => printFichas([dozen])} />
//   {fichaPrinter}   // <- render en cualquier parte del componente
export const useFichaPrint = () => {
  const [job, setJob] = useState<PrintJob | null>(null);
  const [preparing, setPreparing] = useState(false);

  const printFichas = useCallback(async (dozens: Dozen[], mode: FichaMode = "single") => {
    if (dozens.length === 0) {
      toast.error("No hay docenas para imprimir.");
      return;
    }
    setPreparing(true);
    try {
      // Las filas de la ficha son las etapas activas, en el orden del proceso
      const stages = await stageService.getActive();
      if (stages.length === 0) {
        toast.error("No hay etapas activas. Crea o activa las especialidades primero.");
        return;
      }
      setJob({ dozens, stages, mode });
    } catch {
      toast.error("No se pudieron cargar las etapas de la ficha.");
    } finally {
      setPreparing(false);
    }
  }, []);

  // Con la ficha ya pintada se abre el diálogo de impresión; al cerrarlo se desmonta
  useEffect(() => {
    if (!job) return;
    const onAfterPrint = () => setJob(null);
    window.addEventListener("afterprint", onAfterPrint);
    const timer = window.setTimeout(() => window.print(), 150);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("afterprint", onAfterPrint);
    };
  }, [job]);

  // En el body, fuera de #root: así el CSS de impresión puede ocultar el resto de la app
  const fichaPrinter = job
    ? createPortal(
        createElement(FichaSheet, { dozens: job.dozens, stages: job.stages, mode: job.mode }),
        document.body,
      )
    : null;

  return { printFichas, fichaPrinter, preparingFichas: preparing };
};
