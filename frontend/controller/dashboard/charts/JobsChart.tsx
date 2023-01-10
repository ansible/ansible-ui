import { DateTime } from 'luxon';
import { useEffect, useMemo } from 'react';
import { pfDanger, pfSuccess } from '../../../../framework';
import { PageDashboardChart } from '../../../../framework/PageDashboard/PageDashboardChart';
import { UnifiedJob } from '../../interfaces/UnifiedJob';
import { useControllerView } from '../../useControllerView';

export function JobsChart(props: { height?: number }) {
  const jobsView = useControllerView<UnifiedJob>({
    url: '/api/v2/unified_jobs/',
    queryParams: {
      not__launch_type: 'sync',
      order_by: '-created',
      page_size: '200',
    },
    disableQueryString: true,
  });
  useEffect(() => {
    jobsView.setSort('created');
    jobsView.setSortDirection('desc');
    jobsView.setPerPage(200);
  }, [jobsView]);
  const jobs = jobsView.pageItems;
  const jobHistory = useMemo(() => {
    const success: Record<string, number> = {};
    const failure: Record<string, number> = {};
    const now = DateTime.now();
    const monthAgo = now.minus({ months: 1 });

    for (
      let iterator = now.minus({ months: 1 });
      iterator < now;
      iterator = iterator.plus({ day: 1 })
    ) {
      if (!iterator.isValid) continue;
      const label = iterator.toISODate();
      if (!success[label]) success[label] = 0;
      if (!failure[label]) failure[label] = 0;
    }

    for (const job of jobs ?? []) {
      const dateTime = DateTime.fromISO(job.finished);
      if (dateTime < monthAgo) continue;
      const date = DateTime.fromISO(job.finished);
      if (!date.isValid) continue;
      const label = date.toISODate();
      if (!success[label]) success[label] = 0;
      if (!failure[label]) failure[label] = 0;
      if (!job.failed) {
        success[label]++;
      } else {
        failure[label]++;
      }
    }
    return {
      successful: Object.keys(success)
        .sort()
        .map((label) => ({ label: label, value: success[label] })),
      failed: Object.keys(failure)
        .sort()
        .map((label) => ({
          label: label,
          value: failure[label],
        })),
    };
  }, [jobs]);
  return (
    <div style={{ height: props.height ?? '100%' }}>
      <PageDashboardChart
        groups={[
          { color: pfDanger, values: jobHistory.failed },
          { color: pfSuccess, values: jobHistory.successful },
        ]}
      />
    </div>
  );
}
