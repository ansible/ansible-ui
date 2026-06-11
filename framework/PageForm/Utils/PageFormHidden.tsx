import { ReactNode } from 'react';
import { useWatch } from 'react-hook-form';

/**
 * A component that conditionally renders its children based on the value of a watched form field.
 *
 * This is used to dynamically drive the visibility of form fields.
 *
 * @template T The type of the watched form field.
 * @param {Object} props The component props.
 * @param {string} props.watch The name of the watched form field.
 * @param {(value: T) => boolean} props.hidden A function that determines whether to hide the children based on the watched form field value.
 * @param {ReactNode} props.children The children to render if not hidden.
 * @returns {JSX.Element} The rendered component.
 */
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
