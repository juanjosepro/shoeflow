import { CatalogPage } from "@/shared/catalog/pages/CatalogPage";
import { plantTypeService } from "../services/plantTypeService";

export const PlantTypesPage = () => (
  <CatalogPage
    service={plantTypeService}
    labels={{ singular: "tipo de planta", plural: "tipos de planta" }}
    hasActive
    descriptionPlaceholder="Ej: Suela de goma"
  />
);
