import { useEffect, useRef } from "react";
import "@/assets/css/checkRadio.css";
import { Chip } from 'primereact/chip';

const CheckRadio = ({ label, valueCheck, value, name, onChange }) => {
  const isSelected = valueCheck === value;
  const ref = useRef();

  useEffect(() => {
    if (isSelected && ref.current?.scrollIntoView) {
      ref.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }
  }, [isSelected]);

  const handleClick = () => {
    if (onChange) {
      // Simular un evento como los de <input>
      const syntheticEvent = {
        target: {
          name,
          value: valueCheck
        }
      };
      onChange(syntheticEvent);
    }
  };

  return (
    <div ref={isSelected ? ref : null}>
      <Chip
        label={label}
        icon={isSelected ? 'pi pi-check' : null}
        value={value}
        onClick={handleClick}
        style={
          isSelected
            ? {
              background: 'linear-gradient(-225deg,#78E64C 0%,#53C726 48%,#22c55e 100%)',
              color: 'white',
              padding: '0.3rem 1.5rem',
              cursor: 'pointer',
            }
            : { padding: '0.3rem 1.5rem', cursor: 'pointer' }
        }
      />
    </div>
  )
}

export default CheckRadio