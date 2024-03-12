import { Dispatch, SetStateAction, useCallback, useEffect, useState } from 'react';

export function useOverridableState<T extends string | boolean | number | undefined>(
  value: T,
  setValue?: Dispatch<SetStateAction<T>>
): [T, Dispatch<SetStateAction<T>>] {
  const [valueState, setValueState] = useState<T>(() => value);
  useEffect(() => setValueState(value), [value]);

  const setValueFn = useCallback<Dispatch<SetStateAction<T>>>(
    (param: ((value: T) => T) | T) => {
      if (setValue) {
        if (typeof param === 'function') {
          setValue((prev) => param(prev));
        } else {
          setValue(param);
        }
      } else {
        if (typeof param === 'function') {
          setValueState((prev) => param(prev));
        } else {
          setValueState(param);
        }
      }
    },
    [setValue]
  );

  return [valueState, setValueFn];
}
