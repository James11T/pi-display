import React from "react";

const useExpiringKeyValue = <T extends Record<string, any>>(defaultState: T) => {
  const [state, setState] = React.useState<Partial<T>>(defaultState);
  const [cycles, setCycles] = React.useState<Partial<Record<keyof T, number>>>({});

  const setKey = <K extends keyof T>(key: K, value: T[K], life: number) => {
    setState((old) => ({ ...old, [key]: value }));
    setCycles((old) => ({ ...old, [key]: life }));
  };

  const step = () => {
    setCycles((old) =>
      Object.keys(old).reduce(
        (prev, curr) => ({ ...prev, [curr]: Math.max((old[curr] ?? 0) - 1, 0) }),
        {}
      )
    );
  };

  return { setKey };
};
