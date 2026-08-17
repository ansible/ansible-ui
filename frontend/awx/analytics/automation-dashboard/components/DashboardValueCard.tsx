import { PageDashboardCard } from '@ansible/ansible-ui-framework';
import { Content, Flex, FlexItem } from '@patternfly/react-core';
import { DashboardValueCardProps } from '../types';
import { Link } from 'react-router-dom';
import { EmptyStateError } from '../../../../../framework/components/EmptyStateError';
import { DashboardCardValueDisplay, getDashboardCardValueFontSize } from './DashboardCardValue';

export function DashboardValueCard(props: DashboardValueCardProps) {
  const { id, title, help, value, linkText, to, valueSuffix, error, errorStateTitle, width } =
    props;

  const fontSize = getDashboardCardValueFontSize(value, width, {
    compact: 'x-large',
    expanded: 'xx-large',
  });

  const content = (
    <Flex
      style={{
        height: '100%',
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
      <DashboardCardValueDisplay value={value} valueSuffix={valueSuffix} fontSize={fontSize} />
    </Flex>
  );
  return (
    <PageDashboardCard
      id={id}
      title={title}
      helpTitle={help ? title : undefined}
      help={help}
      width={width ?? 'md'}
    >
      {error ? <EmptyStateError titleProp={errorStateTitle} message={error.message} /> : content}
    </PageDashboardCard>
  );
}
