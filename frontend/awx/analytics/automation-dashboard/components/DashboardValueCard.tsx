import { PageDashboardCard } from '@ansible/ansible-ui-framework';
import { Content, Flex, FlexItem } from '@patternfly/react-core';
import { DashboardValueCardProps } from '../types';
import { Link } from 'react-router-dom';
import { EmptyStateError } from '../../../../../framework/components/EmptyStateError';
import { currencyFormatter } from '../../utilities/currencyFormatter';
import { DEFAULT_NUMBER_LOCALE } from '../constants/common';

function getSpanFontSize(
  isNested: DashboardValueCardProps['isNested'],
  width: DashboardValueCardProps['width']
): string {
  if (isNested) {
    return width === 'xs' ? 'large' : 'x-large';
  }
  return width === 'xs' ? 'x-large' : 'xx-large';
}

function getDisplayValue(
  value: DashboardValueCardProps['value'],
  formatAsCurrency: DashboardValueCardProps['formatAsCurrency']
): string | number {
  if (typeof value !== 'number') {
    return value;
  }
  return formatAsCurrency ? currencyFormatter(value) : value.toLocaleString(DEFAULT_NUMBER_LOCALE);
}

export function DashboardValueCard(props: DashboardValueCardProps) {
  const {
    id,
    title,
    help,
    value,
    linkText,
    to,
    valueSuffix,
    error,
    errorStateTitle,
    formatAsCurrency,
    width,
    isNested,
  } = props;

  const fontSize = typeof value === 'number' ? getSpanFontSize(isNested, width) : 'large';
  const displayValue = getDisplayValue(value, formatAsCurrency);

  const contentValue = (
    <span style={{ fontSize, fontWeight: '400', lineHeight: 1, marginTop: 'auto' }}>
      {displayValue}
      {valueSuffix ? ` ${valueSuffix}` : ''}
    </span>
  );

  const content = (
    <Flex
      style={{
        height: '100%',
        paddingTop: isNested ? 'var(--pf-t--global--spacer--md)' : undefined,
      }}
      spaceItems={{ default: 'spaceItemsLg' }}
      alignItems={{ default: 'alignItemsFlexStart' }}
      justifyContent={{ default: 'justifyContentFlexStart' }}
      direction={{ default: 'column' }}
    >
      {linkText && to && (
        <FlexItem>
          <Content data-cy="card-link-text" data-testid="card-link-text" component="small">
            <Link to={to}>{linkText}</Link>
          </Content>
        </FlexItem>
      )}
      {contentValue}
    </Flex>
  );
  return (
    <PageDashboardCard
      id={id}
      title={title}
      helpTitle={help ? title : undefined}
      help={help}
      width={width ?? 'md'}
      titleSize={isNested ? 'md' : 'xl'}
      isCompact={isNested}
    >
      {error ? <EmptyStateError titleProp={errorStateTitle} message={error.message} /> : content}
    </PageDashboardCard>
  );
}
