import { PageDashboardCard, PageDashboardChart } from '@ansible/ansible-ui-framework';
import { Flex, FlexItem, Title } from '@patternfly/react-core';
import { DashboardChartCardProps, IDashboardChartItem } from '../types';
import { EmptyStateError } from '../../../../../framework/components/EmptyStateError';
import { useTranslation } from 'react-i18next';
import { DEFAULT_NUMBER_LOCALE } from '../constants/common';

export function DashboardChartCard(props: DashboardChartCardProps) {
  const { id, title, help, summaryValue, data, variant, error, errorStateTitle, legendLabel } =
    props;
  const { t } = useTranslation();
  const blueColor = 'var(--pf-t--chart--color--blue--300)';
  const mapChartItem = (
    chartItem: IDashboardChartItem,
    _index: number,
    _array: IDashboardChartItem[]
  ) => {
    const period = data.kind;
    const date = new Date(chartItem.label);
    if (Number.isNaN(date.getTime())) {
      return { label: chartItem.label, value: chartItem.value };
    }
    let label: string;
    switch (period) {
      case 'year':
        label = date.toLocaleString('default', { year: 'numeric' });
        break;
      case 'month':
        label = `${date.toLocaleString('default', { month: 'short' })} ${date.toLocaleString('default', { year: 'numeric' })}`;
        break;
      case 'day':
        label = `${date.toLocaleString('default', { day: '2-digit' })} ${date.toLocaleString('default', { month: 'short' })}`;
        break;
      case 'hour':
        label = `${date.toLocaleString('default', { hour: '2-digit' })}`;
        break;
      default:
        label = `${date.toLocaleString()}`;
    }
    const value = chartItem.value;
    return { label, value };
  };

  const values = data?.items?.map((item, index, array) => mapChartItem(item, index, array)) ?? [];
  const content = (
    <Flex direction={{ default: 'row' }} style={{ height: '100%' }}>
      <FlexItem>
        <Title headingLevel="h2" style={{ fontSize: 'xx-large', lineHeight: 1, fontWeight: 400 }}>
          {summaryValue || summaryValue === 0
            ? summaryValue.toLocaleString(DEFAULT_NUMBER_LOCALE)
            : '--'}
        </Title>
      </FlexItem>

      <FlexItem style={{ height: '90%', width: '100%' }}>
        <PageDashboardChart
          groups={[{ label: legendLabel ?? t('Count'), color: blueColor, values }]}
          variant={variant}
          allowZero
          onlyIntegerTicks
          padding={{ right: 15, top: 15 }}
          showLegendCount={false}
        />
      </FlexItem>
    </Flex>
  );
  return (
    <PageDashboardCard id={id} title={title} helpTitle={title} help={help} width="md" height="md">
      {error ? <EmptyStateError titleProp={errorStateTitle} message={error.message} /> : content}
    </PageDashboardCard>
  );
}
