import type { Stage } from "../services/stageService";

// Réplica en el frontend de stage_progress del backend (mismas reglas):
// - una etapa "no aplica" si alguna etapa excluyente suya ya fue asignada
// - un grupo de etapas excluyentes sin ninguna asignada cuenta como UNA etapa pendiente
export interface StageProgress {
  total: number;
  assigned: number;
  notApplicable: Set<number>;
  // Lo que falta: una entrada por etapa, o por grupo excluyente sin elegir ("Armado / Armador / Pegador")
  missing: { key: string; label: string }[];
}

export const getStageProgress = (stages: Stage[], assignedIds: number[]): StageProgress => {
  const ids = new Set(stages.map((s) => s.id));
  const assigned = new Set(assignedIds.filter((id) => ids.has(id)));

  // Grupos por exclusión (union-find simple)
  const parent = new Map<number, number>(stages.map((s) => [s.id, s.id]));
  const find = (x: number): number => {
    while (parent.get(x) !== x) {
      parent.set(x, parent.get(parent.get(x)!)!);
      x = parent.get(x)!;
    }
    return x;
  };
  stages.forEach((s) =>
    (s.excludes ?? []).forEach((other) => {
      if (ids.has(other)) parent.set(find(s.id), find(other));
    }),
  );

  const groups = new Map<number, Stage[]>();
  stages.forEach((s) => {
    const root = find(s.id);
    groups.set(root, [...(groups.get(root) ?? []), s]);
  });

  const notApplicable = new Set(
    stages.filter((s) => (s.excludes ?? []).some((o) => assigned.has(o))).map((s) => s.id),
  );

  let total = 0;
  const missing: StageProgress["missing"] = [];
  groups.forEach((members) => {
    const resolved = members.some((m) => assigned.has(m.id));
    if (members.length === 1 || resolved) {
      members
        .filter((m) => !notApplicable.has(m.id))
        .forEach((m) => {
          total += 1;
          if (!assigned.has(m.id)) missing.push({ key: String(m.id), label: m.name });
        });
    } else {
      total += 1;
      missing.push({
        key: `g${members[0].id}`,
        label: members.map((m) => m.name).join(" / "),
      });
    }
  });
  missing.sort((a, b) => a.label.localeCompare(b.label)); // se reordena abajo por orden de proceso
  const orderOf = (key: string) =>
    stages.find((s) => String(s.id) === key.replace("g", ""))?.order ?? 0;
  missing.sort((a, b) => orderOf(a.key) - orderOf(b.key));

  return { total, assigned: assigned.size, notApplicable, missing };
};
