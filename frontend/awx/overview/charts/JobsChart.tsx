import { Bullseye, Spinner } from '@patternfly/react-core';
import { useTranslation } from 'react-i18next';
import useSWR from 'swr';
import { PageDashboardChart } from '../../../../framework/PageDashboard/PageDashboardChart';
import { usePageChartColors } from '../../../../framework/PageDashboard/usePageChartColors';
import { useGetPageUrl } from '../../../../framework/PageNavigation/useGetPageUrl';
import { awxAPI } from '../../common/api/awx-utils';
import { UnifiedJob } from '../../interfaces/UnifiedJob';
import { AwxRoute } from '../../main/AwxRoutes';

export type UnifiedJobSummary = Pick<UnifiedJob, 'id' | 'finished' | 'failed'>;

interface IJobChartData {
  jobs?: {
    failed: [number, number][];
    successful: [number, number][];
    canceled?: [number, number][];
    error?: [number, number][];
  };
}

export type DashboardJobPeriod = 'month' | 'two_weeks' | 'week' | 'day';
export type DashboardJobType = 'all' | 'inv_sync' | 'scm_update' | 'playbook_run';

export function JobsChart(props: {
  height?: number;
  period?: DashboardJobPeriod;
  jobType?: DashboardJobType;
}) {
  const getPageUrl = useGetPageUrl();

  const { t } = useTranslation();
  const { period, jobType } = props;

  const { data, isLoading } = useSWR<IJobChartData>(
    awxAPI`/dashboard/graphs/jobs/?job_type=${jobType ?? 'all'}&period=${period ?? 'month'}`,
    (url: string) => fetch(url).then((r) => r.json())
  );

  const reducer = (tuple: [number, number]) => {
    const date = new Date(tuple[0] * 1000);
    let label: string;
    switch (period) {
      case 'day':
        label = `${date.toLocaleTimeString()}`;
        break;
      default:
        label = `${date.getMonth() + 1}/${date.getDate()}`;
    }
    return { label, value: tuple[1] };
  };

  const failed = data?.jobs?.failed.map(reducer) ?? [];
  const successful = data?.jobs?.successful.map(reducer) ?? [];
  const canceled = data?.jobs?.canceled?.map(reducer) ?? [];
  const error = data?.jobs?.error?.map(reducer) ?? [];

  const { successfulColor, failedColor, errorColor, canceledColor } = usePageChartColors();

  if (isLoading)
    return (
      <Bullseye>
        <Spinner />
      </Bullseye>
    );

  return (
    <PageDashboardChart
      yLabel={t('Job count')}
      variant="stackedAreaChart"
      groups={[
        {
          label: t('Success'),
          color: successfulColor,
          values: successful,
          link: getPageUrl(AwxRoute.Jobs) + '?status=successful',
        },
        {
          label: t('Error'),
          color: errorColor,
          values: error,
          link: getPageUrl(AwxRoute.Jobs) + '?status=error',
        },
        {
          label: t('Failed'),
          color: failedColor,
          values: failed,
          link: getPageUrl(AwxRoute.Jobs) + '?status=failed',
        },
        {
          label: t('Canceled'),
          color: canceledColor,
          values: canceled,
          link: getPageUrl(AwxRoute.Jobs) + '?status=canceled',
        },
      ]}
      height={props.height}
    />
  );
}
