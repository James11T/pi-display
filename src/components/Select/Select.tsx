import React from "react";
import cn from "clsx";
import { DownArrowIcon } from "../../icons";
import styles from "./Select.module.scss";

interface SelectProps<T> {
  values: {
    name: string;
    value: T;
  }[];
  defaultValue?: T;
  onChange?: (value: T) => void;
}

const Select = <T extends string | number>({ values, defaultValue, onChange }: SelectProps<T>) => {
  const [currentValue, setCurrentValue] = React.useState<T | undefined>(defaultValue);
  const [isOpen, setIsOpen] = React.useState(false);

  const handleSetValue = (value: T) => {
    setIsOpen(false);
    setCurrentValue(value);
    onChange && onChange(value);
  };

  const currentValueData = values.find((v) => v.value === currentValue);

  return (
    <div className={cn(styles["select"], isOpen && styles["select--open"])}>
      <div className={styles["select__value"]} onClick={() => setIsOpen((old) => !old)}>
        {currentValueData ? currentValueData.name : "Select"}
        <DownArrowIcon />
      </div>
      <ul className={styles["select__value-list"]}>
        {values.map((value) => (
          <li key={value.name}>
            <button onClick={() => handleSetValue(value.value)}>{value.name}</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Select;
