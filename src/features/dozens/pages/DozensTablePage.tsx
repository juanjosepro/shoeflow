import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useDozens } from "../hooks/useDozens";
import { useModels } from "@/features/models/hooks/useModels";
import DozenListTable from "../components/DozenListTable";
import { Button } from "primereact/button";
import { Dropdown } from "primereact/dropdown";
import { Avatar } from "primereact/avatar";

export const DozensTablePage = () => {
  const {
    metadata,
    dozens,
    loading,
    total,
    queryParams,
    setQueryParams,
    fetchDozensMetadata,
  } = useDozens();
  const { models } = useModels();
  const [selectedOption, setSelectedOption] = useState(null);

  const options = [
    { name: "Excel", code: "EX", icon: "pi pi-file-excel" },
    { name: "PDF", code: "PDF", icon: "pi pi-file-pdf" },
    { name: "Descargar", code: "DOWNLOAD", icon: "pi pi-download" },
  ];

  useEffect(() => {
    fetchDozensMetadata();
  }, [fetchDozensMetadata]);

  const selectedOptionTemplate = (option, props) => {
    if (option) {
      return (
        <div className="flex align-items-center">
          <Avatar
            icon={option.icon}
            shape="circle"
            style={{ height: "14px" }}
          />
          <div>{option.name}</div>
        </div>
      );
    }

    return <span>{props.placeholder}</span>;
  };

  const optionTemplate = (option) => {
    return (
      <div className="flex align-items-center gap-2">
        <Avatar icon={option.icon} shape="circle" />
        <div>{option.name}</div>
      </div>
    );
  };

  return (
    <>
      <div className="flex align-items-center justify-content-end pb-4">
        <div className="flex align-items-center gap-3 pr-3">
          <Dropdown
            value={selectedOption}
            onChange={(e) => setSelectedOption(e.value)}
            options={options}
            optionLabel="name"
            placeholder="Opciones"
            valueTemplate={selectedOptionTemplate}
            itemTemplate={optionTemplate}
            className="w-full"
          />
        </div>
        <Link to="/production/dozens/new">
          <Button
            label="Nuevo"
            icon="pi pi-plus"
            className="sf-btn p-button-sm"
          />
        </Link>
      </div>

      <DozenListTable
        models={models}
        dozens={dozens}
        total={total}
        loading={loading}
        metadata={metadata}
        queryParams={queryParams}
        setQueryParams={setQueryParams}
      />
    </>
  );
};
