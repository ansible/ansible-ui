import { PageDashboardCard } from '@ansible/ansible-ui-framework';
import { Flex } from '@patternfly/react-core';
import { DashboardValueCardProps } from '../types';

export function DashboardValueCard(props: DashboardValueCardProps) {
  const { id, title, help, value, linkText, to, valueSuffix } = props;

  return (
    <PageDashboardCard
      id={id}
      title={title}
      helpTitle={help ? title : undefined}
      help={help}
      width="md"
      height="xs"
      linkText={linkText}
      to={to}
    >
      <Flex style={{ height: '100%' }}>
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
