import { catalogService } from "@/shared/catalog/services/catalogService";
import type { Specialty, SpecialtyFormData } from "../types/specialty";

export const specialtyService = catalogService<Specialty, SpecialtyFormData>("staff/specialties");