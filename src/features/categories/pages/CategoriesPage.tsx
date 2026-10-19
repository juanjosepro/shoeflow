import { CatalogPage } from "@/shared/catalog/pages/CatalogPage";
import { categoryService } from "../services/categoryService";

export const CategoriesPage = () => (
  <CatalogPage
    service={categoryService}
    labels={{ singular: "categoría", plural: "categorías", feminine: true }}
    hasActive
    descriptionPlaceholder="Ej: Zapatillas deportivas"
  />
);
