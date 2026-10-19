import { useEffect, useRef } from "react";
import "@/assets/styles/checkRadio.scss";
import { Chip } from "primereact/chip";
import { Badge } from "primereact/badge";

const CheckRadio = ({ label, valueCheck, value, name, onChange, hex }) => {
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
        onClick={handleClick}
        className={`sf-chip ${isSelected ? "sf-chip-selected" : ""}`}
        template={() => (
          <>
            {isSelected && <i className="pi pi-check mr-1" />}
            {label}
            {hex && <Badge value=" " style={{ background: hex }} />}
          </>
        )}
      />
    </div>
  );
};

export default CheckRadio;
