import { ReactNode } from 'react';
import {
  FieldValues,
  Path,
  PathValue,
  UseFormSetError,
  useFormContext,
  useWatch,
} from 'react-hook-form';

/**
 * A component that watches for changes in a specific field using `useWatch` from `react-hook-form`.
 *
 * @template T The type of the watched field.
 * @param {Object} props The component props.
 * @param {string} props.watch The name of the field to watch.
 * @param {(value: T) => React.ReactNode} props.children A function that returns the ReactNode to render with the watched value.
 * @returns {JSX.Element} The JSX element representing the component.
 *
 * @note You can also use `useWatch` directly in your component.
 *
 * @example
 * <PageFormWatch<File | undefined> watch="file">
 *   {(file) => <div>{file?.name}</div>}
 * </PageFormWatch>
 */
export function PageFormWatch<
  TFieldValues extends FieldValues = FieldValues,
  TFieldName extends Path<TFieldValues> = Path<TFieldValues>,
  TValue = PathValue<TFieldValues, TFieldName>,
>(props: {
  watch: TFieldName;
  children: (value: TValue, setError: UseFormSetError<TFieldValues>) => ReactNode;
}) {
  const value = useWatch<TFieldValues, TFieldName>({ name: props.watch }) as TValue;
  const { setError } = useFormContext();
  return <>{props.children(value, setError)}</>;
}
