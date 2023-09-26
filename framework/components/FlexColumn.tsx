import { clsx } from 'clsx';
import './FlexColumn.css';

export function FlexColumn(props: {
  children?: React.ReactNode;
  justify?: 'left' | 'middle' | 'right' | 'stretch';
  align?: 'top' | 'center' | 'bottom';
  spacing?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl';
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
      })}
    >
      {props.children}
    </div>
  );
}
