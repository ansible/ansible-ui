import { clsx } from 'clsx';
import './FlexColumn.css';

/**
 * A flexbox container that arranges its children in a column.
 * @param {React.ReactNode} children - The children to be rendered inside the container.
 * @param {'left' | 'middle' | 'right' | 'stretch'} [justify] - The horizontal alignment of the children.
 * @param {'top' | 'center' | 'bottom'} [align] - The vertical alignment of the children.
 * @param {'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl'} [spacing] - The spacing between the children.
 * @param {boolean} [grow] - Whether the container should grow to fill available space.
 * @param {boolean} [fullWidth] - Whether the container should take up the full width of its parent.
 * @param {boolean} [fullHeight] - Whether the container should take up the full height of its parent.
 * @returns {JSX.Element} - The rendered flexbox container.
 */
export function FlexColumn(props: {
  children?: React.ReactNode;
  justify?: 'left' | 'middle' | 'right' | 'stretch';
  align?: 'top' | 'center' | 'bottom';
  spacing?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl';
  grow?: boolean;
  fullWidth?: boolean;
  fullHeight?: boolean;
}) {
  return (
    <div
      className={clsx({
        'flex-column': true,
        'align-start': props.justify === 'left',
        'align-center': props.justify === 'middle',
        'align-end': props.justify === 'right',
        'align-stretch': props.justify === 'stretch',
        'justify-start': props.align === 'top',
        'justify-center': props.align === 'center' ?? !props.align,
        'justify-end': props.align === 'bottom',
        'gap-0': props.spacing === 'none',
        'gap-1': props.spacing === 'xs',
        'gap-2': props.spacing === 'sm',
        'gap-3': props.spacing === 'md',
        'gap-4': props.spacing === 'lg',
        'gap-5': props.spacing === 'xl',
        'gap-6': props.spacing === 'xxl',
        'flex-grow': props.grow,
        'full-width': props.fullWidth,
        'full-height': props.fullHeight,
      })}
    >
      {props.children}
    </div>
  );
}
