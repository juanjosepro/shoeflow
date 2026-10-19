import { CatalogPage } from "@/shared/catalog/pages/CatalogPage";
import { sizeService } from "../services/sizeService";

export const SizesPage = () => (
  <CatalogPage
    service={sizeService}
    labels={{ singular: "talla", plural: "tallas", feminine: true }}
    descriptionLabel="Rango"
    descriptionPlaceholder="Ej: 38-42"
    hasActive
  />
);
