import { ReactNode } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';

export function PageFormWatch<T>(props: { watch: string; children: (value: T) => ReactNode }) {
  const { control } = useFormContext();
  const value = useWatch({ control, name: props.watch }) as T;
  return <>{props.children(value)}</>;
}
