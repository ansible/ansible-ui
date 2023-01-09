import { ReactNode } from 'react';
import { useWatch } from 'react-hook-form';

export function PageFormWatch<T>(props: { watch: string; children: (value: T) => ReactNode }) {
  const value = useWatch({ name: props.watch }) as T;
  return <>{props.children(value)}</>;
}
