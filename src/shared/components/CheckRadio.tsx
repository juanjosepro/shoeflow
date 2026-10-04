import { useEffect, useRef } from "react";
import "@/assets/styles/checkRadio.scss";
import { Chip } from "primereact/chip";

const CheckRadio = ({ label, valueCheck, value, name, onChange }) => {
  const isSelected = valueCheck === value;
  const ref = useRef();

  useEffect(() => {
    if (isSelected && ref.current?.scrollIntoView) {
      ref.current.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  }, [isSelected]);

  const handleClick = () => {
    if (onChange) {
      // Simular un evento como los de <input>
      const syntheticEvent = {
        target: {
          name,
          value: valueCheck,
        },
      };
      onChange(syntheticEvent);
    }
  };

  return (
    <div ref={isSelected ? ref : null}>
      <Chip
        label={label}
        icon={isSelected ? "pi pi-check" : undefined}
        onClick={handleClick}
        className={`sf-chip ${isSelected ? "sf-chip-selected" : ""}`}
      />
    </div>
  );
};

export default CheckRadio;
