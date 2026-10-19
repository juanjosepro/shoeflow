import { catalogService } from "@/shared/catalog/services/catalogService";
import type { SizeFormData, SizeItem } from "../types/size";

export const sizeService = catalogService<SizeItem, SizeFormData>("catalog/sizes");