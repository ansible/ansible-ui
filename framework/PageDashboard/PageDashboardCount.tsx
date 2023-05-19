import { Bullseye, CardBody, Flex } from '@patternfly/react-core';
import { Link } from 'react-router-dom';
import { PageDashboardCard } from './PageDashboardCard';

export type PageDashboardCountProps = {
  title: string;
  linkText?: string;
  to?: string;
  count: number;
};

export function PageDashboardCount(props: PageDashboardCountProps) {
  return (
    <PageDashboardCard width="xs" height="xs">
      <CardBody>
        <Bullseye>
          <Flex
            direction={{ default: 'column' }}
            spaceItems={{ default: 'spaceItemsMd' }}
            alignItems={{ default: 'alignItemsCenter' }}
          >
            <span style={{ fontSize: 'xxx-large', lineHeight: 1 }}>{props.count}</span>
            <span style={{ fontSize: 'x-large', opacity: 0.7, lineHeight: 1 }}>
              <Link to={props.to ?? ''}>{props.title}</Link>
            </span>
          </Flex>
        </Bullseye>
      </CardBody>
    </PageDashboardCard>
  );
}
