import { Bullseye, Spinner } from '@patternfly/react-core';
import useSWR from 'swr';
import { useSettings } from '../../../../framework';
import { PageDashboardChart } from '../../../../framework/PageDashboard/PageDashboardChart';
import { UnifiedJob } from '../../interfaces/UnifiedJob';

export type UnifiedJobSummary = Pick<UnifiedJob, 'id' | 'finished' | 'failed'>;

interface IJobChartData {
  jobs: {
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
  const { period, jobType } = props;

  const { data, isLoading } = useSWR<IJobChartData>(
    `/api/v2/dashboard/graphs/jobs/?job_type=${jobType ?? 'all'}&period=${period ?? 'month'}`,
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

  const failed = data?.jobs.failed.map(reducer) ?? [];
  const successful = data?.jobs.successful.map(reducer) ?? [];
  const canceled = data?.jobs.canceled?.map(reducer) ?? [];
  const error = data?.jobs.error?.map(reducer) ?? [];

  const { activeTheme } = useSettings();
  let successfulColor = 'var(--pf-chart-color-green-300)';
  if (activeTheme === 'dark') successfulColor = 'var(--pf-chart-color-green-300)';
  let failedColor = 'var(--pf-chart-color-red-200)';
  if (activeTheme === 'dark') failedColor = 'var(--pf-chart-color-red-300)';
  let errorColor = 'var(--pf-chart-color-red-100)';
  if (activeTheme === 'dark') errorColor = 'var(--pf-chart-color-red-200)';
  let canceledColor = 'var(--pf-chart-color-black-400)';
  if (activeTheme === 'dark') canceledColor = 'var(--pf-chart-color-black-400)';

  if (isLoading)
    return (
      <Bullseye>
        <Spinner />
      </Bullseye>
    );

  return (
    <PageDashboardChart
      groups={[
        { color: successfulColor, values: successful },
        { color: failedColor, values: failed },
        { color: errorColor, values: error },
        { color: canceledColor, values: canceled },
      ]}
    />
  );
}
