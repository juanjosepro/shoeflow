import { catalogService } from "@/shared/catalog/services/catalogService";
import type { Color, ColorFormData } from "../types/color";

export const colorService = catalogService<Color, ColorFormData>("catalog/colors");