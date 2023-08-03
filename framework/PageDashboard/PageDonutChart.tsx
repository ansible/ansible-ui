import { ChartDonut, ChartDonutProps, ChartDonutUtilization } from '@patternfly/react-charts';
import { CardBody, Flex, FlexItem, Skeleton, Split, SplitItem } from '@patternfly/react-core';
import { PageChartContainer } from './PageChartContainer';
import { PageDashboardCard } from './PageDashboardCard';
import styled from 'styled-components';
import { pfDisabled } from '../components/pfcolors';
import { useTranslation } from 'react-i18next';

const FlexItemDiv = styled.div`
  width: 12px;
  height: 12px;
`;

export function PageDonutChart(
  props: Omit<ChartDonutProps, 'width' | 'height'> & { total: number }
) {
  const { t } = useTranslation();
  const { total } = props;
  if (total !== 0) {
    return (
      <PageChartContainer>
        {(size) => <ChartDonut {...props} width={size.width} height={size.height} />}
      </PageChartContainer>
    );
  } else {
    return (
      <PageChartContainer>
        {(size) => (
          <ChartDonutUtilization
            constrainToVisibleArea
            width={size.width}
            height={size.height}
            data={{ x: t('Resource'), y: total }}
            legendData={[{ name: t(`Total: ${total}`) }]}
            legendOrientation="vertical"
            colorScale={[pfDisabled]}
            title={total.toString()}
            padding={{ top: 0, left: 0, right: 0, bottom: 0 }}
          />
        )}
      </PageChartContainer>
    );
  }
}

export function PageDashboardDonutCard(props: {
  title: string;
  linkText?: string;
  to: string;
  items: { count: number; label: string; color: string }[];
  loading?: boolean;
}) {
  const { t } = useTranslation();
  const { title, items, loading } = props;
  const total = items.reduce((total, item) => total + item.count, 0);
  return (
    <PageDashboardCard title={title} width="sm" height="xs" linkText={props.linkText} to={props.to}>
      <CardBody>
        {loading === true ? (
          <Split hasGutter>
            <SplitItem>
              <Skeleton shape="circle" width="100px" />
            </SplitItem>
            <SplitItem style={{ marginTop: 'auto', marginBottom: 'auto' }}>
              <Flex direction={{ default: 'column' }} spaceItems={{ default: 'spaceItemsMd' }}>
                {items.map((item) => (
                  <FlexItem key={item.label}>
                    <Flex spaceItems={{ default: 'spaceItemsSm' }}>
                      <FlexItem>
                        <FlexItemDiv>
                          <Skeleton shape="square" width="12" height="12" />
                        </FlexItemDiv>
                      </FlexItem>
                      <FlexItem grow={{ default: 'grow' }}>
                        <Skeleton shape="square" width="70px" height="14px" />
                      </FlexItem>
                    </Flex>
                  </FlexItem>
                ))}
              </Flex>
            </SplitItem>
          </Split>
        ) : (
          <PageDonutChart
            ariaDesc={t('Dashboard resource count')}
            ariaTitle={t('Dashboard resource count')}
            constrainToVisibleArea
            data={items.map((item) => ({ x: item.label, y: item.count }))}
            title={total.toString()}
            colorScale={items.map((item) => item.color)}
            padding={{ top: 0, left: 0, right: 0, bottom: 0 }}
            legendData={items.map((item) => ({ name: `${item.label}: ${item.count}` }))}
            legendOrientation="vertical"
            legendPosition="right"
            total={total}
          />
        )}
      </CardBody>
    </PageDashboardCard>
  );
}
