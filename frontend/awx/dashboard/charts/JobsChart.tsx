import { Bullseye, Spinner } from '@patternfly/react-core';
import useSWR from 'swr';
import { pfDanger, pfSuccess } from '../../../../framework';
import { PageDashboardChart } from '../../../../framework/PageDashboard/PageDashboardChart';
import { UnifiedJob } from '../../interfaces/UnifiedJob';

export type UnifiedJobSummary = Pick<UnifiedJob, 'id' | 'finished' | 'failed'>;

interface IJobChartData {
  jobs: { failed: [number, number][]; successful: [number, number][] };
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

  if (isLoading)
    return (
      <Bullseye>
        <Spinner />
      </Bullseye>
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
  return (
    <div style={{ height: props.height ?? '100%' }}>
      <PageDashboardChart
        groups={[
          { color: pfDanger, values: failed },
          { color: pfSuccess, values: successful },
        ]}
      />
    </div>
  );
}
