import { catalogService } from "@/shared/catalog/services/catalogService";
import type { PlantType, PlantTypeFormData } from "./../types/plantType";

export const plantTypeService = catalogService<PlantType, PlantTypeFormData>("catalog/plant-types");