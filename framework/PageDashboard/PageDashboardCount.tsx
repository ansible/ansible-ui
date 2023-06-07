import { Bullseye, CardBody, Flex, Title } from '@patternfly/react-core';
import { PageDashboardCard } from './PageDashboardCard';

export type PageDashboardCountProps = {
  title: string;
  linkText?: string;
  to?: string;
  count: number;
};

export function PageDashboardCount(props: PageDashboardCountProps) {
  const { title: title, ...rest } = props;
  return (
    <PageDashboardCard width="xxs" height="xs" {...rest}>
      <CardBody>
        <Bullseye>
          <Flex
            direction={{ default: 'column' }}
            spaceItems={{ default: 'spaceItemsSm' }}
            alignItems={{ default: 'alignItemsCenter' }}
          >
            <span style={{ fontSize: 'xxx-large', lineHeight: 1 }}>{props.count}</span>
            <Title headingLevel="h3" size="xl">
              {title}
            </Title>
          </Flex>
        </Bullseye>
      </CardBody>
    </PageDashboardCard>
  );
}
