import { PageDashboardCard } from '@ansible/ansible-ui-framework';
import { Content, Flex, FlexItem } from '@patternfly/react-core';
import { DashboardValueCardProps } from '../types';
import { Link } from 'react-router-dom';
import { EmptyStateError } from '../../../../../framework/components/EmptyStateError';
import { currencyFormatter } from '../../utilities/currencyFormatter';

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
  } = props;

  const usFormat = 'en-US';

  const contentValue =
    typeof value === 'number' ? (
      <span style={{ fontSize: 'xx-large', fontWeight: '400', lineHeight: 1, marginTop: 'auto' }}>
        {formatAsCurrency ? currencyFormatter(value) : value.toLocaleString(usFormat)}
        {valueSuffix ? ` ${valueSuffix}` : ''}
      </span>
    ) : (
      <span style={{ fontSize: 'large', fontWeight: '400', lineHeight: 1, marginTop: 'auto' }}>
        {value}
        {valueSuffix ? ` ${valueSuffix}` : ''}
      </span>
    );

  const content = (
    <Flex
      style={{ height: '100%' }}
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
      width="sm"
      height="xs"
    >
      {error ? <EmptyStateError titleProp={errorStateTitle} message={error.message} /> : content}
    </PageDashboardCard>
  );
}
