import { catalogService } from "@/shared/catalog/services/catalogService";
import type { MaterialType, MaterialTypeFormData } from "./../types/materialType";

export const materialTypeService = catalogService<MaterialType, MaterialTypeFormData>("catalog/material-types");