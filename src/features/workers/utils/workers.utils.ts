
import type { Worker } from "../types/worker";

export function groupWorkersBySpecialty(workers: Worker[]) {
  return workers.reduce<
    Record<
      number,
      {
        specialty_id: number;
        specialty_name: string;
        members: Worker[];
      }
    >
  >((acc, worker) => {
    worker.specialties?.forEach((specialty) => {
      if (!acc[specialty.id]) {
        acc[specialty.id] = {
          specialty_id: specialty.id,
          specialty_name: specialty.name,
          members: [],
        };
      }

      acc[specialty.id].members.push(worker);
    });

    return acc;
  }, {});
}