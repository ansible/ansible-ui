import { useCallback, useEffect, useState } from 'react';

export function useOverridableState<T extends string | boolean | number | undefined>(
  value: T,
  setValue?: (value: T) => void
): [T, (value: T) => void] {
  const [valueState, setValueState] = useState<T>(() => value);
  useEffect(() => setValueState(value), [value]);

  const setValueFn = useCallback<(value: T) => void>(
    (value: T) => {
      if (setValue) {
        setValue(value);
      } else {
        setValueState(value);
      }
    },
    [setValue]
  );

  return [valueState, setValueFn];
}
