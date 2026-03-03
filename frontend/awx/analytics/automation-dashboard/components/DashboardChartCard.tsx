import { PageDashboardCard, PageDashboardChart } from '@ansible/ansible-ui-framework';
import { usePageChartColors } from '@ansible/ansible-ui-framework/PageDashboard/usePageChartColors';
import { Flex, FlexItem, Title } from '@patternfly/react-core';
import { DashboardChartCardProps } from '../types';

export function DashboardChartCard(props: DashboardChartCardProps) {
  const { id, title, help, summaryValue, values, variant } = props;
  const { blueColor } = usePageChartColors();

  return (
    <PageDashboardCard id={id} title={title} helpTitle={title} help={help} width="lg" height="lg">
      <Flex direction={{ default: 'row' }} style={{ height: '100%' }}>
        <FlexItem>
          <Title
            headingLevel="h2"
            style={{ fontSize: 'xxx-large', lineHeight: 1, fontWeight: 400 }}
          >
            {summaryValue || summaryValue === 0 ? summaryValue.toLocaleString() : '--'}
          </Title>
        </FlexItem>

        <FlexItem style={{ height: '90%', width: '100%' }}>
          <PageDashboardChart
            groups={[{ color: blueColor, values: values ?? [] }]}
            variant={variant}
            allowZero
            onlyIntegerTicks
            padding={{ right: 15, top: 15 }}
            showLegendCount={false}
          />
        </FlexItem>
      </Flex>
    </PageDashboardCard>
  );
}
