import { BreadCrumb } from "primereact/breadcrumb";
import { Link, useNavigate } from "react-router-dom";

interface Crumb {
  label: string;
  to?: string; // si no trae `to`, se muestra como texto plano (es el item actual)
}

interface Props {
  items: Crumb[];
  homeTo?: string; // ruta interna a la que lleva el ícono de casa (default "/")
}

const BreadCrumbComponent = ({ items, homeTo = "/" }: Props) => {
  const navigate = useNavigate();

  const model = items.map((item) => ({
    label: item.label,
    template: item.to
      ? () => (
          <Link to={item.to as string} className="sf-breadcrumb-link">
            {item.label}
          </Link>
        )
      : undefined, // sin `to`: PrimeReact lo renderiza como texto plano (el item actual)
  }));

  // Antes apuntaba a "https://primereact.org" — lo dejamos navegando dentro de la app
  const home = {
    icon: "pi pi-home",
    command: () => navigate(homeTo),
  };

  return (
    <BreadCrumb
      model={model}
      home={home}
      className="sf-breadcrumb"
      // style={{ marginTop: "-30px" }}
    />
  );
};

export default BreadCrumbComponent;
