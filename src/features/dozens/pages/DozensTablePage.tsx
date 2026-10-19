import { useState } from "react";
import { Link } from "react-router-dom";
import { useDozens } from "../hooks/useDozens";
import { useModels } from "@/features/models/hooks/useModels";
import DozenListTable from "../components/DozenListTable";
import { Button } from "primereact/button";
import { Dropdown } from "primereact/dropdown";
import { Avatar } from "primereact/avatar";
import { useDozenMetadata } from "@/shared/hooks/useDozenMetadata";
import { useCatalogOptions } from "@/shared/hooks/useCatalogOptions";

export const DozensTablePage = () => {
  const { dozens, loading, total, queryParams, setQueryParams } = useDozens();
  const { metadata, loading: loadingMetadata } = useDozenMetadata();
  const { models } = useModels({ noPagination: true });
  const { options } = useCatalogOptions();
  const [selectedOption, setSelectedOption] = useState(null);

  const exportOptions = [
    { name: "Excel", code: "EX", icon: "pi pi-file-excel" },
    { name: "PDF", code: "PDF", icon: "pi pi-file-pdf" },
    { name: "Descargar", code: "DOWNLOAD", icon: "pi pi-download" },
  ];

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
            options={exportOptions}
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
        options={options}
        queryParams={queryParams}
        setQueryParams={setQueryParams}
      />
    </>
  );
};
