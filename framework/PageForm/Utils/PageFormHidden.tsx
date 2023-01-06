import { ReactNode } from 'react';
import { useWatch } from 'react-hook-form';

export function PageFormHidden<T>(props: {
  watch: string;
  hidden: (value: T) => boolean;
  children: ReactNode;
}) {
  const value = useWatch({ name: props.watch }) as T;
  const hidden = props.hidden(value);
  if (hidden) return <></>;
  return <>{props.children}</>;
}
