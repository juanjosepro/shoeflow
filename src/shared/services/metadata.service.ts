
import api from "@/shared/lib/axios";

export interface ChoiceOption {
  key: string;
  label: string;
}

export interface DozenMetadataResponse {
  priorities: ChoiceOption[];
}

type IndexedChoices<T extends ChoiceOption> = Record<string, T>;

export interface DozenMetadata extends DozenMetadataResponse {
  prioritiesMap: IndexedChoices<ChoiceOption>;
}

function indexChoices<T extends ChoiceOption>(
  choices: T[],
): IndexedChoices<T> {
  return Object.fromEntries(
    choices.map((choice) => [choice.key, choice]),
  );
}

function buildDozenMetadata(
  data: DozenMetadataResponse,
): DozenMetadata {
  return {
    ...data,

    // Los arrays originales se conservan
    priorities: data.priorities,
    // Nuevos objetos para acceso directo
    prioritiesMap: indexChoices(data.priorities),
  };
}

export async function getDozenMetadata(): Promise<DozenMetadata> {
  const { data } = await api.get<DozenMetadataResponse>(
    "/production/dozen-metadata/",
  );

  return buildDozenMetadata(data);
}