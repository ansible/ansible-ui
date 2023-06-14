import { CardBody, Flex, FlexItem, Title } from '@patternfly/react-core';
import { ArrowRightIcon } from '@patternfly/react-icons';
import { Link } from 'react-router-dom';
import { PageDashboardCard } from './PageDashboardCard';

export type PageDashboardCountBarProps = {
  counts: {
    title: string;
    count: number;
    to: string;
  }[];
};

export function PageDashboardCountBar(props: PageDashboardCountBarProps) {
  return (
    <PageDashboardCard width="xxl" isCompact>
      <CardBody>
        <Flex
          spaceItems={{ default: 'spaceItems2xl' }}
          style={{ rowGap: 16 }}
          justifyContent={{ default: 'justifyContentSpaceEvenly' }}
        >
          {props.counts.map((item) => (
            <FlexItem key={item.title}>
              <Flex
                alignItems={{ default: 'alignItemsCenter' }}
                spaceItems={{ default: 'spaceItemsMd' }}
              >
                <FlexItem>
                  <Title headingLevel="h3" size="xl">
                    {item.title}
                  </Title>
                </FlexItem>
                <FlexItem>
                  <span style={{ fontSize: 'xx-large', lineHeight: 1 }}>{item.count}</span>
                </FlexItem>
                <FlexItem>
                  <Link to={item.to}>
                    <ArrowRightIcon />
                  </Link>
                </FlexItem>
              </Flex>
            </FlexItem>
          ))}
        </Flex>
      </CardBody>
    </PageDashboardCard>
  );
}
