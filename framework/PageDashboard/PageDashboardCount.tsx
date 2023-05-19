import { CardBody, Flex } from '@patternfly/react-core';
import { PageDashboardCard } from './PageDashboardCard';

export type PageDashboardCountProps = {
  title: string;
  linkText?: string;
  to?: string;
  count: number;
};

export function PageDashboardCount(props: PageDashboardCountProps) {
  return (
    <PageDashboardCard width="xs" height="xs" {...props}>
      <CardBody>
        <Flex
          direction={{ default: 'column' }}
          spaceItems={{ default: 'spaceItemsNone' }}
          alignItems={{ default: 'alignItemsCenter' }}
        >
          <span style={{ fontSize: 'xxx-large', lineHeight: 1.1 }}>{props.count}</span>
          <span style={{ fontSize: 'x-large', opacity: 0.7 }}>{props.title}</span>
        </Flex>
      </CardBody>
    </PageDashboardCard>
  );
}
