import { Bullseye, Spinner } from '@patternfly/react-core';
import useSWR from 'swr';
import { IFilterState, useSettings } from '../../../../framework';
import { PageDashboardChart } from '../../../../framework/PageDashboard/PageDashboardChart';

interface ISubscriptionUsageChartData {
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

export function SubscriptionUsageChart(props: { period: IFilterState }) {
  const calculateDateRange = () => {
    const today = new Date();
    let date = '';
    switch (props.period.dateRange?.[0]) {
      case 'year':
        date =
          today.getMonth() < 10
            ? `${today.getFullYear() - 1}-0${today.getMonth() + 1}-01`
            : `${today.getFullYear() - 1}-${today.getMonth() + 1}-01`;
        break;
      case 'two_years':
        date =
          today.getMonth() < 10
            ? `${today.getFullYear() - 2}-0${today.getMonth() + 1}-01`
            : `${today.getFullYear() - 2}-${today.getMonth() + 1}-01`;
        break;
      case 'three_years':
        date =
          today.getMonth() < 10
            ? `${today.getFullYear() - 3}-0${today.getMonth() + 1}-01`
            : `${today.getFullYear() - 3}-${today.getMonth() + 1}-01`;
        break;
      default:
        date =
          today.getMonth() < 10
            ? `${today.getFullYear() - 1}-0${today.getMonth() + 1}-01`
            : `${today.getFullYear() - 1}-${today.getMonth() + 1}-01`;
        break;
    }
    return date;
  };

  const { data, isLoading } = useSWR<ISubscriptionUsageChartData>(
    `/api/v2/host_metric_summary_monthly/?date__gte=${calculateDateRange()}&order_by=date&page_size=100`,
    (url: string) => fetch(url).then((r) => r.json())
  );

  const dateFormatter = (date: string | undefined) => {
    const oldDate = date;
    const splitDate = oldDate?.split('-') ?? [];
    const newDate = splitDate[1] + '/' + splitDate[0];
    return newDate;
  };

  const capacity =
    data?.results.map(({ date, license_capacity }) => {
      return {
        label: dateFormatter(date),
        value: license_capacity,
      };
    }) ?? [];
  const consumed =
    data?.results.map(({ date, license_consumed, hosts_added, hosts_deleted }) => {
      return {
        label: dateFormatter(date),
        value: license_consumed,
        hosts_added: hosts_added,
        hosts_deleted: hosts_deleted,
      };
    }) ?? [];

  const { activeTheme } = useSettings();
  let capacityColor = 'var(--pf-chart-color-red-200)';
  if (activeTheme === 'dark') capacityColor = 'var(--pf-chart-color-red-300)';
  let consumedColor = 'var(--pf-chart-color-blue-200)';
  if (activeTheme === 'dark') consumedColor = 'var(--pf-chart-color-blue-300)';

  if (isLoading)
    return (
      <Bullseye>
        <Spinner />
      </Bullseye>
    );

  return (
    <PageDashboardChart
      groups={[
        { label: 'Subscriptions consumed', color: consumedColor, values: consumed },
        { label: 'Subscription capacity', color: capacityColor, values: capacity },
      ]}
      xLabel="Month"
      yLabel="Unique hosts"
      allowZero={true}
      useLines={true}
      onlyIntegerTicks={true}
    />
  );
}
