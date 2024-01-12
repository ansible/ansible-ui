import { Bullseye, Spinner } from '@patternfly/react-core';
import useSWR from 'swr';
import { IFilterState } from '../../../../framework';
import { PageDashboardChart } from '../../../../framework/PageDashboard/PageDashboardChart';
import { usePageChartColors } from '../../../../framework/PageDashboard/usePageChartColors';
import { awxAPI } from '../../common/api/awx-utils';

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
          today.getMonth() < 9
            ? `${today.getFullYear() - 1}-0${today.getMonth() + 1}-01`
            : `${today.getFullYear() - 1}-${today.getMonth() + 1}-01`;
        break;
      case 'two_years':
        date =
          today.getMonth() < 9
            ? `${today.getFullYear() - 2}-0${today.getMonth() + 1}-01`
            : `${today.getFullYear() - 2}-${today.getMonth() + 1}-01`;
        break;
      case 'three_years':
        date =
          today.getMonth() < 9
            ? `${today.getFullYear() - 3}-0${today.getMonth() + 1}-01`
            : `${today.getFullYear() - 3}-${today.getMonth() + 1}-01`;
        break;
      default:
        date =
          today.getMonth() < 9
            ? `${today.getFullYear() - 1}-0${today.getMonth() + 1}-01`
            : `${today.getFullYear() - 1}-${today.getMonth() + 1}-01`;
        break;
    }
    return date;
  };

  const { data, isLoading } = useSWR<ISubscriptionUsageChartData>(
    awxAPI`/host_metric_summary_monthly/?date__gte=${calculateDateRange()}&order_by=date&page_size=100`,
    (url: string) => fetch(url).then((r) => r.json())
  );

  const dateFormatter = (date: string | undefined) => {
    const oldDate = date;
    const splitDate = oldDate?.split('-') ?? [];
    const newDate = splitDate[1] + '/' + splitDate[0];
    return newDate;
  };

  const consumed =
    data !== undefined
      ? data.results.map(({ date, license_consumed }) => {
          return {
            label: dateFormatter(date),
            value: license_consumed,
          };
        })
      : [];

  const capacity =
    data !== undefined
      ? data.results.map(({ date, license_capacity }) => {
          return {
            label: dateFormatter(date),
            value: license_capacity,
          };
        })
      : [];

  const { blueColor, redColor } = usePageChartColors();

  if (isLoading)
    return (
      <Bullseye>
        <Spinner />
      </Bullseye>
    );

  return (
    <PageDashboardChart
      groups={[
        { label: 'Subscriptions consumed ', color: blueColor, values: consumed },
        { label: 'Subscription capacity', color: redColor, values: capacity },
      ]}
      xLabel="Month"
      yLabel="Unique hosts"
      variant="lineChart"
      allowZero
      onlyIntegerTicks
      padding={{ right: 15 }}
      showLegendCount={false}
    />
  );
}
