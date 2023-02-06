import React from "react";

// Provides a callback with the same parameters of the given callback
// Ignores any calls within provided time frame of a successful call
const useDebounce = <T extends (...args: any[]) => any>(
  cb: T,
  debounce = 300
): ((...args: Parameters<T>) => void) => {
  const timeoutId = React.useRef<number | undefined>(undefined);
  const lastRun = React.useRef<number>(0);

  const callback = React.useCallback(
    (...args: Parameters<T>) => {
      window.clearTimeout(timeoutId.current);

      const resolve = () => {
        lastRun.current = Number(new Date());
        return cb(...args);
      };

      if (Number(new Date()) - lastRun.current > debounce) {
        return resolve();
      } else {
        // Delay call in case of final call
        timeoutId.current = window.setTimeout(resolve, debounce);
      }
    },
    [cb, debounce]
  );

  return callback as T;
};

export default useDebounce;
