import { ReactNode } from 'react';
import { FieldValues, UseFormSetError, useFormContext } from 'react-hook-form';

export function PageFormSetError<TFieldValues extends FieldValues = FieldValues>(props: {
  children: (setError: UseFormSetError<TFieldValues>) => ReactNode;
}) {
  const { setError } = useFormContext();
  return <>{props.children(setError)}</>;
}
