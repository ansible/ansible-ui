import { clsx } from 'clsx';
import './FlexRow.css';

/** A flexible row container that allows for easy alignment and spacing of child elements. */
export function FlexRow(props: {
  children?: React.ReactNode;

  /** The vertical alignment of the child elements within the FlexRow. */
  align?: 'top' | 'center' | 'bottom' | 'baseline' | 'stretch';

  /** The horizontal spacing between child elements within the FlexRow. */
  spacing?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl';

  /** The horizontal alignment of the child elements within the FlexRow. */
  justify?: 'left' | 'middle' | 'right';

  /** Whether or not child elements should wrap to the next line when they exceed the width of the FlexRow. */
  wrap?: boolean;

  /** The vertical spacing between wrapped lines of child elements within the FlexRow. */
  wrapSpacing?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl';

  /** Whether or not the FlexRow should grow to fill available space. */
  grow?: boolean;

  /** Whether or not the FlexRow should take up the full width of its container. */
  fullWidth?: boolean;

  /** Whether or not the FlexRow should take up the full height of its container. */
  fullHeight?: boolean;
}) {
  return (
    <div
      className={clsx({
        'flex-row': true,
        'flex-wrap': props.wrap,
        'align-start': props.align === 'top',
        'align-center': props.align === 'center' || !props.align,
        'align-end': props.align === 'bottom',
        'align-baseline': props.align === 'baseline',
        'align-stretch': props.align === 'stretch',
        'justify-start': props.justify === 'left',
        'justify-center': props.justify === 'middle',
        'justify-end': props.justify === 'right',
        'gap-x-0': props.spacing === 'none',
        'gap-x-1': props.spacing === 'xs',
        'gap-x-2': props.spacing === 'sm',
        'gap-x-3': props.spacing === 'md',
        'gap-x-4': props.spacing === 'lg',
        'gap-x-5': props.spacing === 'xl',
        'gap-x-6': props.spacing === 'xxl',
        'gap-y-0': props.wrapSpacing === 'none',
        'gap-y-1': props.wrapSpacing === 'xs',
        'gap-y-2': props.wrapSpacing === 'sm',
        'gap-y-3': props.wrapSpacing === 'md',
        'gap-y-4': props.wrapSpacing === 'lg',
        'gap-y-5': props.wrapSpacing === 'xl',
        'gap-y-6': props.wrapSpacing === 'xxl',
        'flex-grow': props.grow,
        'full-width': props.fullWidth,
        'full-height': props.fullHeight,
      })}
    >
      {props.children}
    </div>
  );
}
