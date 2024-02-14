import { ReactNode } from 'react';
import { FieldValues, UseFormSetValue, useFormContext } from 'react-hook-form';

export function PageFormSetValue<TFieldValues extends FieldValues = FieldValues>(props: {
  children: (setValue: UseFormSetValue<TFieldValues>) => ReactNode;
}) {
  const { setValue } = useFormContext<TFieldValues>();
  return <>{props.children(setValue)}</>;
}
