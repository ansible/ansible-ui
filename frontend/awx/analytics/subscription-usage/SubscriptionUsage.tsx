import { CardBody, Flex, FlexItem, Text } from '@patternfly/react-core';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  IFilterState,
  PageDashboard,
  PageHeader,
  PageLayout,
  PageToolbar,
} from '../../../../framework';
import { PageDashboardCard } from '../../../../framework/PageDashboard/PageDashboardCard';
import { SubscriptionUsageChart } from '../subscription-usage/SubscriptionUsageChart';
import { useSubscriptionUsageFilters } from './useSubscriptionUsageFilters';
import { getItemKey } from '../../../common/crud/Data';
import { Settings } from '../../interfaces/Settings';
import { useGet } from '../../../common/crud/useGet';

interface ISubscriptionUsageChartData {
  count: number;
  results: [
    {
      id: number;
      date: string;
      license_capacity: number;
      license_consumed: number;
      hosts_added: number;
      hosts_deleted: number;
      indirectly_managed_hosts: number;
    },
  ];
}

export default function SubscriptionUsage() {
  const { t } = useTranslation();
  const toolbarFilters = useSubscriptionUsageFilters();
  const [dateRange, setDateRange] = useState<IFilterState>({ dateRange: ['year'] });
  const systemData = useGet<Settings>('/api/v2/settings/system/');
  const { data } = useGet<ISubscriptionUsageChartData>(`/api/v2/host_metric_summary_monthly/`);

  return (
    <PageLayout>
      <PageHeader
        title={t('Subscription usage')}
        titleHelpTitle={t('Subscription usage')}
        titleHelp={t(
          'A chart showing historical usage of your subscription. Subscription capacity and licenses consumed per month are displayed, with the ability to filter by the last year, two years, or three years.'
        )}
        description={t(
          'A chart showing historical usage of your subscription. Subscription capacity and licenses consumed per month are displayed, with the ability to filter by the last year, two years, or three years.'
        )}
      />
      <PageToolbar
        keyFn={getItemKey}
        itemCount={data?.count}
        toolbarFilters={toolbarFilters}
        setFilterState={setDateRange}
        filterState={dateRange}
        disableCardView
        disableListView
        disableTableView
        disablePagination
      />
      <PageDashboard>
        <PageDashboardCard
          title={t('Subscription Compliance')}
          width="xxl"
          height="xl"
          headerControls={
            <Flex spaceItems={{ default: 'spaceItemsNone' }} style={{ gap: 8 }}>
              <FlexItem>
                <Text component="small">
                  Last recalculation date:{' '}
                  {systemData.data !== undefined
                    ? systemData.data.HOST_METRIC_SUMMARY_TASK_LAST_TS.slice(0, 10)
                    : null}
                </Text>
              </FlexItem>
            </Flex>
          }
        >
          <CardBody>
            <SubscriptionUsageChart period={dateRange} />
          </CardBody>
        </PageDashboardCard>
      </PageDashboard>
    </PageLayout>
  );
}
