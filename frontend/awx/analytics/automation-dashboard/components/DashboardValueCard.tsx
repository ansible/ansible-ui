import { PageDashboardCard } from '@ansible/ansible-ui-framework';
import { Content, Flex, FlexItem } from '@patternfly/react-core';
import { DashboardValueCardProps } from '../types';
import { Link } from 'react-router-dom';

export function DashboardValueCard(props: DashboardValueCardProps) {
  const { id, title, help, value, linkText, to, valueSuffix } = props;

  return (
    <PageDashboardCard
      id={id}
      title={title}
      helpTitle={help ? title : undefined}
      help={help}
      width="sm"
      height="xs"
    >
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

        <span
          style={{ fontSize: 'xxx-large', fontWeight: '400', lineHeight: 1, marginTop: 'auto' }}
        >
          {!isNaN(value as number) ? value.toLocaleString() : value}
          {valueSuffix ? ` ${valueSuffix}` : ''}
        </span>
      </Flex>
    </PageDashboardCard>
  );
}
