import { CatalogPage } from "@/shared/catalog/pages/CatalogPage";
import { materialTypeService } from "../services/materialTypeService";

export const MaterialTypesPage = () => (
  <CatalogPage
    service={materialTypeService}
    labels={{ singular: "material", plural: "materiales" }}
    hasActive
    descriptionPlaceholder="Ej: Cuero vacuno"
  />
);
