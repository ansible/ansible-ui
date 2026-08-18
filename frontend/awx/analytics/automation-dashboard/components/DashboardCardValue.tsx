import { PageDashboardCardWidth } from '@ansible/ansible-ui-framework';
import { currencyFormatter } from '../../utilities/currencyFormatter';
import { DEFAULT_NUMBER_LOCALE } from '../constants/common';

export function getDashboardCardValueFontSize(
  value: string | number,
  width: PageDashboardCardWidth | undefined,
  sizes: { compact: string; expanded: string }
): string {
  if (typeof value !== 'number') {
    return 'large';
  }
  return width === 'xs' ? sizes.compact : sizes.expanded;
}

type DashboardCardValueDisplayProps = Readonly<{
  value: string | number;
  valueSuffix?: string;
  formatAsCurrency?: boolean;
  fontSize: string;
}>;

export function DashboardCardValueDisplay(props: DashboardCardValueDisplayProps) {
  const { value, valueSuffix, formatAsCurrency, fontSize } = props;

  let displayValue: string | number = value;
  if (typeof value === 'number') {
    displayValue = formatAsCurrency
      ? currencyFormatter(value)
      : value.toLocaleString(DEFAULT_NUMBER_LOCALE);
  }

  return (
    <span style={{ fontSize, fontWeight: '400', lineHeight: 1, marginTop: 'auto' }}>
      {displayValue}
      {valueSuffix ? ` ${valueSuffix}` : ''}
    </span>
  );
}
