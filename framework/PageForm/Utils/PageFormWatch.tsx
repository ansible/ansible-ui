import { ReactNode } from 'react';
import { useWatch } from 'react-hook-form';

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
export function PageFormWatch<T>(props: { watch: string; children: (value: T) => ReactNode }) {
  const value = useWatch({ name: props.watch }) as T;
  return <>{props.children(value)}</>;
}
