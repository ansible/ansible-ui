import { clsx } from 'clsx';

export function FlexRow(props: {
  children: React.ReactNode;
  verticalAlign?: 'center' | 'top' | 'bottom' | 'baseline';
  verticalGap?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl';
  horizontalAlign?: 'center' | 'left' | 'right';
  horizontalGap?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl';
  wrap?: boolean;
}) {
  return (
    <div
      className={clsx({
        'flex-row': true,
        baseline: props.align === 'baseline',
        center: props.align === 'center',
        top: props.align === 'top',
        bottom: props.align === 'bottom',
        wrap: props.wrap,
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
