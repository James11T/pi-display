import React from "react";
import cn from "clsx";
import { DownArrowIcon } from "../../icons";
import styles from "./Select.module.scss";

interface SelectProps<T> {
  values: {
    name: string;
    value: T;
    disabled?: boolean;
    icon?: React.FC;
  }[];
  value?: T;
  onChange?: (value: T) => void;
}

const Select = <T,>({ values, value, onChange }: SelectProps<T>) => {
  const [isOpen, setIsOpen] = React.useState(false);

  const handleSetValue = (value: T) => {
    setIsOpen(false);
    onChange && onChange(value);
  };

  const currentValueData = values.find((v) => v.value === value);

  return (
    <div className={cn(styles["select"], isOpen && styles["select--open"])}>
      <div className={styles["select__value"]} onClick={() => setIsOpen((old) => !old)}>
        {currentValueData ? currentValueData.name : "Select"}
        <DownArrowIcon />
      </div>
      <ul className={styles["select__value-list"]}>
        {values.map((value) => (
          <li key={value.name}>
            <button onClick={() => handleSetValue(value.value)} disabled={value.disabled}>
              {value.icon && <value.icon />}
              {value.name}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Select;
export type { SelectProps };
