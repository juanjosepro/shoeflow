import { BreadCrumb } from "primereact/breadcrumb";
import { Link } from "react-router-dom";

const BreadCrumbComponent = () => {
  const items = [
    { label: "Docenas" },
    {
      label: "Nuevo",
      template: () => (
        <Link to="#" className="text-blue-700 font-semibold">
          Nuevo
        </Link>
      ),
    },
  ];
  const home = { icon: "pi pi-home", url: "https://primereact.org" };

  return <BreadCrumb model={items} home={home} style={{ border: "none", padding: 0, marginTop: '-30px' }} />;
};

export default BreadCrumbComponent;
