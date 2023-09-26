import { clsx } from 'clsx';
import './FlexRow.css';

export function FlexRow(props: {
  children?: React.ReactNode;
  align?: 'top' | 'center' | 'bottom' | 'baseline' | 'stretch';
  spacing?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl';
  justify?: 'left' | 'middle' | 'right';
  wrap?: boolean;
  wrapSpacing?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl';
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
      })}
    >
      {props.children}
    </div>
  );
}
