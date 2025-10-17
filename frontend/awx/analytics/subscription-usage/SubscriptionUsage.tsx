import {
  IFilterState,
  PageDashboard,
  PageHeader,
  PageLayout,
  PageToolbar,
} from '@ansible/ansible-ui-framework';
import { PageDashboardCard } from '@ansible/ansible-ui-framework/PageDashboard/PageDashboardCard';
import { getItemKey } from '@ansible/common-ui/crud/Data';
import { useGet } from '@ansible/common-ui/crud/useGet';
import { Content, Flex, FlexItem } from '@patternfly/react-core';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { awxAPI } from '../../common/api/awx-utils';
import { Settings } from '../../interfaces/Settings';
import { SubscriptionUsageChart } from '../subscription-usage/SubscriptionUsageChart';
import { useSubscriptionUsageFilters } from './useSubscriptionUsageFilters';

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

export function SubscriptionUsage() {
  const { t } = useTranslation();
  const toolbarFilters = useSubscriptionUsageFilters();
  const [dateRange, setDateRange] = useState<IFilterState>({ dateRange: ['year'] });
  const systemData = useGet<Settings>(awxAPI`/settings/system/`);
  const { data } = useGet<ISubscriptionUsageChartData>(awxAPI`/host_metric_summary_monthly/`);

  return (
    <PageLayout>
      <PageHeader
        title={t('Subscription Usage')}
        titleHelpTitle={t('Subscription Usage')}
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
          height="md"
          headerControls={
            <Flex spaceItems={{ default: 'spaceItemsNone' }} style={{ gap: 8 }}>
              <FlexItem>
                <Content component="small">
                  Last recalculation date:{' '}
                  {systemData.data !== undefined &&
                  !!systemData.data.HOST_METRIC_SUMMARY_TASK_LAST_TS
                    ? systemData.data.HOST_METRIC_SUMMARY_TASK_LAST_TS.slice(0, 10)
                    : t('None')}
                </Content>
              </FlexItem>
            </Flex>
          }
        >
          <SubscriptionUsageChart period={dateRange} />
        </PageDashboardCard>
      </PageDashboard>
    </PageLayout>
  );
}
