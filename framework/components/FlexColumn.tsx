import { clsx } from 'clsx';
import './FlexColumn.css';

/** A flexible column container that allows for easy alignment and spacing of child elements. */
export function FlexColumn(props: {
  children?: React.ReactNode;

  /** The horizontal alignment of the child elements within the FlexColumn. */
  justify?: 'left' | 'middle' | 'right' | 'stretch';

  /** The vertical alignment of the child elements within the FlexColumn. */
  align?: 'top' | 'center' | 'bottom';

  /** The vertical spacing between child elements within the FlexColumn. */
  spacing?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl';

  /** Whether or not the FlexColumn should grow to fill available space. */
  grow?: boolean;

  /** Whether or not the FlexColumn should take up the full width of its container. */
  fullWidth?: boolean;

  /** Whether or not the FlexColumn should take up the full height of its container. */
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
