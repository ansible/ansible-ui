import {
  PageDashboardChart,
  PageDashboardChartVariant,
  PageDashboardChartVariantE,
} from '@ansible/ansible-ui-framework/PageDashboard/PageDashboardChart';
import { usePageChartColors } from '@ansible/ansible-ui-framework/PageDashboard/usePageChartColors';
import { useGetPageUrl } from '@ansible/ansible-ui-framework/PageNavigation/useGetPageUrl';
import { Bullseye, Spinner } from '@patternfly/react-core';
import { useTranslation } from 'react-i18next';
import useSWR from 'swr';
import { awxAPI } from '../../common/api/awx-utils';
import { UnifiedJob } from '../../interfaces/UnifiedJob';
import { AwxRoute } from '../../main/AwxRoutes';
import {
  alignJobChartSeriesByDay,
  mapJobChartTuples,
  type DashboardJobPeriod,
} from './jobsChartUtils';

export type UnifiedJobSummary = Pick<UnifiedJob, 'id' | 'finished' | 'failed'>;

interface IJobChartData {
  jobs?: {
    failed: [number, number][];
    successful: [number, number][];
    canceled?: [number, number][];
    error?: [number, number][];
  };
}

export type { DashboardJobPeriod };
export type DashboardJobType = 'all' | 'inv_sync' | 'scm_update' | 'playbook_run';

export function JobsChart(props: {
  height?: number;
  period?: DashboardJobPeriod;
  jobType?: DashboardJobType;
  variant?: PageDashboardChartVariant;
}) {
  const getPageUrl = useGetPageUrl();

  const { t } = useTranslation();
  const { period, jobType } = props;

  const { data, isLoading } = useSWR<IJobChartData>(
    awxAPI`/dashboard/graphs/jobs/?job_type=${jobType ?? 'all'}&period=${period ?? 'month'}`,
    (url: string) => fetch(url).then((r) => r.json())
  );

  const [successful, error, failed, canceled] = alignJobChartSeriesByDay([
    mapJobChartTuples(data?.jobs?.successful, period),
    mapJobChartTuples(data?.jobs?.error, period),
    mapJobChartTuples(data?.jobs?.failed, period),
    mapJobChartTuples(data?.jobs?.canceled, period),
  ]);

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
      variant={props.variant ?? PageDashboardChartVariantE.stackedAreaChart}
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
