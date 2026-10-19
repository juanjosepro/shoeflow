import { catalogService } from "@/shared/catalog/services/catalogService";
import type { Category, CategoryFormData } from "../types/category";

export const categoryService = catalogService<Category, CategoryFormData>("catalog/categories");